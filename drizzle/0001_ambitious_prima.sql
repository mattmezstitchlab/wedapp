CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`actorId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`payload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`momentId` int NOT NULL,
	`vendorId` int NOT NULL,
	`serviceId` int,
	`responsibility` varchar(240),
	`startTime` varchar(20),
	`endTime` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`vendorId` int,
	`name` varchar(240) NOT NULL,
	`storageKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('couple','planner','vendor') NOT NULL DEFAULT 'couple',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`timeLabel` varchar(20) NOT NULL,
	`subtitle` varchar(180),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `needs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`category` varchar(80) NOT NULL,
	`label` varchar(180) NOT NULL,
	`isReady` int NOT NULL DEFAULT 0,
	CONSTRAINT `needs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`vendorId` int NOT NULL,
	`amountCents` int NOT NULL DEFAULT 0,
	`kind` enum('deposit','balance','other') NOT NULL DEFAULT 'deposit',
	`paidAt` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`vendorId` int NOT NULL,
	`amountCents` int NOT NULL DEFAULT 0,
	`status` varchar(80),
	`documentId` int,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`priceCents` int NOT NULL DEFAULT 0,
	`sharedPackageKey` varchar(120),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`detail` text,
	`dueLabel` varchar(80),
	`category` varchar(80),
	`done` int NOT NULL DEFAULT 0,
	`urgent` int NOT NULL DEFAULT 0,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`status` enum('À rechercher','À contacter','Devis demandé','Option','Réservé','Payé') NOT NULL DEFAULT 'À rechercher',
	`priceCents` int NOT NULL DEFAULT 0,
	`availability` varchar(240),
	`contactName` varchar(160),
	`contactPhone` varchar(40),
	`notes` text,
	`photoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wedding_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`location` varchar(240),
	`budgetCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_events_id` PRIMARY KEY(`id`)
);
