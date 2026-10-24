import { WebSdk } from '@effect/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Config, Effect, Layer, Option, Redacted } from 'effect'

// The WebSdk layer releases its tracer provider with `Effect.promise(forceFlush)`.
// If the collector is unreachable, that rejection becomes a defect and fails the
// whole request, so exporter failures are swallowed here.
class ResilientBatchSpanProcessor extends BatchSpanProcessor {
	override forceFlush() {
		return super.forceFlush().catch(() => undefined)
	}
	override shutdown() {
		return super.shutdown().catch(() => undefined)
	}
}

const describeError = (error: (Error & { code?: string }) | undefined) =>
	[error?.code, error?.message].filter(Boolean).join(' ') || String(error)

const EXPORT_SUCCESS = 0 // ExportResultCode.SUCCESS

// Logs when the collector becomes unreachable, and again when it recovers,
// instead of once per failed export. The state is module level because
// TracingLive builds a new exporter for every run.
let collectorUnreachable = false

class LoggingTraceExporter extends OTLPTraceExporter {
	override export(
		...[spans, resultCallback]: Parameters<OTLPTraceExporter['export']>
	) {
		super.export(spans, (result) => {
			if (result.code !== EXPORT_SUCCESS) {
				if (!collectorUnreachable) {
					collectorUnreachable = true
					console.warn(
						'OpenTelemetry collector unreachable, traces are being dropped:',
						describeError(result.error),
					)
				}
			} else if (collectorUnreachable) {
				collectorUnreachable = false
				console.info('OpenTelemetry collector reachable again')
			}
			resultCallback(result)
		})
	}
}

const GrafanaConfig = Config.all({
	url: Config.option(Config.String('OTLP_URL')),
	auth: Config.option(Config.Redacted('OTLP_AUTH')),
})

export const TracingLive = Layer.unwrap(
	Effect.gen(function* () {
		const { url, auth } = yield* GrafanaConfig

		// If URL is not configured, return empty layer (no-op tracing)
		if (Option.isNone(url)) {
			console.log('OpenTelemetry tracing disabled (OTLP_URL not configured)')
			return Layer.empty
		}

		const headers = yield* makeHeaders(auth)

		// Configure OTLP exporter with aggressive timeouts
		const traceExporter = new LoggingTraceExporter({
			url: url.value,
			headers,
			timeoutMillis: 1000, // 1 second timeout for HTTP requests
		})

		return WebSdk.layer(() => ({
			resource: {
				serviceName: 'groupli.app',
			},
			spanProcessor: new ResilientBatchSpanProcessor(traceExporter, {
				// Timeout export attempts quickly when server is down
				exportTimeoutMillis: 1000,
			}),
		}))
	}),
)

function makeHeaders(auth: Option.Option<Redacted.Redacted>) {
	return Option.match(auth, {
		onNone: () => Effect.succeed({}),
		onSome: (a) => Effect.succeed({ Authorization: Redacted.value(a) }),
	})
}
