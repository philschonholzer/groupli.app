import { getRequestContext } from '@cloudflare/next-on-pages'
import { ConfigProvider, Layer } from 'effect'

export const ConfigLayer = () => {
	const { DB, ...rest } = getRequestContext().env

	const cloudflareConfigProvider = ConfigProvider.fromJson(JSON.stringify(rest))

	return Layer.setConfigProvider(cloudflareConfigProvider)
}
