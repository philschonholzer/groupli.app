import { getRequestContext } from '@cloudflare/next-on-pages'
import { ConfigProvider, Layer } from 'effect'

const { DB, ...rest } = getRequestContext().env

const cloudflareConfigProvider = ConfigProvider.fromJson(JSON.stringify(rest))

export const ConfigLayer = Layer.setConfigProvider(cloudflareConfigProvider)
