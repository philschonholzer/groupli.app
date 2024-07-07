import { Effect, Layer, Ref } from 'effect'
import { revalidatePath } from 'next/cache'

const makeCacheImpl = Effect.gen(function* () {
	return {
		revalidatePath: (path: string) => Effect.sync(() => revalidatePath(path)),
		isRevalidated: Effect.succeed(false),
	}
})
const makeCacheTestImpl = Effect.gen(function* () {
	const ref = yield* Ref.make({ isRevalidated: false })
	return {
		revalidatePath: (path: string) =>
			Ref.update(ref, () => ({ isRevalidated: true })),
		isRevalidated: Ref.get(ref).pipe(Effect.map((s) => s.isRevalidated)),
	}
})

export class NextCache extends Effect.Tag('@dep/next')<
	NextCache,
	Effect.Effect.Success<typeof makeCacheImpl>
>() {
	static Live = Layer.effect(this, makeCacheImpl)
	static Test = Layer.effect(this, makeCacheTestImpl)
}
