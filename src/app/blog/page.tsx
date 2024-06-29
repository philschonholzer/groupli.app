import Link from 'next/link'

import Image from 'next/image'
import originStoryImage from './origin-story-of-groupli-to-pair-people/origin-story-groupli-pair-people.svg'
import discoverGroupliImage from './discover-groupli-the-app-for-group-pairings/discover-groupli.svg'
import groupliIsLiveImage from './groupli-for-group-pairings-is-live/groupli-is-live.svg'
import { BlogTeaser } from './blog-teaser'

export default function Component() {
	return (
		<div className="w-full py-12 md:py-24 lg:py-32">
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
				<BlogTeaser
					slug="origin-story-of-groupli-to-pair-people"
					image={{ src: originStoryImage, alt: 'Blog post thumbnail' }}
					title="Origin Story of Groupli: The App to Pair People"
					teaser="Find out how Groupli came about and the story behind the app."
				/>

				<BlogTeaser
					slug="discover-groupli-the-app-for-group-pairings"
					image={{ src: discoverGroupliImage, alt: 'Blog post thumbnail' }}
					title="Discover Groupli: The App for Group Pairings"
					teaser="Discover Groupli, the app that helps you pair people in your group."
				/>

				<BlogTeaser
					slug="groupli-for-group-pairings-is-live"
					image={{ src: groupliIsLiveImage, alt: 'Blog post thumbnail' }}
					title="Groupli for Group Pairings Is Live"
					teaser="Groupli is now live! Find out how you can use the app to pair people in your group."
				/>
			</div>
		</div>
	)
}
