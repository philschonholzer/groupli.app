import { Cause, type ConfigError, Effect, Exit, Schema } from 'effect'
import { notFound, redirect } from 'next/navigation'
import { NextNotFound, NextRedirect } from '../next'
import { TracingLive } from '../tracing'
import type { MainLive } from './main-layer'
import runtime from './runtime'

export const run = <A>(effect: Effect.Effect<A, never, MainLive>) => {
	return effect.pipe(
		Effect.withSpan('run'),
		Effect.catchAllDefect((defect) => {
			console.error(defect)
			return Effect.die(defect)
		}),
		Effect.provide(TracingLive),
		runtime.runPromise,
	)
}

// Overload for when returnVoid is true
export function runAction<A, E, SI extends object>(props: {
	schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
	returnVoid: true
}): (
	effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
) => Promise<void>

// Overload for when returnVoid is false or not provided
export function runAction<A, E, SI extends object>(props: {
	schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
	returnVoid?: false
}): (
	effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
) => Promise<
	Schema.Schema.Encoded<typeof props.schema> | { readonly _tag: 'Idle' }
>

// Implementation
export function runAction<A, E, SI extends object>(props: {
	schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
	returnVoid?: boolean
}) {
	return (
		effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
	) => {
		const parse = Schema.encodeUnknownSync(props.schema)
		return effect
			.pipe(
				Effect.withSpan('action'),
				Effect.catchAllDefect((defect) => {
					console.error(defect)
					return Effect.die(defect)
				}),
				Effect.provide(TracingLive),
				runtime.runPromiseExit,
			)
			.then((result) => {
				handleRedirectOrNotFound(result)
				const parsed = parse(result)
				return parsed as typeof parsed | { readonly _tag: 'Idle' } | undefined
			})
	}
}

function handleRedirectOrNotFound<A, E>(
	result: Exit.Exit<
		A,
		ConfigError.ConfigError | NextNotFound | NextRedirect | E
	>,
) {
	if (Exit.isFailure(result) && Cause.isFailType(result.cause)) {
		if (result.cause.error instanceof NextRedirect) {
			redirect(result.cause.error.path)
		}
		if (result.cause.error instanceof NextNotFound) {
			notFound()
		}
		console.error('Error in result:', result)
	}
}
