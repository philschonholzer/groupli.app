import { SchemaError } from '@/app/group/[id]/errors'
import { Schema } from '@effect/schema'
import type { ParseError } from '@effect/schema/ParseResult'
import { Cause, type ConfigError, Effect, Exit } from 'effect'
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

export const runAction =
	<A, E, SI extends object>(props: {
		schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
	}) =>
	(
		effect: Effect.Effect<
			A,
			E | NextRedirect | NextNotFound | ParseError,
			MainLive
		>,
	) => {
		const parse = Schema.encodeUnknownSync(props.schema)
		return effect
			.pipe(
				Effect.catchTag('ParseError', (e) => {
					return Effect.fail(new SchemaError({ message: e.message }))
				}),
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
				return parsed as typeof parsed | { readonly _tag: 'Idle' }
			})
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
	}
}
