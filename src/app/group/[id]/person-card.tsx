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
				'py-2 px-3 border rounded-xl h-32 w-24 flex flex-col bg-white border-primary/30 group shadow',
				props.className,
			)}
		>
			<div className="flex-grow">
				<p className="overflow-ellipsis overflow-hidden">{props.person.name}</p>
				<p className="opacity-20 text-xs">#{props.person.id}</p>
			</div>
			{props.children}
		</li>
	)
}
