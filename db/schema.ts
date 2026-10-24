import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const creators = sqliteTable('creators', {
 handle:text('handle').primaryKey(), name:text('name').notNull(), channelId:text('channel_id'), playlistId:text('playlist_id'), lastSuccess:text('last_success'), error:text('error'), leaseUntil:integer('lease_until').notNull().default(0),
});
export const videos = sqliteTable('videos', {
 id:text('id').primaryKey(), handle:text('handle').notNull(), creator:text('creator').notNull(), title:text('title').notNull(), description:text('description').notNull().default(''), publishedAt:text('published_at').notNull(), thumbnail:text('thumbnail').notNull(), refreshedAt:text('refreshed_at').notNull(),
});
// Kept so earlier saved ideas are never lost; they are copied into topics by migration 0001.
export const savedIdeas = sqliteTable('saved_ideas', {id:text('id').primaryKey(), savedAt:text('saved_at').notNull()});
// Topics follow PROCESS.md: one topic per Wednesday or Friday recording slot.
export const topics = sqliteTable('topics', {
 id:text('id').primaryKey(), title:text('title').notNull(), status:text('status').notNull().default('new'), notes:text('notes').notNull().default(''),
 recordDate:text('record_date'), postDate:text('post_date'), deckId:text('deck_id'), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(),
}, t => [uniqueIndex('topics_record_date_unique').on(t.recordDate)]);
export const topicSources = sqliteTable('topic_sources', {
 topicId:text('topic_id').notNull(), videoId:text('video_id').notNull(), addedAt:text('added_at').notNull(),
}, t => [primaryKey({columns:[t.topicId,t.videoId]}), index('topic_sources_video_idx').on(t.videoId)]);
export const topicPoints = sqliteTable('topic_points', {
 id:text('id').primaryKey(), topicId:text('topic_id').notNull(), position:integer('position').notNull(), title:text('title').notNull(), note:text('note').notNull().default(''), done:integer('done').notNull().default(0),
}, t => [index('topic_points_topic_idx').on(t.topicId, t.position)]);
