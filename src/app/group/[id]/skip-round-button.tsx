import type { PersonId } from '@/domain/person'
import { removePersonFromRound } from './action'

export function SkipRoundButton(props: {
	personId: PersonId
	roundId: number
	groupId: string
}) {
	return (
		<button
			type="submit"
			formAction={async () => {
				'use server'
				await removePersonFromRound(
					props.personId,
					props.roundId,
					props.groupId,
				)
			}}
		>
			✕
		</button>
	)
}
