'use client'

import { Button } from '@/components/ui/button'
import type { Round } from '@/domain'
import copy from 'copy-text-to-clipboard'
import { set } from 'effect/Record'
import { Check, ClipboardCopy } from 'lucide-react'
import { useState } from 'react'

export default function CopyToClipboard(props: { round: Round.Round }) {
	const [copied, setCopied] = useState(false)
	const text = props.round.pairings
		.map(({ person1, person2 }) => [person1.name, person2.name].join(' - '))
		.join('\n')
	const handleCopyClick = () => {
		copy(text)
		setCopied(true)

		setTimeout(() => {
			setCopied(false)
		}, 1000)
	}
	return (
		<Button variant={'secondary'} data-copied={copied} onClick={handleCopyClick}>
			<ClipboardCopy
				data-copied={copied}
				className="data-[copied=true]:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all data-[copied=true]:scale-0"
			/>
			<Check
				data-copied={copied}
				className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all data-[copied=true]:rotate-0 data-[copied=true]:scale-100"
			/>
			{/* <Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */}

			<span className="sr-only">Copy to clipboard</span>
		</Button>
	)
}
