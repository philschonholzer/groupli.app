// @ts-nocheck
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../src/adapter/db/schema'
import {
	Groups,
	Pairings,
	Persons,
	PersonsInRounds,
	Rounds,
} from '../src/adapter/db/schema'
import { TEST_GROUP_ID } from './constants'

const DB_PATH = process.env.DB_URL || 'data.sqlite'

// Initialize database
const sqlite = new Database(DB_PATH)
const db = drizzle(sqlite, {
	schema,
	casing: 'snake_case',
})

// Run migrations
migrate(db, { migrationsFolder: 'drizzle' })

// Seed test data
function seed() {
	// Delete existing test data for this group in the correct order (respecting foreign keys)
	// First, find all persons in this group to delete related data
	const testGroupPersons = db
		.select({ id: Persons.id })
		.from(Persons)
		.where(eq(Persons.group, TEST_GROUP_ID))
		.all()
	const personIds = testGroupPersons.map((p) => p.id)

	// Find all rounds for this group
	const testGroupRounds = db
		.select({ id: Rounds.id })
		.from(Rounds)
		.where(eq(Rounds.group, TEST_GROUP_ID))
		.all()
	const roundIds = testGroupRounds.map((r) => r.id)

	// Delete in correct order
	// 1. Delete pairings related to these persons or rounds
	for (const personId of personIds) {
		db.delete(Pairings).where(eq(Pairings.person1, personId)).run()
		db.delete(Pairings).where(eq(Pairings.person2, personId)).run()
	}

	// 2. Delete persons in rounds for these persons
	for (const personId of personIds) {
		db.delete(PersonsInRounds).where(eq(PersonsInRounds.person, personId)).run()
	}

	// 3. Delete rounds for this group
	db.delete(Rounds).where(eq(Rounds.group, TEST_GROUP_ID)).run()

	// 4. Delete persons in this group
	db.delete(Persons).where(eq(Persons.group, TEST_GROUP_ID)).run()

	// 5. Delete the group
	db.delete(Groups).where(eq(Groups.id, TEST_GROUP_ID)).run()

	// Create test group
	// @ts-expect-error - Type branding issue
	db.insert(Groups)
		.values({
			id: TEST_GROUP_ID,
			name: 'E2E Test Group',
		})
		.run()

	// Create test persons
	const testPersons = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']

	for (const name of testPersons) {
		// @ts-expect-error - Type branding issue
		db.insert(Persons)
			.values({
				name,
				group: TEST_GROUP_ID,
				status: 'active',
			})
			.run()
	}

	console.log('✓ Database seeded successfully')
	console.log(`✓ Test group ID: ${TEST_GROUP_ID}`)
	console.log(`✓ Created ${testPersons.length} test persons`)

	// Output the group ID for use in tests
	process.stdout.write(TEST_GROUP_ID)
}

try {
	seed()
	sqlite.close()
	process.exit(0)
} catch (error) {
	console.error('Error seeding database:', error)
	sqlite.close()
	process.exit(1)
}
