'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { GroupId } from '@/domain/group'
import type { PersonId } from '@/domain/person'
import { CircleArrowOutUpRight } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { removePersonFromRound } from './action'

export function SkipRoundButton(props: {
	personId: PersonId
	roundId: number
	groupId: GroupId
}) {
	const removePerson = removePersonFromRound.bind(
		null,
		props.personId,
		props.roundId,
		props.groupId,
	)
	const [state, action] = useActionState(removePerson, { _tag: 'Idle' })
	const { toast } = useToast()

	useEffect(() => {
		if (state._tag === 'Failure') {
			toast({
				title: 'Too few people in round',
				description: 'You need at least 3 people in a round to skip it.',
				variant: 'destructive',
				duration: 6000,
			})
		}
	}, [state, toast])

	return (
		<div className="text-right -mb-1 -mr-2 hidden group-hover:block">
			<form className="inline-block" action={action}>
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
