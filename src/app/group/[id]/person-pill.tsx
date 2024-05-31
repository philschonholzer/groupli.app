'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { H3 } from '@/components/ui/typography'
import type { Person } from '@/domain'
import { useActionState } from 'react'
import { removePerson, renamePerson } from './action'

export default function PersonPill(props: {
	person: Person.Person
	groupId: string
}) {
	const rename = renamePerson.bind(null, props.person.id, props.groupId)
	const [state, renameAction] = useActionState(rename, { _tag: 'Idle' })

	return (
		<Popover>
			<PopoverTrigger asChild>
				<li
					key={props.person.id}
					className="py-2 px-4 border rounded-full hover:ring cursor-pointer data-[state=open]:ring-2 transition-all"
				>
					<p className="overflow-ellipsis overflow-hidden">
						{props.person.name}{' '}
						<span className="opacity-20 text-xs">#{props.person.id}</span>
					</p>
				</li>
			</PopoverTrigger>
			<PopoverContent align="start" className="space-y-4">
				<section>
					<H3>Edit</H3>
					<form action={renameAction}>
						<label htmlFor="rename">Name</label>
						<div className="flex gap-2">
							<Input
								id="rename"
								name="name"
								type="text"
								defaultValue={props.person.name}
							/>
							<Button type="submit">Save</Button>
						</div>
						{state._tag === 'Failure' && state.cause._tag === 'Fail' && (
							<div className="text-red-600 pt-1">
								{state.cause.error._tag === 'NameRequiredError' &&
									state.cause.error.message}
							</div>
						)}
					</form>
				</section>
				<hr />
				<section>
					<H3>Delete</H3>
					<form
						action={removePerson.bind(null, props.person.id, props.groupId)}
					>
						<Button variant="destructive" type="submit">
							Delete {props.person.name}
						</Button>
					</form>
				</section>
			</PopoverContent>
		</Popover>
	)
}
