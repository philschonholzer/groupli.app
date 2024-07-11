import { H1, P } from '@/components/ui/typography'

export default function Header(props: { title: string; lead: string }) {
	return (
		<header className="space-y-8 pt-12 pb-8 lg:pt-32">
			<H1>{props.title}</H1>
			<P className="max-w-[900px] text-base/relaxed text-primary md:text-xl/relaxed dark:text-gray-400">
				{props.lead}
			</P>
		</header>
	)
}
