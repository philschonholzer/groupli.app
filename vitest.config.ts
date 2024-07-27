import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		setupFiles: ['./setup.ts'],
		include: ['src/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
