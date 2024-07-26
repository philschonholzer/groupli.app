import { Brand, Effect, Layer } from 'effect'
import { NanoId } from './nanoid'

type UuidString = Brand.Branded<string, 'UuidString'>
const UuidString = Brand.nominal<UuidString>()

const make = Effect.gen(function* () {
	const nanoid = yield* NanoId
	return {
		id: (size: number) => Effect.sync(() => UuidString(nanoid(size))),
	}
})

export class Uuid extends Effect.Tag('@adapter/uuid')<
	Uuid,
	{ id: (size: number) => Effect.Effect<UuidString> }
>() {
	static Live = Layer.effect(this, make).pipe(Layer.provide(NanoId.Live))
	static Nullable = Layer.effect(this, make).pipe(Layer.provide(NanoId.Stub))
}
