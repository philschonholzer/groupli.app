import type { Metadata } from 'next'
import Wrapper from '../wrapper'
import Content from './content.mdx'

export const metadata: Metadata = {
	title: 'Discover Groupli: The App for Group Pairings',
	description:
		"Have you ever wished for more variety in your group interactions? Whether you're part of a team, a study group, or a social circle, Groupli is here to transform your experience. Groupli is an innovative app designed to mix up your groups in fresh and engaging ways every round, ensuring everyone has the chance to connect and collaborate more effectively. Say goodbye to repetitive pairings and hello to dynamic group interactions with Groupli!",
	alternates: { canonical: '/datenschutzerklaerung' },
	openGraph: {
		title: 'Datenschutzerklärung',
		url: '/datenschutzerklaerung',
	},
}

export default function Datenschutzerklärung() {
	return (
		<Wrapper meta={metadata}>
			<Content />
		</Wrapper>
	)
}
