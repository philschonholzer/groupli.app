import { Group, Pairing, Person } from '@/domain'
import { Layer } from 'effect'

export const repositoryLayer = Layer.mergeAll(
	Person.Repository.Live,
	Group.Repository.Live,
	Pairing.Repository.Live,
)

export type RepositoryLayer = Layer.Layer.Success<typeof repositoryLayer>
