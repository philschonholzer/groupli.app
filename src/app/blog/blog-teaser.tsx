import Image from 'next/image'
import Link from 'next/link'

export function BlogTeaser(props: {
	slug: string
	image: {
		src: any
		alt: string
	}
	title: string
	teaser: string
}) {
	return (
		<div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
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
				<h2 className="text-xl font-bold line-clamp-2">{props.title}</h2>
				<p className="mt-2 text-gray-500 line-clamp-3 dark:text-gray-400">
					{props.teaser}
				</p>
			</div>
		</div>
	)
}
