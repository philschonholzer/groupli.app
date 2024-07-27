import { Group, Pairing, Person, Round } from '@/domain'
import { Layer } from 'effect'

export const RepositoryLayer = Layer.mergeAll(
	Person.Repository.Layer,
	Group.Repository.Layer,
	Pairing.Repository.Layer,
	Round.Repository.Layer,
)
