import { type Brand, Effect, Layer } from 'effect'
import { nanoid } from 'nanoid'

type UuidString = Brand.Branded<string, 'UuidString'>

const make = {
	id: (size: number) =>
		Effect.sync(() => nanoid(size)) as Effect.Effect<UuidString>,
}

export class Uuid extends Effect.Tag('@adapter/uuid')<
	Uuid,
	{ id: (size: number) => Effect.Effect<UuidString> }
>() {
	static Live = Layer.succeed(this, make)
	static Stub = Layer.succeed(this, {
		id: () => Effect.sync(() => 'test-uuid') as Effect.Effect<UuidString>,
	})
}
