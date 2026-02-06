import { Layer } from 'effect'
import { Group, Pairing, Person, Round } from '@/domain'

export const RepositoryLayer = Layer.mergeAll(
	Person.Repository.Layer,
	Group.Repository.Layer,
	Pairing.Repository.Layer,
	Round.Repository.Layer,
)
