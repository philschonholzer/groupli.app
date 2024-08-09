'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { H3 } from '@/components/ui/typography'
import type { Group, Person } from '@/domain'
import { useActionState } from 'react'
import { removePerson, renamePerson } from './action'
import { pipe } from 'effect'
import { valueTags } from 'effect/Match'

export default function PersonPill(props: {
	person: Person.Person
	groupId: Group.GroupId
}) {
	const rename = renamePerson.bind(null, props.person.id, props.groupId)
	const [state, renameAction] = useActionState(rename, { _tag: 'Idle' })

	return (
		<Popover>
			<PopoverTrigger asChild>
				<li
					key={props.person.id}
					className="cursor-pointer rounded-full border px-4 py-2 transition-all hover:ring data-[state=open]:ring-2"
				>
					<p className="overflow-hidden overflow-ellipsis">
						{props.person.name}{' '}
						<span className="text-xs opacity-20">#{props.person.id}</span>
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
							<div className="pt-1 text-red-600">
								{pipe(
									state.cause.error,
									valueTags({
										NameRequiredError: (error) => <p>{error.message}</p>,
										SchemaError: (error) => <p>Falsche Eingaben: {error.message}</p>,
										DbError: (error) => (
											<p>
												The Database is not available. Try again later.{' '}
												{JSON.stringify(error.message)}
											</p>
										),
									}),
								)}
							</div>
						)}
					</form>
				</section>
				<hr />
				<section>
					<H3>Delete</H3>
					<form action={removePerson.bind(null, props.person.id, props.groupId)}>
						<Button variant="destructive" type="submit">
							Delete {props.person.name}
						</Button>
					</form>
				</section>
			</PopoverContent>
		</Popover>
	)
}
