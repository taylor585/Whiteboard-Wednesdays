import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const creators = sqliteTable('creators', {
 handle:text('handle').primaryKey(), name:text('name').notNull(), channelId:text('channel_id'), playlistId:text('playlist_id'), lastSuccess:text('last_success'), error:text('error'), leaseUntil:integer('lease_until').notNull().default(0),
});
export const videos = sqliteTable('videos', {
 id:text('id').primaryKey(), handle:text('handle').notNull(), creator:text('creator').notNull(), title:text('title').notNull(), publishedAt:text('published_at').notNull(), thumbnail:text('thumbnail').notNull(), refreshedAt:text('refreshed_at').notNull(),
});
export const savedIdeas = sqliteTable('saved_ideas', {id:text('id').primaryKey(), savedAt:text('saved_at').notNull()});
