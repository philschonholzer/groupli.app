import { WebSdk } from '@effect/opentelemetry'
import { OTLPExporter } from '@microlabs/otel-cf-workers'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Effect, Layer, Option, Secret } from 'effect'

export const TracingLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const headers = yield* makeHeaders(Option.none())
		const traceExporter = new OTLPExporter({
			url: 'http://localhost:4318/v1/traces',
			headers,
		})

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
