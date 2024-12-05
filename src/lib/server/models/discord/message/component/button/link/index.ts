import { type InferOutput, literal, object } from 'valibot';

import {
    MessageComponentButtonBase,
    MessageComponentButtonStyle,
} from '$lib/server/models/discord/message/component/button/base';
import { MessageComponentType } from '$lib/server/models/discord/message/component/base';
import { Url } from '$lib/server/models/url';

export const MessageComponentButtonLink = object({
    ...MessageComponentButtonBase.entries,
    type: literal(MessageComponentType.Button),
    style: literal(MessageComponentButtonStyle.Link),
    url: Url,
});

export type MessageComponentButtonLink = InferOutput<typeof MessageComponentButtonLink>;
