import { bigint, boolean, pgSchema, smallint, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const app = pgSchema('app');

export const user = app.table('user', {
    id: bigint('id', { mode: 'bigint' }).notNull().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    name: text('name').notNull(),
    avatarHash: text('avatar_hash'),
    bannerHash: text('banner_hash'),
    accentColor: smallint('accent_color'),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const guild = app.table('guild', {
    id: bigint('id', { mode: 'bigint' }).notNull().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    name: text('name').notNull(),
    iconHash: text('icon_hash'),
    splashHash: text('splash_hash'),
});

export type Guild = typeof guild.$inferSelect;
export type NewGuild = typeof guild.$inferInsert;

export const permission = app.table(
    'permission',
    {
        guildId: bigint('guild_id', { mode: 'bigint' })
            .notNull()
            .references(() => guild.id, { onDelete: 'cascade' }),
        userId: bigint('user_id', { mode: 'bigint' })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        isAdmin: boolean('is_admin').notNull(),
    },
    table => [uniqueIndex('user_to_guild_unique_idx').on(table.userId, table.guildId)],
);

export type Permission = typeof permission.$inferSelect;
export type NewPermission = typeof permission.$inferInsert;

export const channel = app.table(
    'channel',
    {
        id: bigint('id', { mode: 'bigint' }).notNull().primaryKey(),
        guildId: bigint('guild_id', { mode: 'bigint' })
            .notNull()
            .references(() => guild.id, { onDelete: 'cascade' }),
        lastConfessionId: bigint('last_confession_id', { mode: 'bigint' }).notNull().default(0n),
        disabledAt: timestamp('disabled_at', { mode: 'date', withTimezone: true }),
        isApprovalRequired: boolean('is_approval_required').notNull().default(false),
        label: text('label').notNull().default('Confession'),
    },
    table => [uniqueIndex('guild_to_channel_unique_idx').on(table.guildId, table.id)],
);

export type Channel = typeof channel.$inferSelect;
export type NewChannel = typeof channel.$inferInsert;

export const confession = app.table('confession', {
    channelId: bigint('channel_id', { mode: 'bigint' }).notNull().unique(),
    // NOTE: The confession ID will be overwritten by a trigger at the database level.
    confessionId: bigint('confession_id', { mode: 'bigint' }).notNull().default(0n),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    author: bigint('author_id', { mode: 'bigint' })
        .notNull()
        .references(() => user.id),
    content: text('content').notNull(),
});

export type Confession = typeof confession.$inferSelect;
export type NewConfession = typeof confession.$inferInsert;
