import { test, expect } from '@playwright/test';

test.describe('Exam Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access exam creation
    await page.goto('/');
    
    // Login as admin
    await page.getByRole('button', { name: /admin login/i }).click();
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for dashboard to load
    await expect(page.getByText(/admin dashboard/i)).toBeVisible();
  });

  test('should create a new exam', async ({ page }) => {
    // Navigate to exam creation
    await page.getByRole('button', { name: /create exam/i }).click();
    
    // Should show exam creation form
    await expect(page.getByText(/create new exam/i)).toBeVisible();
    
    // Fill exam details
    await page.getByLabel(/title/i).fill('Test Medical Exam');
    await page.getByLabel(/description/i).fill('A comprehensive test for medical students');
    await page.getByLabel(/topic/i).selectOption('Cardiology');
    await page.getByLabel(/difficulty/i).selectOption('Medium');
    await page.getByLabel(/duration/i).fill('60');
    
    // Generate questions using AI
    await page.getByRole('button', { name: /generate questions/i }).click();
    
    // Wait for questions to be generated
    await expect(page.getByText(/generating questions/i)).toBeVisible();
    await expect(page.getByText(/question \d+/i)).toBeVisible();
    
    // Save the exam
    await page.getByRole('button', { name: /save exam/i }).click();
    
    // Should show success message and redirect
    await expect(page.getByText(/exam created successfully/i)).toBeVisible();
    await expect(page.getByText(/Test Medical Exam/i)).toBeVisible();
  });

  test('should edit an existing exam', async ({ page }) => {
    // First create an exam
    await page.getByRole('button', { name: /create exam/i }).click();
    await page.getByLabel(/title/i).fill('Original Exam');
    await page.getByLabel(/topic/i).selectOption('Neurology');
    await page.getByRole('button', { name: /generate questions/i }).click();
    await page.getByRole('button', { name: /save exam/i }).click();
    
    // Wait for exam to be saved
    await expect(page.getByText(/exam created successfully/i)).toBeVisible();
    
    // Edit the exam
    await page.getByRole('button', { name: /edit exam/i }).click();
    
    // Update exam details
    await page.getByLabel(/title/i).clear();
    await page.getByLabel(/title/i).fill('Updated Exam');
    await page.getByLabel(/description/i).fill('Updated description');
    
    // Save changes
    await page.getByRole('button', { name: /update exam/i }).click();
    
    // Should show success message
    await expect(page.getByText(/exam updated successfully/i)).toBeVisible();
    await expect(page.getByText(/Updated Exam/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to exam creation
    await page.getByRole('button', { name: /create exam/i }).click();
    
    // Try to generate questions without filling required fields
    await page.getByRole('button', { name: /generate questions/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/topic is required/i)).toBeVisible();
  });

  test('should handle AI generation errors', async ({ page }) => {
    // Mock API error for AI generation
    await page.route('**/api/gemini/generate-questions', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'AI service unavailable' }) });
    });
    
    // Navigate to exam creation
    await page.getByRole('button', { name: /create exam/i }).click();
    
    // Fill required fields
    await page.getByLabel(/title/i).fill('Test Exam');
    await page.getByLabel(/topic/i).selectOption('Cardiology');
    
    // Try to generate questions
    await page.getByRole('button', { name: /generate questions/i }).click();
    
    // Should show error message
    await expect(page.getByText(/failed to generate questions/i)).toBeVisible();
  });

  test('should manually add questions', async ({ page }) => {
    // Navigate to exam creation
    await page.getByRole('button', { name: /create exam/i }).click();
    
    // Fill basic exam details
    await page.getByLabel(/title/i).fill('Manual Questions Exam');
    await page.getByLabel(/topic/i).selectOption('Internal Medicine');
    
    // Add question manually
    await page.getByRole('button', { name: /add question/i }).click();
    
    // Fill question details
    await page.getByLabel(/question text/i).fill('What is the normal blood pressure range?');
    await page.getByLabel(/option 1/i).fill('120/80 mmHg');
    await page.getByLabel(/option 2/i).fill('140/90 mmHg');
    await page.getByLabel(/option 3/i).fill('100/60 mmHg');
    await page.getByLabel(/option 4/i).fill('160/100 mmHg');
    await page.getByLabel(/correct answer/i).selectOption('0'); // 120/80 mmHg
    
    // Save question
    await page.getByRole('button', { name: /save question/i }).click();
    
    // Should show the added question
    await expect(page.getByText(/What is the normal blood pressure range?/i)).toBeVisible();
  });

  test('should preview exam before publishing', async ({ page }) => {
    // Navigate to exam creation
    await page.getByRole('button', { name: /create exam/i }).click();
    
    // Fill basic exam details
    await page.getByLabel(/title/i).fill('Preview Test Exam');
    await page.getByLabel(/topic/i).selectOption('Pediatrics');
    
    // Generate questions
    await page.getByRole('button', { name: /generate questions/i }).click();
    await expect(page.getByText(/question \d+/i)).toBeVisible();
    
    // Preview exam
    await page.getByRole('button', { name: /preview exam/i }).click();
    
    // Should show preview mode
    await expect(page.getByText(/exam preview/i)).toBeVisible();
    await expect(page.getByText(/Preview Test Exam/i)).toBeVisible();
  });
});