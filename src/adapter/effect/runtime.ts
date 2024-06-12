import { type ConfigError, type Layer, ManagedRuntime } from 'effect'
import { MainLive } from './main-layer'

type LiveLayers = Layer.Layer.Success<typeof MainLive>
type Runtime = ManagedRuntime.ManagedRuntime<
	LiveLayers,
	ConfigError.ConfigError
>

let runtime: Runtime
export function getRuntime() {
	if (!runtime) {
		runtime = ManagedRuntime.make(MainLive)
	}
	return runtime
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
declare const globalThis: {
	runtimeGlobal: Runtime
} & typeof global

runtime = globalThis.runtimeGlobal ?? getRuntime()

export default runtime

globalThis.runtimeGlobal = runtime
