import { NameRequired } from '@/app/group/[id]/errors'
import { Schema } from '@effect/schema'
import { Brand, Effect } from 'effect'
import { Round } from '..'
import { Repository } from './repository'

export * from './repository'

export type PersonId = Brand.Branded<number, 'PersonId'>
export const PersonId = Brand.nominal<PersonId>()
export const Status = Schema.Literal('active', 'inactive')
export type Status = typeof Status.Type

export const Person = Schema.Struct({
	id: Schema.Number.pipe(Schema.fromBrand(PersonId)),
	name: Schema.String,
	color: Schema.NullOr(Schema.String),
	status: Status,
})
export type Person = typeof Person.Type

export const add = (name: string, groupId: string) =>
	Effect.gen(function* () {
		const personsInGroup = yield* Repository.getByGroupId(groupId)
		if (personsInGroup.length >= 14) {
			return yield* new TooManyPersonsInGroup()
		}
		const person = yield* Repository.insert(name, groupId)
		const round = yield* Round.getCurrentRound(groupId)
		return yield* Round.Repository.addPersonToRound(person.id, round.id)
	})

export const rename = (personId: PersonId, newName: string | null) =>
	Effect.gen(function* () {
		if (!newName) {
			return yield* new NameRequired({
				message: 'The name can not be empty... 😅',
			})
		}
		yield* Repository.updateName(personId, newName)
	})

export const removePerson = (personId: PersonId) =>
	Effect.gen(function* () {
		yield* Repository.setInactive(personId)
	})

export const skipRound = (personId: number) => {
	throw new Error('Not implemented')
}

export class TooManyPersonsInGroup extends Schema.TaggedError<TooManyPersonsInGroup>()(
	'TooManyPersonsInGroup',
	{},
) {}
