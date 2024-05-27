import { Button } from '@/components/ui/button'
import type { PersonId } from '@/domain/person'
import { CircleArrowOutUpRight } from 'lucide-react'
import { removePersonFromRound } from './action'

export function SkipRoundButton(props: {
	personId: PersonId
	roundId: number
	groupId: string
}) {
	const removePerson = removePersonFromRound.bind(
		null,
		props.personId,
		props.roundId,
		props.groupId,
	)
	return (
		<div className="text-right -mb-1 -mr-2 hidden group-hover:block">
			<form className="inline-block" action={removePerson}>
				<Button
					variant="ghost"
					type="submit"
					className="text-primary text-xs flex gap-2 px-2 h-8"
					title="Skip Round"
				>
					Skip <CircleArrowOutUpRight strokeWidth={3} size={14} />
				</Button>
			</form>
		</div>
	)
}
