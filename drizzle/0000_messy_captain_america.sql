DROP TABLE IF EXISTS `Groups`;

DROP TABLE IF EXISTS `History`;

DROP TABLE IF EXISTS `Persons`;

CREATE TABLE `Groups` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Name` text NOT NULL,
	`SessionId` text NOT NULL,
	`LastSessionAt` text NOT NULL
);

--> statement-breakpoint
CREATE TABLE `Pairings` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Person1` integer NOT NULL,
	`Person2` integer NOT NULL,
	`At` text NOT NULL,
	FOREIGN KEY (`Person1`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Person2`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE TABLE `Persons` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Name` text NOT NULL,
	`Group` integer NOT NULL,
	`Color` text,
	FOREIGN KEY (`Group`) REFERENCES `Groups`(`Id`) ON UPDATE no action ON DELETE no action
);