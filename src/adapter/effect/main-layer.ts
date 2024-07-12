import { Layer } from 'effect'
// import { TracingLive } from '../tracing'

export const MainLive = Layer.empty
export type MainLive = Layer.Layer.Success<typeof MainLive>
