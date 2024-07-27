import type { Resource } from '@effect/opentelemetry/Resource'
import { Layer } from 'effect'
import { Db } from '../db'
import { Next } from '../next'
import { Uuid } from '../uuid'
import { RepositoryLayer } from './repository-layer'

// TODO: Provide Next layer only to actions
const AdapterLive = Layer.mergeAll(Uuid.Live, Next.Live)
const RepositoryLive = Layer.provide(RepositoryLayer, Db.Live)
export const MainLive = Layer.provideMerge(RepositoryLive, AdapterLive)
export type MainLive = Exclude<Layer.Layer.Success<typeof MainLive>, Resource>
