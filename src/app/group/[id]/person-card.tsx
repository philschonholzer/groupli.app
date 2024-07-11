import type { Person } from '@/domain'
import { cn } from '@/lib/utils'

export default function PersonCard(props: {
	person: Person.Person
	children?: React.ReactNode
	className?: string
}) {
	return (
		<li
			key={props.person.id}
			className={cn(
				'group flex h-32 w-24 flex-col rounded-xl border border-primary/30 bg-white px-3 py-2 shadow',
				props.className,
			)}
		>
			<div className="flex-grow">
				<p className="overflow-hidden overflow-ellipsis">{props.person.name}</p>
				<p className="text-xs opacity-20">#{props.person.id}</p>
			</div>
			{props.children}
		</li>
	)
}
