import { H1, P } from '@/components/ui/typography'

export default function Header(props: { title: string; lead: string }) {
	return (
		<header className="pt-12 pb-8 space-y-8 lg:pt-32">
			<H1>{props.title}</H1>
			<P className="max-w-[900px] text-primary text-base/relaxed md:text-xl/relaxed dark:text-gray-400">
				{props.lead}
			</P>
		</header>
	)
}
