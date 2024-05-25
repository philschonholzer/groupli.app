import type { Metadata } from 'next'
import { Grandstander } from 'next/font/google'
import './globals.css'
import Header from './header'

const fontFamily = Grandstander({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Groupli App',
	description: 'Pairing people in groups',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${fontFamily.className} container max-w-3xl mx-auto my-12`}
			>
				<Header />
				<main>{children}</main>
			</body>
		</html>
	)
}
