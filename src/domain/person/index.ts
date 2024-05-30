import { Schema } from '@effect/schema'
import { Brand, Effect } from 'effect'
import { Round } from '..'
import { Repository } from './repository'

export * from './repository'

export type PersonId = Brand.Branded<number, 'PersonId'>
export const PersonId = Brand.nominal<PersonId>()

export class Person extends Schema.Class<Person>('Person')({
	id: Schema.Number.pipe(Schema.fromBrand(PersonId)),
	name: Schema.String,
	color: Schema.NullOr(Schema.String),
}) {}

export const addPerson = (name: string, groupId: string) =>
	Effect.gen(function* () {
		const personsInGroup = yield* Repository.getByGroupId(groupId)
		if (personsInGroup.length >= 14) {
			return yield* new TooManyPersonsInGroup()
		}
		const person = yield* Repository.insert(name, groupId)
		const round = yield* Round.getCurrentRound(groupId)
		return yield* Round.Repository.addPersonToRound(person.id, round.id)
	})

export const skipRound = (personId: number) => {
	throw new Error('Not implemented')
}

export class TooManyPersonsInGroup extends Schema.TaggedError<TooManyPersonsInGroup>()(
	'TooManyPersonsInGroup',
	{},
) {}
