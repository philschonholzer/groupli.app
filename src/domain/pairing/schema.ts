import { Schema } from 'effect'
import * as PersonSchema from '../person/schema'

export const PairEntity = Schema.Struct({
	id: Schema.Number,
	person1: PersonSchema.Person,
	person2: PersonSchema.Person,
})
export type PairEntity = typeof PairEntity.Type
export type Pair = [
	person1: PersonSchema.PersonId,
	person2: PersonSchema.PersonId,
]
export type PairList = Pair[]
