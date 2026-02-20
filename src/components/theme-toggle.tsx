'use client'

import { useTheme } from 'next-themes'
import * as React from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" aria-label="Toggle theme">
				<span className="sr-only">Toggle theme</span>
			</Button>
		)
	}

	const cycleTheme = () => {
		if (theme === 'light') {
			setTheme('dark')
		} else if (theme === 'dark') {
			setTheme('system')
		} else {
			setTheme('light')
		}
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={cycleTheme}
			aria-label={`Current theme: ${theme}. Click to change.`}
			title={`Current: ${theme}`}
		>
			{theme === 'light' && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="transition-transform"
					aria-hidden="true"
				>
					<title>Light mode</title>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2" />
					<path d="M12 20v2" />
					<path d="m4.93 4.93 1.41 1.41" />
					<path d="m17.66 17.66 1.41 1.41" />
					<path d="M2 12h2" />
					<path d="M20 12h2" />
					<path d="m6.34 17.66-1.41 1.41" />
					<path d="m19.07 4.93-1.41 1.41" />
				</svg>
			)}
			{theme === 'dark' && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="transition-transform"
					aria-hidden="true"
				>
					<title>Dark mode</title>
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
				</svg>
			)}
			{theme === 'system' && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="transition-transform"
					aria-hidden="true"
				>
					<title>System theme</title>
					<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
					<line x1="8" y1="21" x2="16" y2="21" />
					<line x1="12" y1="17" x2="12" y2="21" />
				</svg>
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
