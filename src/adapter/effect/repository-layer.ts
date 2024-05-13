import { Group, Pairing, Person, Round } from '@/domain'
import { Layer } from 'effect'

export const repositoryLayer = Layer.mergeAll(
	Person.Repository.Live,
	Group.Repository.Live,
	Pairing.Repository.Live,
	Round.Repository.Live,
)

export type RepositoryLayer = Layer.Layer.Success<typeof repositoryLayer>
