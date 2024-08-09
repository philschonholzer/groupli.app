import assert from 'node:assert'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { describe, it } from 'vitest'
import { Next, NextNotFound, NextRedirect } from '../next'
import { NextCache } from '../next/next-cache'

describe('next services', () => {
	it('should revalidate path', () =>
		Effect.gen(function* () {
			yield* Next.revalidatePath('/group/1')
			const state = yield* NextCache.isRevalidated
			assert.equal(state, true)
		}).pipe(Effect.provide(Next.Nullable), Effect.runPromise))
	it('should short circuit to "not found"', () =>
		Effect.gen(function* () {
			const result = yield* Next.notFound.pipe(Effect.flip)
			assert.equal(result instanceof NextNotFound, true)
		}).pipe(Effect.provide(Next.Nullable), Effect.runPromise))
	it('should short circuit to "redirect"', () =>
		Effect.gen(function* () {
			const result = yield* Next.redirect('/other-route').pipe(Effect.flip)
			const isRedirect = result instanceof NextRedirect
			assert.equal(isRedirect, true)
			assert.equal(isRedirect && result.path, '/other-route')
		}).pipe(Effect.provide(Next.Nullable), Effect.runPromise))
})

describe('exit', () => {
	class NameRequired extends Schema.TaggedError<NameRequired>()(
		'NameRequiredError',
		{
			message: Schema.String,
		},
	) {}
	class DbError extends Schema.TaggedError<DbError>()('DbError', {
		message: Schema.String,
	}) {}

	const FailureSchema = Schema.Union(NameRequired, DbError)

	const ExitState = Schema.Exit({
		success: Schema.Void,
		failure: FailureSchema,
		defect: Schema.Void,
	})

	it('should return success', () => {
		const output = Effect.void.pipe(Effect.runSyncExit)
		const result = Schema.encodeSync(ExitState)(output)
		assert.deepStrictEqual(result, { _tag: 'Success', value: undefined })
	})
	it('should return failure', () => {
		const output = Effect.fail(new NameRequired({ message: 'Forgot name' })).pipe(
			Effect.runSyncExit,
		)
		const result = Schema.encodeSync(ExitState)(output)
		assert.deepStrictEqual(result, {
			_tag: 'Failure',
			cause: {
				_tag: 'Fail',
				error: {
					_tag: 'NameRequiredError',
					message: 'Forgot name',
				},
			},
		})
	})
	it('should be able to return different kind of failures', () => {
		const output = Effect.fail(new DbError({ message: 'Not available' })).pipe(
			Effect.runSyncExit,
		)
		const result = Schema.encodeSync(ExitState)(output)
		assert.deepStrictEqual(result, {
			_tag: 'Failure',
			cause: {
				_tag: 'Fail',
				error: {
					_tag: 'DbError',
					message: 'Not available',
				},
			},
		})
	})
})
