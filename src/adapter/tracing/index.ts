import { getRequestContext } from '@cloudflare/next-on-pages'
import { WebSdk } from '@effect/opentelemetry'
import { OTLPExporter } from '@microlabs/otel-cf-workers'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Effect, Layer } from 'effect'

export const TracingLayer = Layer.unwrapEffect(
	Effect.gen(function* ($) {
		const { OTLP_URL, OTLP_AUTH } = getRequestContext().env
		const traceExporter = new OTLPExporter({
			url: OTLP_URL,
			headers: { Authorization: OTLP_AUTH },
		})

		return WebSdk.layer(() => ({
			resource: {
				serviceName: 'groupli.app',
			},
			spanProcessor: new BatchSpanProcessor(traceExporter),
		}))
	}),
)
