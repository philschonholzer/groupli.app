import { Context, Effect, Layer, Ref } from 'effect'
import { revalidatePath } from 'next/cache'

const makeCacheImpl = Effect.gen(function* () {
	return {
		revalidatePath: (path: string) => Effect.sync(() => revalidatePath(path)),
		isRevalidated: Effect.succeed(false),
	}
})
const makeCacheStub = Effect.gen(function* () {
	const ref = yield* Ref.make({ isRevalidated: false })
	return {
		revalidatePath: (_path: string) =>
			Ref.update(ref, () => ({
				isRevalidated: true,
			})) as Effect.Effect<undefined>,
		isRevalidated: Ref.get(ref).pipe(Effect.map((s) => s.isRevalidated)),
	}
})

export class NextCache extends Context.Service<
	NextCache,
	{
		revalidatePath: (path: string) => Effect.Effect<void>
		isRevalidated: Effect.Effect<boolean>
	}
>()('@dep/next') {
	static layer = Layer.effect(this, makeCacheImpl)
	static Stub = Layer.effect(this, makeCacheStub)
	static isRevalidated = this.use((cache) => cache.isRevalidated)
}
