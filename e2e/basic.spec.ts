import { expect, test } from '@playwright/test'

test('has start button', async ({ page }) => {
	await page.goto('/')

	// Use specific selector to avoid conflicts with Next.js dev tools button
	await expect(page.getByRole('button', { name: 'Get started' })).toHaveText(
		'Get started',
	)
})
