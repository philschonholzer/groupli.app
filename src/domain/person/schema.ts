import { Brand, Schema } from 'effect'

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
