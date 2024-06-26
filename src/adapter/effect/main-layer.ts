import { getRequestContext } from '@cloudflare/next-on-pages'
import { Layer } from 'effect'
import { ConfigLive } from '../config'
import { Db } from '../db'
import { TracingLive } from '../tracing'
import { Uuid } from '../uuid'
import { RepositoryLive } from './repository-layer'
import type { Resource } from '@effect/opentelemetry/Resource'

const DbLive = Layer.suspend(() => Db.Live(getRequestContext().env.DB))

const AdapterLive = Layer.mergeAll(TracingLive, Uuid.Live).pipe(
	Layer.provide(ConfigLive),
)

const RepositoryLayer = Layer.provide(RepositoryLive, DbLive)
export const MainLive = Layer.provideMerge(RepositoryLayer, AdapterLive)
export type MainLive = Exclude<Layer.Layer.Success<typeof MainLive>, Resource>
