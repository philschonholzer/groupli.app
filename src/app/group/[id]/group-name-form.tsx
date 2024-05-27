'use client'

import { Input } from '@/components/ui/input'
import { H1 } from '@/components/ui/typography'
import { Check } from 'lucide-react'
import { useActionState } from 'react'
import { updateName } from './action'

export default function GroupNameForm(props: {
	group: {
		name: string
		id: string
	}
}) {
	const updateGroupName = updateName.bind(null, props.group.id)

	const [state, action] = useActionState(updateGroupName, { kind: 'idle' })
	return (
		<form action={action}>
			<H1>
				<label className="flex items-center gap-4">
					Group
					<Input
						className="text-4xl lg:text-5xl h-20"
						type="text"
						name="name"
						id=""
						defaultValue={props.group.name}
					/>
					{state.kind === 'success' && <Check className="text-primary" />}
				</label>
			</H1>
			<div className="text-right pt-2 text-red-600">
				{state.kind === 'error' && <p>{state.error}</p>}
			</div>
		</form>
	)
}
