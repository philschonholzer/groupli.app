import { getRequestContext } from '@cloudflare/next-on-pages'
import { Layer } from 'effect'
import { ConfigLive } from '../config'
import { Db } from '../db'
import { TracingLive } from '../tracing'
import { RepositoryLive } from './repository-layer'

const DbLive = Layer.suspend(() => Db.Live(getRequestContext().env.DB))

const AdapterLive = Layer.mergeAll(DbLive, TracingLive).pipe(
	Layer.provide(ConfigLive),
)

export const MainLive = Layer.provide(RepositoryLive, AdapterLive)
