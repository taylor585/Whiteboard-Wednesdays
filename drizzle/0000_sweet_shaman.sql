CREATE TABLE `creators` (
	`handle` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`channel_id` text,
	`playlist_id` text,
	`last_success` text,
	`error` text,
	`lease_until` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`saved_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`creator` text NOT NULL,
	`title` text NOT NULL,
	`published_at` text NOT NULL,
	`thumbnail` text NOT NULL,
	`refreshed_at` text NOT NULL
);
