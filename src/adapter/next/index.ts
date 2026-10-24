import { Context, Effect, Layer, Schema } from 'effect'
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
		notFound: Effect.fail(new NextNotFound()),
		revalidatePath: (path: string) => nextCache.revalidatePath(path),
		redirect: (path: string) => Effect.fail(new NextRedirect({ path })),
	}
})

export class Next extends Context.Service<
	Next,
	{
		notFound: Effect.Effect<never, NextNotFound>
		revalidatePath: (path: string) => Effect.Effect<void>
		redirect: (path: string) => Effect.Effect<never, NextRedirect>
	}
>()('@adapter/next') {
	static Live = Layer.effect(this, make).pipe(Layer.provide(NextCache.layer))
	static Nullable = Layer.effect(this, make).pipe(
		Layer.provideMerge(NextCache.Stub),
	)
	static revalidatePath = (path: string) =>
		this.use((next) => next.revalidatePath(path))
	static redirect = (path: string) => this.use((next) => next.redirect(path))
	static notFound = this.use((next) => next.notFound)
}
