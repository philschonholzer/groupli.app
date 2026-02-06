import assert from 'node:assert'
import { expect, test } from '@playwright/test'
import { TEST_GROUP_ID } from './constants'

test('can start a new round', async ({ page }) => {
	await page.goto(`/group/${TEST_GROUP_ID}`)

	const startButton = page.getByRole('button', { name: /Start/i })
	await expect(startButton).toBeEnabled()

	// Start a round to get everything ready
	await startButton.click()
	await expect(startButton).toBeEnabled()

	const rounds = page.locator('section').filter({ hasText: /Rounds/i })
	const lastRound = rounds.getByRole('heading', { level: 3 }).first()

	await expect(lastRound).toBeVisible()

	const amountOfPersonsInLastRound = await rounds
		.getByRole('list')
		.first()
		.getByRole('listitem')
		.first()
		.getByRole('list')
		.first()
		.getByText(/#/i)
		.count()

	const lastRoundTitle = await lastRound.textContent()
	const roundNumber = lastRoundTitle?.split('#').at(-1)
	expect(roundNumber).toBeDefined()
	assert(roundNumber)
	const number = Number(roundNumber)

	// Start a new round
	await startButton.click()
	await expect(startButton).toBeEnabled()

	await expect(
		rounds.getByRole('heading', {
			level: 3,
			name: new RegExp(String(number + 1)),
		}),
	).toBeVisible()

	const amountOfPersonsInThisRound = await rounds
		.getByRole('list')
		.first()
		.getByRole('listitem')
		.first()
		.getByRole('list')
		.first()
		.getByText(/#/i)
		.count()

	expect(amountOfPersonsInThisRound).toBe(amountOfPersonsInLastRound)
	expect(amountOfPersonsInThisRound).toBeGreaterThan(1)
})
