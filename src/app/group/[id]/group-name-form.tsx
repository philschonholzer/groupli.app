'use client'

import { Input } from '@/components/ui/input'
import { H1 } from '@/components/ui/typography'
import type { GroupId } from '@/domain/group'
import { Check } from 'lucide-react'
import { useActionState } from 'react'
import { renameGroup } from './action'

export default function GroupNameForm(props: {
	group: {
		name: string
		id: GroupId
	}
}) {
	const rename = renameGroup.bind(null, props.group.id)

	const [state, action] = useActionState(rename, { _tag: 'Idle' })
	return (
		<form action={action}>
			<H1>
				<label className="flex items-center gap-4">
					Group
					<Input
						className="h-20 text-4xl lg:text-5xl"
						type="text"
						name="name"
						id=""
						defaultValue={props.group.name}
					/>
					{state._tag === 'Success' && <Check className="text-primary" />}
				</label>
			</H1>
			<div className="pt-2 text-right text-red-600">
				{state._tag === 'Failure' && state.cause._tag === 'Fail' && (
					<p>
						{(state.cause.error._tag === 'SchemaError' ||
							state.cause.error._tag === 'NameRequiredError') &&
							state.cause.error.message}
					</p>
				)}
			</div>
		</form>
	)
}
