import assert from 'node:assert'
import { expect, test } from '@playwright/test'
import { TEST_GROUP_ID } from './constants'

test('can shuffle person in a round', async ({ page }) => {
	await page.goto(`/group/${TEST_GROUP_ID}`)

	const startButton = page.getByRole('button', { name: /Start/i })
	await expect(startButton).toBeEnabled()

	// Start a round to get everything ready
	await startButton.click()
	await expect(startButton).toBeEnabled()

	const roundsSection = page.locator('section').filter({ hasText: /Rounds/i })
	const lastRound = roundsSection.getByRole('heading', { level: 3 }).first()

	await expect(lastRound).toBeVisible()

	const amountOfPersonsInLastRound = await roundsSection
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

	// Shuffle the round
	const shuffleButton = roundsSection
		.getByRole('button', { name: /shuffle/i })
		.first()
	await shuffleButton.click()
	await expect(shuffleButton).toBeEnabled()

	await expect(
		roundsSection
			.getByRole('heading', {
				level: 3,
			})
			.first(),
	).toContainText(String(roundNumber), { timeout: 10_000 })

	const amountOfPersonsInThisRound = await roundsSection
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
