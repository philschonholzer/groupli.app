import { H1, P } from '@/components/ui/typography'

export default function AboutPage() {
	return (
		<div className="space-y-12 py-12 md:py-24 lg:py-32">
			<H1>
				About <span className="text-primary">Groupli!</span>
			</H1>
			<div className="space-y-2">
				<P>Welcome to Groupli!, the ultimate group pairing app!</P>
				<P>Our mission is to help you pair people in your groups effectively.</P>
				<P>
					Whether you're managing a team, planning an event, or coordinating
					feedback, Groupli! has got you covered.
				</P>
				<P>
					Drop me a line at{' '}
					<a href="mailto:philip@groupli.app">philip@groupli.app</a> 😊
				</P>
			</div>
		</div>
	)
}
