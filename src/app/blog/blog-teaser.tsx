import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'

export function BlogTeaser(props: {
	slug: string
	image: {
		src: string | StaticImport
		alt: string
	}
	title: string
	teaser: string
}) {
	return (
		<div className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
			<Link
				href={`/blog/${props.slug}`}
				className="absolute inset-0 z-10"
				prefetch={false}
			>
				<span className="sr-only">Read more</span>
			</Link>
			<Image
				src={props.image.src}
				alt={props.image.alt}
				width={450}
				height={300}
				className="h-48 w-full object-cover transition-all duration-300 group-hover:scale-105"
			/>
			<div className="bg-white p-6 dark:bg-gray-950">
				<h2 className="line-clamp-2 font-bold text-xl">{props.title}</h2>
				<p className="mt-2 line-clamp-3 text-gray-500 dark:text-gray-400">
					{props.teaser}
				</p>
			</div>
		</div>
	)
}
