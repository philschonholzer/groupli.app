import { Context, Layer } from 'effect'
import { nanoid } from 'nanoid'

const makeNanoidMock = () => {
	let count = 0
	return <T extends string>(): T => `test-uuid-${count++}` as T
}
export class NanoId extends Context.Service<NanoId, typeof nanoid>()('NanoId') {
	static layer = Layer.succeed(this, nanoid)
	static Stub = Layer.succeed(this, makeNanoidMock())
}
