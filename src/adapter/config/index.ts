import { getRequestContext } from '@cloudflare/next-on-pages'
import { ConfigProvider, Layer, Record, pipe } from 'effect'

export const ConfigLive = Layer.suspend(() =>
	pipe(
		getRequestContext().env,
		({ DB, ...onlyEnvVars }) => onlyEnvVars,
		Record.toEntries,
		(env) => new Map(env),
		ConfigProvider.fromMap,
		Layer.setConfigProvider,
	),
)
