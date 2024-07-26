import { Context, Layer } from 'effect'
import { nanoid } from 'nanoid'

const makeNanoidMock = () => {
	let count = 0
	return () => `test-uuid-${count++}`
}
export class NanoId extends Context.Tag('NanoId')<NanoId, typeof nanoid>() {
	static Live = Layer.succeed(this, nanoid)
	static Stub = Layer.succeed(this, makeNanoidMock())
}
