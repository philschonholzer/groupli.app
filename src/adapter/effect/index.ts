import { Cause, Effect, Exit, Schema } from 'effect'
import { ConfigError } from 'effect/Config'
import { notFound, redirect } from 'next/navigation'
import { DbError } from '../db'
import { NextNotFound, NextRedirect } from '../next'
import { TracingLive } from '../tracing'
import type { MainLive } from './main-layer'
import runtime from './runtime'

export const run = <A>(effect: Effect.Effect<A, never, MainLive>) => {
	return effect.pipe(
		Effect.withSpan('run'),
		Effect.catchDefect((defect) => {
			console.error(defect)
			return Effect.die(defect)
		}),
		Effect.provide(TracingLive),
		runtime.runPromise,
	)
}

type ExitSchema<A, E> = Schema.Constraint & {
	readonly Type: Exit.Exit<A, E>
}

// Overload for when returnVoid is true
export function runAction<A, E, S extends ExitSchema<A, E>>(props: {
	schema: S
	returnVoid: true
}): (
	effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
) => Promise<void>

// Overload for when returnVoid is false or not provided
export function runAction<A, E, S extends ExitSchema<A, E>>(props: {
	schema: S
	returnVoid?: false
}): (
	effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
) => Promise<S['Iso'] | { readonly _tag: 'Idle' }>

// Implementation
export function runAction<A, E, S extends ExitSchema<A, E>>(props: {
	schema: S
	returnVoid?: boolean
}) {
	return (
		effect: Effect.Effect<A, E | NextRedirect | NextNotFound, MainLive>,
	) => {
		const toIso = Schema.toIso(props.schema)
		return effect
			.pipe(
				Effect.withSpan('action'),
				Effect.catchDefect((defect) => {
					console.error(defect)
					return Effect.die(defect)
				}),
				Effect.provide(TracingLive),
				runtime.runPromiseExit,
			)
			.then((result) => {
				handleRedirectOrNotFound(result)
				return toIso.get(result as S['Type']) as
					| S['Iso']
					| { readonly _tag: 'Idle' }
			})
	}
}

function handleRedirectOrNotFound<A, E>(
	result: Exit.Exit<A, ConfigError | NextNotFound | NextRedirect | E>,
) {
	if (Exit.isFailure(result)) {
		const failReason = result.cause.reasons.find(Cause.isFailReason)
		const error = failReason?.error
		if (error instanceof NextRedirect) {
			redirect(error.path)
		}
		if (error instanceof NextNotFound) {
			notFound()
		}
		if (!isExpectedFailure(result.cause)) {
			console.error(`Error in result:\n${Cause.pretty(result.cause)}`)
		}
	}
}

// Domain failures such as invalid user input are reported back to the form
// and are not worth logging. Defects, interrupts, database and config errors are.
function isExpectedFailure(cause: Cause.Cause<unknown>) {
	return cause.reasons.every(
		(reason) =>
			Cause.isFailReason(reason) &&
			!(reason.error instanceof DbError) &&
			!(reason.error instanceof ConfigError),
	)
}
