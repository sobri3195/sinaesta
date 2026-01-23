import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display login selection modal on landing', async ({ page }) => {
    // Should show welcome message and login options
    await expect(page.getByText('Welcome to Sinaesta')).toBeVisible();
    await expect(page.getByText('Choose your login type')).toBeVisible();
    await expect(page.getByRole('button', { name: /student login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /admin login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /mentor login/i })).toBeVisible();
  });

  test('should allow student registration', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    // Should show login form
    await expect(page.getByText('Student Login')).toBeVisible();
    
    // Click register link
    await page.getByRole('link', { name: /register here/i }).click();
    
    // Should show registration form
    await expect(page.getByText('Student Registration')).toBeVisible();
    
    // Fill registration form
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john.doe@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit registration
    await page.getByRole('button', { name: /register/i }).click();
    
    // Should redirect to dashboard or show success message
    await expect(page.getByText(/registration successful|welcome/i)).toBeVisible();
  });

  test('should allow student login', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    // Fill login form
    await page.getByLabel(/email/i).fill('student@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit login
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should redirect to student dashboard
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    await expect(page.getByText(/student/i)).toBeVisible();
  });

  test('should allow admin login', async ({ page }) => {
    // Click admin login button
    await page.getByRole('button', { name: /admin login/i }).click();
    
    // Fill login form
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('admin123');
    
    // Submit login
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should redirect to admin dashboard
    await expect(page.getByText(/admin dashboard/i)).toBeVisible();
    await expect(page.getByText(/management/i)).toBeVisible();
  });

  test('should allow mentor login', async ({ page }) => {
    // Click mentor login button
    await page.getByRole('button', { name: /mentor login/i }).click();
    
    // Fill login form
    await page.getByLabel(/email/i).fill('mentor@example.com');
    await page.getByLabel(/password/i).fill('mentor123');
    
    // Submit login
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should redirect to mentor dashboard
    await expect(page.getByText(/mentor dashboard/i)).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    // Fill form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit login
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible();
  });

  test('should allow password visibility toggle', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click eye icon to toggle visibility
    await page.getByRole('button', { name: '' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should navigate back to role selection', async ({ page }) => {
    // Click student login button
    await page.getByRole('button', { name: /student login/i }).click();
    
    // Should show login form
    await expect(page.getByText('Student Login')).toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: /back/i }).click();
    
    // Should return to role selection
    await expect(page.getByText('Choose your login type')).toBeVisible();
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    // Modal should be visible initially
    await expect(page.getByText('Welcome to Sinaesta')).toBeVisible();
    
    // Click close button
    await page.getByRole('button', { name: /close/i }).click();
    
    // Modal should be closed
    await expect(page.getByText('Welcome to Sinaesta')).not.toBeVisible();
  });
});