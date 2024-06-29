import { expect, test } from '@playwright/test'

test('can create a new group', async ({ page }) => {
	await page.goto('/')

	await page.getByRole('button').click()

	await expect(page.getByLabel('Group')).toBeInViewport({ timeout: 20_000 })
	const addPersonButton = page.getByRole('button', { name: /Add Person/i })
	await expect(addPersonButton).toHaveText('Add Person')
	await expect(page.getByText('Add members')).toBeInViewport()

	const nameInput = page.getByLabel('Name')
	await nameInput.fill('Carla')
	await nameInput.press('Enter')
	await expect(addPersonButton).toBeEnabled()
	await expect(nameInput).toHaveValue('')
	await expect(page.getByText('Carla')).toBeInViewport()

	await nameInput.fill('Sandra')
	await nameInput.press('Enter')
	await expect(addPersonButton).toBeEnabled()
	await expect(nameInput).toHaveValue('')
	await expect(page.getByText('Sandra')).toBeInViewport()

	await nameInput.fill('Bert')
	await nameInput.press('Enter')
	await expect(addPersonButton).toBeEnabled()
	await expect(nameInput).toHaveValue('')
	await expect(page.getByText('Bert')).toBeInViewport()

	await expect(page.getByText('Add members')).not.toBeInViewport()

	const startButton = page.getByRole('button', { name: /Start/i })
	await expect(startButton).toBeEnabled()

	await expect(page.getByText('Nothing going on yet...')).toBeInViewport()

	await startButton.click()

	const rounds = page.locator('section').filter({ hasText: /Rounds/i })

	const memberInRound = rounds
		.filter({ hasText: /Carla/i })
		.or(rounds.filter({ hasText: /Sandra/i }))

	await expect(memberInRound).toBeVisible()
	await expect(page.getByText('Nothing going on yet...')).not.toBeInViewport()
})
