import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'

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
})

describe('exit', () => {
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
