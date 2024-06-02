import { Layer } from 'effect'
import { Db } from '../db'
import { TracingLive } from '../tracing'
import { ConfigLive } from '../config'
import { RepositoryLive } from './repository-layer'

const AdapterLive = Layer.mergeAll(Db.Live, TracingLive).pipe(
	Layer.provide(ConfigLive),
)
export const MainLive = Layer.provide(RepositoryLive, AdapterLive)
