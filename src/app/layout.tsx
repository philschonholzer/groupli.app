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
				className={`${fontFamily.className} container mx-auto my-12 max-w-3xl`}
			>
				<Header />
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	)
}
