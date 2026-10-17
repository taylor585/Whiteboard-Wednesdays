CREATE TABLE `topic_points` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`done` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `topic_points_topic_idx` ON `topic_points` (`topic_id`,`position`);--> statement-breakpoint
CREATE TABLE `topic_sources` (
	`topic_id` text NOT NULL,
	`video_id` text NOT NULL,
	`added_at` text NOT NULL,
	PRIMARY KEY(`topic_id`, `video_id`)
);
--> statement-breakpoint
CREATE INDEX `topic_sources_video_idx` ON `topic_sources` (`video_id`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`record_date` text,
	`post_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_record_date_unique` ON `topics` (`record_date`);--> statement-breakpoint
ALTER TABLE `videos` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Save as topic replaces Save idea: every saved idea becomes a New topic with its video as the source.
INSERT OR IGNORE INTO `topics` (`id`,`title`,`status`,`notes`,`created_at`,`updated_at`) SELECT 'saved-' || s.`id`, v.`title`, 'new', '', s.`saved_at`, s.`saved_at` FROM `saved_ideas` s JOIN `videos` v ON v.`id` = s.`id`;--> statement-breakpoint
INSERT OR IGNORE INTO `topic_sources` (`topic_id`,`video_id`,`added_at`) SELECT 'saved-' || s.`id`, s.`id`, s.`saved_at` FROM `saved_ideas` s JOIN `videos` v ON v.`id` = s.`id`;
