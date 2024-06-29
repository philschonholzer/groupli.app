import { expect, test } from '@playwright/test'

test('has start button', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('button')).toHaveText('Get started')
})
