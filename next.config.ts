import withMDX from '@next/mdx'

const nextConfig = {
	pageExtensions: ['mdx', 'ts', 'tsx'],
	async rewrites() {
		return [
			{
				source: '/stats/:match*',
				destination: 'https://umami.schoenholzer.com/:match*',
			},
			{
				source: '/api/send',
				destination: 'https://umami.schoenholzer.com/api/send',
			},
		]
	},
}

export default withMDX()(nextConfig)
