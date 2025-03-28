import withMDX from '@next/mdx'

const nextConfig = {
	pageExtensions: ['mdx', 'ts', 'tsx'],
	async rewrites() {
		return [
			{
				source: '/stats/:match*',
				destination: 'https://cloud.umami.is/:match*',
			},
			{
				source: '/api/send',
				destination: 'https://cloud.umami.is/api/send',
			},
		]
	},
}

export default withMDX()(nextConfig)
