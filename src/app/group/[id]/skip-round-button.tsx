'use client'

import { CircleArrowOutUpRight } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { Group, Person, Round } from '@/domain'
import { removePersonFromRound } from './action'

export function SkipRoundButton(props: {
	personId: Person.PersonId
	roundId: Round.RoundId
	groupId: Group.GroupId
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
		<div className="-mr-2 -mb-1 hidden text-right group-hover:block">
			<form className="inline-block" action={action}>
				<Button
					variant="ghost"
					type="submit"
					className="flex h-8 gap-2 px-2 text-primary text-xs"
					title="Skip Round"
				>
					Skip <CircleArrowOutUpRight strokeWidth={3} size={14} />
				</Button>
			</form>
		</div>
	)
}
