import { Brand, Context, Effect, Layer } from 'effect'
import { NanoId } from './nanoid'

type UuidString = Brand.Branded<string, 'UuidString'>
const UuidString = Brand.nominal<UuidString>()

const make = Effect.gen(function* () {
	const nanoid = yield* NanoId
	return {
		id: (size: number) => Effect.sync(() => UuidString(nanoid(size))),
	}
})

export class Uuid extends Context.Service<
	Uuid,
	{ id: (size: number) => Effect.Effect<UuidString> }
>()('@adapter/uuid') {
	static layer = Layer.effect(this, make).pipe(Layer.provide(NanoId.layer))
	static Nullable = Layer.effect(this, make).pipe(Layer.provide(NanoId.Stub))
	static id = (size: number) => this.use((uuid) => uuid.id(size))
}
