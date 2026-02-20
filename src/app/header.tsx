import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
	{ name: 'Blog', href: '/blog' },
	{ name: 'About', href: '/about' },
]

export default function Header() {
	return (
		<header className="absolute inset-x-0 top-0 z-50">
			<nav
				className="flex items-center justify-between p-6 lg:px-8"
				aria-label="Global"
			>
				<div className="flex lg:flex-1">
					<Link href={'/'}>
						<span className="font-bold text-primary">Groupli!</span>
					</Link>
				</div>
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
					>
						<span className="sr-only">Open main menu</span>
					</button>
				</div>
				<div className="hidden lg:flex lg:gap-x-12">
					{navigation.map((item) => (
						<a
							key={item.name}
							href={item.href}
							className="font-semibold text-gray-900 text-sm leading-6 dark:text-gray-100"
						>
							{item.name}
						</a>
					))}
				</div>
				<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-4">
					<ThemeToggle />
					<Link
						href="/login"
						className="font-semibold text-gray-900 text-sm leading-6 dark:text-gray-100"
					>
						Log in <span aria-hidden="true">&rarr;</span>
					</Link>
				</div>
			</nav>
		</header>
	)
}
