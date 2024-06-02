import { Layer } from 'effect'
import { Db } from '../db'
import { TracingLive } from '../tracing'
import { ConfigLive } from '../config'
import { RepositoryLive } from './repository-layer'
import { getRequestContext } from '@cloudflare/next-on-pages'

const DbLive = Layer.suspend(() => Db.Live(getRequestContext().env.DB))

const AdapterLive = Layer.mergeAll(DbLive, TracingLive).pipe(
	Layer.provide(ConfigLive),
)

export const MainLive = Layer.provide(RepositoryLive, AdapterLive)
