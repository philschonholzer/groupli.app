import type { Metadata } from 'next'
import { Grandstander } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
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
		<html lang="en" suppressHydrationWarning>
			<Script
				defer
				src="/stats/script.js"
				data-website-id="7b9c5bf7-b440-4741-9707-fa00a25137a2"
				data-host-url="https://groupli.app"
			/>

			<body
				className={`${fontFamily.className} container mx-auto my-12 max-w-3xl`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Header />
					<main>{children}</main>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
