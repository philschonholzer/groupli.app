import { H1, P } from '@/components/ui/typography'

export default function LoginPage() {
	return (
		<div className="space-y-12 py-12 md:py-24 lg:py-32">
			<H1>
				Login to <span className="text-primary">Groupli!</span>
			</H1>
			<div className="space-y-2">
				<P>Coming soon...</P>
				<P>
					Drop me a line why you want to login at{' '}
					<a href="mailto:philip@groupli.app">philip@groupli.app</a> 😊
				</P>
			</div>
		</div>
	)
}
