import { H1, P } from '@/components/ui/typography'

export default function FundingPage() {
	return (
		<div className="py-16 space-y-12">
			<H1>
				Funding <span className="text-primary">Groupli!</span>
			</H1>
			<div className="space-y-2">
				<P>
					Breaking news: no funding available at the moment, but the search
					continues!
				</P>
				<P>
					In related news, I've heard that laughter is a great way to attract
					investors... Anyone want to help fund groupli.app? 😁 🚀 #FundingGoals
				</P>
			</div>
		</div>
	)
}
