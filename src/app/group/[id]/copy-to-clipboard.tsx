'use client'

import copy from 'copy-text-to-clipboard'
import { Check, ClipboardCopy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Round } from '@/domain'

export default function CopyToClipboard(props: { round: Round.RoundExtended }) {
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
		<Button
			variant={'secondary'}
			data-copied={copied}
			onClick={handleCopyClick}
		>
			<ClipboardCopy
				data-copied={copied}
				className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all data-[copied=true]:scale-0 data-[copied=true]:-rotate-90"
			/>
			<Check
				data-copied={copied}
				className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all data-[copied=true]:scale-100 data-[copied=true]:rotate-0"
			/>
			<span className="sr-only">Copy to clipboard</span>
		</Button>
	)
}
