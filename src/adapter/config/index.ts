import { getRequestContext } from '@cloudflare/next-on-pages'
import { ConfigProvider, Layer } from 'effect'

export const ConfigLayer = (env: CloudflareEnv) => {
	const { DB, ...rest } = env

	const cloudflareConfigProvider = ConfigProvider.fromJson(JSON.stringify(rest))

	return Layer.setConfigProvider(cloudflareConfigProvider)
}
