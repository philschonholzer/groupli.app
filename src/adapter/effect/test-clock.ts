import { Clock, Duration, Effect } from 'effect'

const ClockSymbolKey = 'groupli/Clock'

const ClockTypeId: Clock.ClockTypeId = Symbol.for(
	ClockSymbolKey,
) as Clock.ClockTypeId

class ClockImpl implements Clock.Clock {
	readonly [ClockTypeId]: Clock.ClockTypeId = ClockTypeId

	readonly internalClock = Clock.make()

	millis = 1718969790332

	unsafeCurrentTimeMillis(): number {
		return this.millis
	}

	unsafeCurrentTimeNanos(): bigint {
		return this.internalClock.unsafeCurrentTimeNanos()
	}

	currentTimeMillis: Effect.Effect<number> = Effect.sync(() =>
		this.unsafeCurrentTimeMillis(),
	)

	currentTimeNanos: Effect.Effect<bigint> = Effect.sync(() =>
		this.unsafeCurrentTimeNanos(),
	)

	scheduler(): Effect.Effect<Clock.ClockScheduler> {
		throw new Error('Method not implemented.')
	}

	sleep(duration: Duration.Duration): Effect.Effect<void> {
		this.millis += Duration.toMillis(duration)
		return Effect.void
	}
}

/** @internal */
export const make = (): Clock.Clock => new ClockImpl()
