import { Button } from '@/components/ui/button'
import { H1 } from '@/components/ui/typography'
import Link from 'next/link'
import { newGroup } from './action'

export default function Home() {
	return (
		<div className="bg-white">
			<div className="relative isolate px-6 pt-14 lg:px-8">
				<div
					className="-top-40 -z-10 sm:-top-80 absolute inset-x-0 transform-gpu overflow-hidden blur-3xl"
					aria-hidden="true"
				>
					<div
						className="-translate-x-1/2 relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] rotate-[30deg] bg-gradient-to-tr from-[#80fdff] to-[#a2fc89] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
						}}
					/>
				</div>
				<div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
					<div className="hidden sm:mb-8 sm:flex sm:justify-center">
						<div className="relative rounded-full px-3 py-1 text-gray-600 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
							Discover Groupli.{' '}
							<Link
								href="/blog/discover-groupli-the-app-for-group-pairings"
								className="font-semibold text-primary"
							>
								<span className="absolute inset-0" aria-hidden="true" />
								Read more <span aria-hidden="true">&rarr;</span>
							</Link>
						</div>
					</div>
					<div className="text-center">
						<H1 className="lg:text-6xl">
							Every round new pairings. With ease.
						</H1>
						<p className="mt-6 text-balance text-gray-600 text-lg leading-8">
							Pair everyone in your group with someone new. Groupli will take
							care of the rest.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<form action={newGroup}>
								<Button type="submit">Get started</Button>
							</form>
							<Link
								href="/blog/discover-groupli-the-app-for-group-pairings"
								className=""
							>
								Learn more <span aria-hidden="true">→</span>
							</Link>
						</div>
					</div>
				</div>
				<div
					className="-z-10 absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
					aria-hidden="true"
				>
					<div
						className="-translate-x-1/2 relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
						}}
					/>
				</div>
			</div>
		</div>
	)
}
