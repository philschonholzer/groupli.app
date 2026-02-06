import { Brand, Schema } from 'effect'
import * as PairingSchema from '../pairing/schema'
import * as PersonSchema from '../person/schema'

export type RoundId = Brand.Branded<number, 'RoundId'>
export const RoundId = Brand.nominal<RoundId>()

export const Round = Schema.Struct({
	id: Schema.Number.pipe(Schema.fromBrand(RoundId)),
	group: Schema.String,
	at: Schema.String,
})

export const RoundExtended = Schema.Struct({
	...Round.fields,
	persons: Schema.Array(PersonSchema.Person),
	pairings: Schema.Array(PairingSchema.PairEntity),
})
export type RoundExtended = typeof RoundExtended.Type
