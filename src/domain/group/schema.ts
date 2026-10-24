import { Brand, Schema } from 'effect'

export type GroupId = Brand.Branded<string, 'GroupId'>
export const GroupId = Brand.nominal<GroupId>()

export const Group = Schema.Struct({
	id: Schema.String.pipe(Schema.fromBrand('GroupId', GroupId)),
	name: Schema.NonEmptyString,
})
