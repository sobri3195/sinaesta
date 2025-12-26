import { test, expect } from '@playwright/test';

test('registers and starts an exam flow', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

  await page.getByLabel('Nama Lengkap *').fill('dr. Test User');
  await page.getByLabel('Email *').fill('test@example.com');
  await page.getByLabel('Nomor HP').fill('081234567890');
  await page.getByLabel('Program Studi Target *').selectOption('Surgery');

  await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

  await expect(page.getByText('Selamat Datang, Dok!')).toBeVisible();
  await page.getByRole('button', { name: 'Mulai Simulasi' }).first().click();
  await expect(page.getByRole('button', { name: 'Submit Exam' })).toBeVisible();
});
