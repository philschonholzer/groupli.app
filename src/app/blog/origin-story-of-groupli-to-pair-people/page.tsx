import type { Metadata } from 'next'
import Wrapper from '../wrapper'
import Content from './content.mdx'

const url = '/blog/origin-story-of-groupli-to-pair-people'
const title = 'Origin Story of Groupli: The App to Pair People'
const description =
	"How did Groupli come about? What's the story behind the app? Find out how Groupli was created and how it can help you connect with others."
export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: url },
	openGraph: {
		title,
		description,
		url,
	},
}

export default function Datenschutzerklärung() {
	return (
		<Wrapper meta={metadata}>
			<Content />
		</Wrapper>
	)
}
