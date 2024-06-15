import type { Metadata } from 'next'
import Wrapper from '../wrapper'
import Content from './content.mdx'

const url = '/blog/groupli-for-group-pairings-is-live'
export const metadata: Metadata = {
	title: 'Groupli.app is now live!',
	description:
		'Announcing the launch of Groupli, an innovative app designed to mix up your groups in fresh and engaging ways every round, ensuring every pair has the chance to connect and collaborate more effectively.',
	alternates: { canonical: url },
	openGraph: {
		title: 'Groupli.app is now live!',
		description:
			'Announcing the launch of Groupli, an innovative app designed to mix up your groups in fresh and engaging ways every round.',
		url: url,
	},
}

export default function Datenschutzerklärung() {
	return (
		<Wrapper meta={metadata}>
			<Content />
		</Wrapper>
	)
}
