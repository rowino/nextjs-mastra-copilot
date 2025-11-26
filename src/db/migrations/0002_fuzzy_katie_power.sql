CREATE TABLE `dataset` (
	`id` text PRIMARY KEY NOT NULL,
	`orgId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tableName` text NOT NULL,
	`schema` text NOT NULL,
	`sampleData` text,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dataset_org_id_idx` ON `dataset` (`orgId`);--> statement-breakpoint
CREATE TABLE `dashboard` (
	`id` text PRIMARY KEY NOT NULL,
	`orgId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dashboard_org_id_idx` ON `dashboard` (`orgId`);--> statement-breakpoint
CREATE TABLE `widget` (
	`id` text PRIMARY KEY NOT NULL,
	`dashboardId` text NOT NULL,
	`orgId` text NOT NULL,
	`datasetId` text,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`position` integer NOT NULL,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`dashboardId`) REFERENCES `dashboard`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`datasetId`) REFERENCES `dataset`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `widget_dashboard_id_idx` ON `widget` (`dashboardId`);--> statement-breakpoint
CREATE INDEX `widget_org_id_idx` ON `widget` (`orgId`);--> statement-breakpoint
CREATE TABLE `automation` (
	`id` text PRIMARY KEY NOT NULL,
	`orgId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `automation_org_id_idx` ON `automation` (`orgId`);--> statement-breakpoint
CREATE TABLE `automationRun` (
	`id` text PRIMARY KEY NOT NULL,
	`automationId` text NOT NULL,
	`orgId` text NOT NULL,
	`status` text NOT NULL,
	`result` text,
	`error` text,
	`executedAt` integer NOT NULL,
	FOREIGN KEY (`automationId`) REFERENCES `automation`(`id`) ON UPDATE no action ON DELETE cascade
);