import { WebSdk } from '@effect/opentelemetry'
import { OTLPExporter } from '@microlabs/otel-cf-workers'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Config, Effect, Layer, type Option, Secret } from 'effect'
import { ConfigLive } from '../config'

const GrafanaConfig = Config.all({
	url: Config.string('OTLP_URL'),
	auth: Config.option(Config.secret('OTLP_AUTH')),
})

export const TracingLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const { url, auth } = yield* GrafanaConfig
		const headers = yield* makeHeaders(auth)
		const traceExporter = new OTLPExporter({
			url,
			headers,
		})

		return WebSdk.layer(() => ({
			resource: {
				serviceName: 'groupli.app',
			},
			spanProcessor: new BatchSpanProcessor(traceExporter),
		}))
	}),
).pipe(Layer.provide(ConfigLive))

function makeHeaders(auth: Option.Option<Secret.Secret>) {
	return auth.pipe(
		Effect.map((a) => ({
			Authorization: Secret.value(a),
		})),
		Effect.orElseSucceed(() => ({})),
	)
}
