import { Brand, Context, Effect, Layer } from 'effect'
import { nanoid } from 'nanoid'

type UuidString = Brand.Branded<string, 'UuidString'>
const UuidString = Brand.nominal<UuidString>()

const makeNanoidMock = () => {
	let count = 0
	return () => `test-uuid-${count++}`
}
export class NanoId extends Context.Tag('NanoId')<NanoId, typeof nanoid>() {
	static Live = Layer.succeed(this, nanoid)
	static Stub = Layer.succeed(this, makeNanoidMock())
}

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
