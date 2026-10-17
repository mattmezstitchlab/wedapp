CREATE TABLE `workspace_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`payload` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_snapshots_eventId_unique` UNIQUE(`eventId`)
);
