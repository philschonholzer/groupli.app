import Link from 'next/link'

import Image from 'next/image'
import discoverGroupliImage from './discover-groupli-the-app-for-group-pairings/discover-groupli.svg'

export default function Component() {
	return (
		<div className="w-full py-12 md:py-24 lg:py-32">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
							Latest Blog Posts
						</h1>
						<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
							Discover the latest news around Groupli!.
						</p>
					</div>
				</div>
				<div className="mx-auto grid gap-8 py-12 lg:grid-cols-2">
					<div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
						<Link
							href="/blog/discover-groupli-the-app-for-group-pairings"
							className="absolute inset-0 z-10"
							prefetch={false}
						>
							<span className="sr-only">Read more</span>
						</Link>
						<Image
							src={discoverGroupliImage}
							alt="Blog post thumbnail"
							width={450}
							height={300}
							className="h-48 w-full object-cover transition-all duration-300 group-hover:scale-105"
						/>
						<div className="bg-white p-6 dark:bg-gray-950">
							<h2 className="text-xl font-bold line-clamp-2">
								Discover Groupli: The App for Group Pairings
							</h2>
							<p className="mt-2 text-gray-500 line-clamp-3 dark:text-gray-400">
								Have you ever wished for more variety in your group interactions?
								Whether you're part of a team, a study group, or a social circle,
								Groupli is here to transform your experience.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
