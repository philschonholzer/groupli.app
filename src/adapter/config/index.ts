import { getRequestContext } from '@cloudflare/next-on-pages'
import { ConfigProvider, Effect, Layer } from 'effect'

export const ConfigLayer = Layer.unwrapEffect(
	Effect.sync(() => {
		const { DB, ...rest } = getRequestContext().env

		const cloudflareConfigProvider = ConfigProvider.fromJson(
			JSON.stringify(rest),
		)

		return Layer.setConfigProvider(cloudflareConfigProvider)
	}),
)
