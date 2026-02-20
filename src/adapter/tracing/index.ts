import { WebSdk } from '@effect/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Config, Effect, Layer, Option, Redacted } from 'effect'

const GrafanaConfig = Config.all({
	url: Config.option(Config.string('OTLP_URL')),
	auth: Config.option(Config.redacted('OTLP_AUTH')),
})

export const TracingLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const { url, auth } = yield* GrafanaConfig

		// If URL is not configured, return empty layer (no-op tracing)
		if (Option.isNone(url)) {
			console.log('OpenTelemetry tracing disabled (OTLP_URL not configured)')
			return Layer.empty
		}

		const headers = yield* makeHeaders(auth)

		// Configure OTLP exporter with aggressive timeouts
		const traceExporter = new OTLPTraceExporter({
			url: url.value,
			headers,
			timeoutMillis: 1000, // 1 second timeout for HTTP requests
		})

		return WebSdk.layer(() => ({
			resource: {
				serviceName: 'groupli.app',
			},
			spanProcessor: new BatchSpanProcessor(traceExporter, {
				// Timeout export attempts quickly when server is down
				exportTimeoutMillis: 1000,
			}),
		}))
	}),
)

function makeHeaders(auth: Option.Option<Redacted.Redacted>) {
	return auth.pipe(
		Effect.map((a) => ({
			Authorization: Redacted.value(a),
		})),
		Effect.orElseSucceed(() => ({})),
	)
}
