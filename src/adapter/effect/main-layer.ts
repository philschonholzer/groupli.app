import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Resource } from '@effect/opentelemetry/Resource'
import { Layer } from 'effect'
import { ConfigLive } from '../config'
import { Db } from '../db'
import { Next } from '../next'
import { Uuid } from '../uuid'
import { RepositoryLive } from './repository-layer'

const DbLive = Layer.suspend(() => Db.Live(getRequestContext().env.DB))

const AdapterLive = Layer.mergeAll(Uuid.Live, Next.Live).pipe(
	Layer.provide(ConfigLive),
)

const RepositoryLayer = Layer.provide(RepositoryLive, DbLive)
export const MainLive = Layer.provideMerge(RepositoryLayer, AdapterLive)
export type MainLive = Exclude<Layer.Layer.Success<typeof MainLive>, Resource>
