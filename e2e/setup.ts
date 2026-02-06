#!/usr/bin/env tsx
// @ts-nocheck
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Setting up e2e test environment...\n')

// Set required environment variables
process.env.DB_URL = 'data.sqlite'
process.env.OTLP_URL = 'http://localhost:4318/v1/traces'

console.log('📝 Environment variables:')
console.log(`   DB_URL: ${process.env.DB_URL}`)
console.log(`   OTLP_URL: ${process.env.OTLP_URL}\n`)

// Run the seed script
console.log('🌱 Seeding database...')
const output = execSync('npm run seed:e2e', {
	encoding: 'utf-8',
	stdio: ['pipe', 'pipe', 'inherit'],
	env: process.env,
})

// Extract the test group ID from the output (last line)
const testGroupId = output.trim().split('\n').pop()

// Write to a file so all test processes can access it
const envPath = path.join(__dirname, '.test-env.json')
writeFileSync(
	envPath,
	JSON.stringify(
		{
			DB_URL: process.env.DB_URL,
			OTLP_URL: process.env.OTLP_URL,
			E2E_GROUP_TEST_ID: testGroupId,
		},
		null,
		2,
	),
)

console.log(`\n✅ Setup complete!`)
console.log(`   Test group ID: ${testGroupId}`)
console.log(`   Config written to: e2e/.test-env.json\n`)
