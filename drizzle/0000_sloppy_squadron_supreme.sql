DROP TABLE IF EXISTS `Pairings`;
DROP TABLE IF EXISTS `Persons`;
DROP TABLE IF EXISTS `Groups`;

CREATE TABLE `Groups` (
	`Id` text PRIMARY KEY NOT NULL,
	`Name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Persons` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Name` text NOT NULL,
	`Group` text NOT NULL,
	`Color` text,
	FOREIGN KEY (`Group`) REFERENCES `Groups`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Sessions` (
	`Id` integer PRIMARY KEY NOT NULL,
	`At` text NOT NULL,
	`Group` text NOT NULL,
	FOREIGN KEY (`Group`) REFERENCES `Groups`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Pairings` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Person1` integer NOT NULL,
	`Person2` integer NOT NULL,
	`Session` integer NOT NULL,
	FOREIGN KEY (`Person1`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Person2`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Session`) REFERENCES `Sessions`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `PersonsInSessions` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Person` integer NOT NULL,
	`Session` integer NOT NULL,
	FOREIGN KEY (`Person`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Session`) REFERENCES `Sessions`(`Id`) ON UPDATE no action ON DELETE no action
);
