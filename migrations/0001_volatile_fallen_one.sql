CREATE TABLE `passkey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`publicKey` text NOT NULL,
	`userId` text NOT NULL,
	`credentialID` text NOT NULL,
	`counter` integer NOT NULL,
	`deviceType` text NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `twoFactor` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`secret` text,
	`backupCodes` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `user` ADD `twoFactorEnabled` integer;