import type { Layer } from 'effect'
import { TracingLive } from '../tracing'

export const MainLive = TracingLive
export type MainLive = Layer.Layer.Success<typeof MainLive>
