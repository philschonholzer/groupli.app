import { WebSdk } from '@effect/opentelemetry'
import { OTLPExporter } from '@microlabs/otel-cf-workers'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Config, Effect, Layer, type Option, Secret } from 'effect'

const GrafanaTempoConfig = Config.nested('OTLP')(
	Config.all({
		url: Config.string('URL'),
		auth: Config.option(Config.secret('AUTH')),
	}),
)

export const TracingLayer = Layer.unwrapEffect(
	Effect.gen(function* ($) {
		const { url, auth } = yield* $(GrafanaTempoConfig)
		const headers = yield* $(makeHeaders(auth))
		const traceExporter = new OTLPExporter({ url, headers })

		return WebSdk.layer(() => ({
			resource: {
				serviceName: 'groupli.app',
			},
			spanProcessor: new BatchSpanProcessor(traceExporter),
		}))
	}),
)

function makeHeaders(auth: Option.Option<Secret.Secret>) {
	return auth.pipe(
		Effect.map((a) => ({
			Authorization: Secret.value(a),
		})),
		Effect.orElseSucceed(() => ({})),
	)
}
