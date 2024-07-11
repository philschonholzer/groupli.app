import { Schema } from '@effect/schema'
import { Effect, Layer } from 'effect'
import { NextCache } from './next-cache'

export class NextRedirect extends Schema.TaggedError<NextRedirect>()(
	'NextRedirect',
	{ path: Schema.String },
) {}

export class NextNotFound extends Schema.TaggedError<NextNotFound>()(
	'NextNotFound',
	{},
) {}

const make = Effect.gen(function* () {
	const nextCache = yield* NextCache

	return {
		notFound: new NextNotFound(),
		revalidatePath: (path: string) => nextCache.revalidatePath(path),
		redirect: (path: string) => new NextRedirect({ path }),
	}
})

export class Next extends Effect.Tag('@adapter/next')<
	Next,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make).pipe(Layer.provide(NextCache.Live))
	static Nullable = Layer.effect(this, make).pipe(
		Layer.provideMerge(NextCache.Stub),
	)
}
