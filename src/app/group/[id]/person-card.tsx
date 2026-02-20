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
				'group flex h-32 w-24 flex-col rounded-xl border border-primary/30 bg-card px-3 py-2 text-card-foreground shadow-sm',
				props.className,
			)}
		>
			<div className="grow">
				<p className="overflow-hidden text-ellipsis">{props.person.name}</p>
				<p className="text-xs opacity-20 dark:opacity-30">#{props.person.id}</p>
			</div>
			{props.children}
		</li>
	)
}
