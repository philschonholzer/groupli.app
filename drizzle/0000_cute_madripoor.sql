CREATE TABLE IF NOT EXISTS `Groups` (
	`Id` text PRIMARY KEY NOT NULL,
	`Name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Pairings` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Person1` integer NOT NULL,
	`Person2` integer NOT NULL,
	`Round` integer NOT NULL,
	FOREIGN KEY (`Person1`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Person2`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Round`) REFERENCES `Rounds`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Persons` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Name` text NOT NULL,
	`Group` text NOT NULL,
	`Color` text,
	`Status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`Group`) REFERENCES `Groups`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `PersonsInRounds` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Person` integer NOT NULL,
	`Rounds` integer NOT NULL,
	FOREIGN KEY (`Person`) REFERENCES `Persons`(`Id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`Rounds`) REFERENCES `Rounds`(`Id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Rounds` (
	`Id` integer PRIMARY KEY NOT NULL,
	`At` text NOT NULL,
	`Group` text NOT NULL,
	FOREIGN KEY (`Group`) REFERENCES `Groups`(`Id`) ON UPDATE no action ON DELETE no action
);
