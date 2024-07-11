import type { Metadata } from 'next'
import Header from './header'

export default function Wrapper(props: {
	children: React.ReactNode
	meta: Partial<Metadata>
}) {
	return (
		<div className="mx-auto max-w-xl">
			<Header
				title={props.meta.title?.toString() ?? 'Ohne Titel'}
				lead={props.meta.description ?? 'Ohne Beschreibung'}
			/>
			<div className="prose py-8">{props.children}</div>
		</div>
	)
}
