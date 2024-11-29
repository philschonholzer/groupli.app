import withMDX from '@next/mdx'
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/5712c57ea7/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === 'development') {
	await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
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
