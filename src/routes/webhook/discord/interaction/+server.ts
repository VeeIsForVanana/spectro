import { DISCORD_PUBLIC_KEY } from '$lib/server/env/discord';

import assert, { fail } from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import {
    Interaction,
    type InteractionCallback,
    InteractionCallbackType,
    InteractionType,
} from '$lib/server/models/discord/interaction';

import { error, json } from '@sveltejs/kit';
import { parse } from 'valibot';
import { verifyAsync } from '@noble/ed25519';

import type { Database } from '$lib/server/database/index';
import { handleConfess } from './confess';

async function handleInteraction(
    db: Database,
    timestamp: Date,
    interaction: Interaction,
): Promise<InteractionCallback> {
    // TODO: Update the server metadata.
    switch (interaction.type) {
        case InteractionType.Ping:
            return { type: InteractionCallbackType.Pong };
        case InteractionType.ApplicationCommand:
            switch (interaction.data.name) {
                case 'confess':
                    assert(typeof interaction.channel_id !== 'undefined');
                    assert(typeof interaction.member?.user !== 'undefined');
                    assert(typeof interaction.data.options !== 'undefined');
                    return {
                        type: InteractionCallbackType.ChannelMessageWithSource,
                        data: {
                            content: await handleConfess(
                                db,
                                timestamp,
                                interaction.channel_id,
                                interaction.member.user.id,
                                interaction.data.options,
                            ),
                        },
                    };
                default:
                    fail(`unexpected application command name ${interaction.data.name}`);
                    break;
            }
            break;
        default:
            fail(`unexpected interaction type ${interaction.type}`);
            break;
    }
}

export async function POST({ locals: { db }, request }) {
    assert(typeof db !== 'undefined');

    const ed25519 = request.headers.get('X-Signature-Ed25519');
    if (ed25519 === null) error(400);

    const timestamp = request.headers.get('X-Signature-Timestamp');
    if (timestamp === null) error(400);

    // Used for validating the update time in interactions
    const datetime = new Date(Number.parseInt(timestamp, 10) * 1000);

    const contentType = request.headers.get('Content-Type');
    if (contentType === null || contentType !== 'application/json') error(400);

    const text = await request.text();
    const message = Buffer.from(timestamp + text);
    const signature = Buffer.from(ed25519, 'hex');

    const isVerified = await verifyAsync(signature, message, DISCORD_PUBLIC_KEY);
    if (!isVerified) error(401);

    const interaction = parse(Interaction, JSON.parse(text));
    return json(await handleInteraction(db, datetime, interaction));
}
