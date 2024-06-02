import { Group, Pairing, Person, Round } from '@/domain'
import { Layer } from 'effect'

export const RepositoryLive = Layer.mergeAll(
	Person.Repository.Live,
	Group.Repository.Live,
	Pairing.Repository.Live,
	Round.Repository.Live,
)

export type RepositoryLive = Layer.Layer.Success<typeof RepositoryLive>
