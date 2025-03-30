import type { Metadata } from 'next'
import { Grandstander } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'
import Header from './header'

const fontFamily = Grandstander({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Groupli App',
	description: 'Pairing people in groups',
	metadataBase: new URL('https://groupli.app'),
} as const

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<Script
				defer
				src="/stats/script.js"
				data-website-id="7b9c5bf7-b440-4741-9707-fa00a25137a2"
				data-host-url="https://groupli.app"
			/>

			<body
				className={`${fontFamily.className} container mx-auto my-16 max-w-3xl`}
			>
				<Header />
				<div className="mb-4 border-red-500 border-l-4 bg-red-100 p-4 text-red-700">
					<p>Attention! Groupli is moving to a new database. </p>
					<p>
						<b>Everything you do now can be lost!</b>
					</p>
					<p>
						As soon as the data has been moved, this message will be removed.
					</p>
				</div>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	)
}
