import type { PersonId, Status } from '@/domain/person'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Persons = sqliteTable('Persons', {
	id: integer('Id').$type<PersonId>().primaryKey(),
	name: text('Name').notNull(),
	group: text('Group')
		.notNull()
		.references(() => Groups.id),
	color: text('Color'),
	status: text('Status', { enum: ['active', 'inactive'] })
		.notNull()
		.default('active'),
})

export type Person = typeof Persons.$inferSelect

export const Groups = sqliteTable('Groups', {
	id: text('Id').primaryKey(),
	name: text('Name').notNull(),
})

export const Rounds = sqliteTable('Rounds', {
	id: integer('Id').primaryKey(),
	at: text('At').notNull(),
	group: text('Group')
		.notNull()
		.references(() => Groups.id),
})
export const roundsRelations = relations(Rounds, ({ one, many }) => ({
	personsInRounds: many(PersonsInRounds),
	pairings: many(Pairings),
}))

export const PersonsInRounds = sqliteTable('PersonsInRounds', {
	id: integer('Id').primaryKey(),
	person: integer('Person')
		.$type<PersonId>()
		.notNull()
		.references(() => Persons.id),
	round: integer('Rounds')
		.notNull()
		.references(() => Rounds.id),
})

export const personsInRoundsRelations = relations(
	PersonsInRounds,
	({ one }) => ({
		person: one(Persons, {
			fields: [PersonsInRounds.person],
			references: [Persons.id],
		}),
		user: one(Rounds, {
			fields: [PersonsInRounds.round],
			references: [Rounds.id],
		}),
	}),
)

export const Pairings = sqliteTable('Pairings', {
	id: integer('Id').primaryKey(),
	person1: integer('Person1')
		.$type<PersonId>()
		.notNull()
		.references(() => Persons.id),
	person2: integer('Person2')
		.$type<PersonId>()
		.notNull()
		.references(() => Persons.id),
	round: integer('Round')
		.notNull()
		.references(() => Rounds.id),
})

export const pairingRelations = relations(Pairings, ({ one, many }) => ({
	person1: one(Persons, {
		fields: [Pairings.person1],
		references: [Persons.id],
	}),
	person2: one(Persons, {
		fields: [Pairings.person2],
		references: [Persons.id],
	}),
	round: one(Rounds, {
		fields: [Pairings.round],
		references: [Rounds.id],
	}),
}))
