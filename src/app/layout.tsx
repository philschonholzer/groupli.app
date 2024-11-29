import type { Metadata } from 'next'
import { Grandstander } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Header from './header'
import Script from 'next/script'

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
				data-website-id="deb1d29f-dfc1-4366-9624-328157877ea7"
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
