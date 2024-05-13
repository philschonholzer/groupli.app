ALTER TABLE `PersonsInSessions` RENAME TO `PersonsInRounds`;
ALTER TABLE `Sessions` RENAME TO `Rounds`;
ALTER TABLE `Pairings` RENAME COLUMN `Session` TO `Round`;
ALTER TABLE `PersonsInRounds` RENAME COLUMN `Session` TO `Rounds`;