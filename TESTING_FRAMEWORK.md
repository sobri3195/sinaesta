# Testing Framework Documentation

This document provides comprehensive information about the testing framework set up for Sinaesta, a React + TypeScript + Vite application.

## Table of Contents

1. [Testing Stack Overview](#testing-stack-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Types](#test-types)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## Testing Stack Overview

### Unit Testing
- **Framework**: Vitest (native to Vite)
- **Component Testing**: React Testing Library
- **Assertions**: Vitest matchers + Jest DOM
- **Mocking**: Vitest mocking utilities

### Integration Testing
- **Framework**: Vitest with React Testing Library
- **API Mocking**: MSW (Mock Service Worker)

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Reporting**: HTML reports with screenshots and videos

### Additional Tools
- **Test Data Generation**: Faker.js
- **Coverage Reporting**: V8 coverage provider
- **UI Testing**: Playwright UI mode

## Project Structure

```
tests/
├── setup.ts                    # Global test setup
├── utils/
│   ├── test-utils.tsx         # Custom render function
│   └── mockData.ts            # Mock data generators
├── mocks/
│   └── handlers.ts            # MSW API handlers
├── unit/                      # Unit tests
│   ├── services/
│   │   ├── geminiService.test.ts
│   │   ├── apiService.test.ts
│   │   └── authService.test.ts
│   ├── hooks/
│   │   ├── useAuth.test.tsx
│   │   └── useLocalStorage.test.ts
│   ├── types/
│   └── utils/
├── components/                # Component tests
│   ├── ExamCreator.test.tsx
│   ├── ExamTaker.test.tsx
│   ├── ExcelImport.test.tsx
│   ├── Settings.test.tsx
│   └── LoginSelectionModal.test.tsx
├── integration/               # Integration tests
│   ├── examFlow.test.tsx
│   ├── userRegistration.test.tsx
│   ├── excelImportFlow.test.tsx
│   └── settingsPersistence.test.tsx
└── e2e/                       # End-to-end tests
    └── specs/
        ├── auth.spec.ts
        ├── examCreation.spec.ts
        ├── examTaking.spec.ts
        ├── excelImport.spec.ts
        ├── osceSimulation.spec.ts
        └── settings.spec.ts
```

## Getting Started

### Prerequisites
```bash
# Install dependencies (already done in package.json)
npm install
```

### Environment Setup
No special environment variables are required for testing. The testing framework uses mocked services and localStorage.

### First Test Run
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Running Tests

### Unit Tests
```bash
# Run unit tests only
npm run test:unit

# Run specific test file
npm test geminiService.test.ts

# Run in watch mode
npm test -- --watch
```

### Component Tests
```bash
# Run component tests
npm run test:components

# Run specific component test
npm test ExamCreator.test.tsx
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate E2E test code
npm run test:e2e:codegen
```

### All Tests
```bash
# Run all tests (unit, integration, and E2E)
npm run test:all
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Coverage will be available in coverage/index.html
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { geminiService } from '../../../services/geminiService';

describe('geminiService', () => {
  it('should generate questions successfully', async () => {
    const mockResponse = {
      text: JSON.stringify([{ question: 'Test question?' }])
    };
    
    // Mock the API call
    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockResolvedValue(mockResponse) }
    }));
    
    const result = await generateExamQuestions('Medicine', 'Easy', 1);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id');
  });
});
```

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamCreator } from '../../../components/ExamCreator';

describe('ExamCreator', () => {
  it('renders form correctly', () => {
    render(<ExamCreator {...mockProps} />);
    
    expect(screen.getByText('Create New Exam')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<ExamCreator {...mockProps} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Exam');
    await user.click(screen.getByRole('button', { name: /generate/i }));
    
    expect(screen.getByText(/generating/i)).toBeVisible();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('user can create exam', async ({ page }) => {
  // Navigate to app
  await page.goto('/');
  
  // Login
  await page.getByRole('button', { name: /admin login/i }).click();
  await page.getByLabel(/email/i).fill('admin@example.com');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /login/i }).click();
  
  // Create exam
  await page.getByRole('button', { name: /create exam/i }).click();
  await page.getByLabel(/title/i).fill('Test Exam');
  await page.getByRole('button', { name: /generate questions/i }).click();
  
  // Verify success
  await expect(page.getByText(/exam created/i)).toBeVisible();
});
```

## Test Types

### 1. Unit Tests
Focus on individual functions, services, and utilities.
- **Services**: API calls, business logic
- **Hooks**: Custom React hooks
- **Utils**: Helper functions, validators

### 2. Component Tests
Test React components in isolation.
- **Rendering**: Components render correctly
- **User interactions**: Clicks, form inputs, navigation
- **State management**: Component state changes
- **Props handling**: Props are processed correctly

### 3. Integration Tests
Test multiple components working together.
- **User flows**: Complete workflows (login → create exam → take exam)
- **API integration**: Multiple API calls in sequence
- **State persistence**: Settings saved and restored

### 4. End-to-End Tests
Test complete user scenarios in real browsers.
- **Authentication flows**: Login, registration, logout
- **Core functionality**: Create exam, take exam, view results
- **Cross-browser compatibility**: Chrome, Firefox, Safari
- **Mobile responsiveness**: Mobile Chrome and Safari

## Best Practices

### Test Organization
- **Descriptive names**: `should create exam with valid data`
- **AAA Pattern**: Arrange, Act, Assert
- **Single responsibility**: One test, one behavior
- **Independent tests**: No dependencies between tests

### Mocking Strategy
- **External APIs**: Always mock external services
- **Random data**: Use faker.js for realistic test data
- **Complex objects**: Use mock data generators
- **LocalStorage**: Mock browser APIs

### Testing Principles
- **Test user behavior**, not implementation
- **Test edge cases** and error scenarios
- **Avoid testing third-party libraries**
- **Keep tests fast** and reliable
- **Mock what you don't control**

### Component Testing
- **Render components** with minimal setup
- **Use userEvent** instead of fireEvent for realistic interactions
- **Test accessibility** with screen readers
- **Mock child components** when needed

### E2E Testing
- **Use realistic data** and scenarios
- **Test critical paths** first
- **Take screenshots** on failures
- **Use test isolation** - each test is independent

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run component tests
      run: npm run test:components
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      
  e2e:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright
      run: npx playwright install --with-deps
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

### Test Coverage Requirements
- **Minimum 80%** code coverage
- **Critical paths** must have 100% coverage
- **All components** must have basic render tests
- **All services** must have unit tests
- **All user flows** must have E2E tests

## Configuration Files

### Vitest Configuration (`vitest.config.ts`)
- Test environment setup
- Coverage thresholds
- File inclusion patterns
- Mock configurations

### Playwright Configuration (`playwright.config.ts`)
- Browser configurations
- Test environment setup
- Screenshot and video settings
- Parallel execution

### Test Setup (`tests/setup.ts`)
- Global test utilities
- DOM testing matchers
- Browser API mocks
- Test environment setup

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
npm test -- --inspect-brk geminiService.test.ts

# Run in watch mode
npm test -- --watch
```

### Component Tests
```bash
# Run with UI
npm run test:ui

# Debug specific component
npm test ExamCreator.test.tsx -- --reporter=verbose
```

### E2E Tests
```bash
# Debug mode
npm run test:e2e:debug

# Codegen for creating tests
npm run test:e2e:codegen

# UI mode
npm run test:e2e:ui
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Check for infinite loops
   - Mock time-sensitive operations
   - Increase timeout if needed

2. **Mock not working**
   - Verify mock path is correct
   - Check module resolution
   - Ensure mock is cleared between tests

3. **E2E tests failing**
   - Check if app is running on correct port
   - Verify selectors are stable
   - Use more specific selectors

4. **Coverage reports not generating**
   - Check vitest configuration
   - Ensure coverage thresholds are set correctly
   - Verify exclude patterns

### Getting Help

- Check test output for error messages
- Use browser dev tools for E2E debugging
- Review test documentation and examples
- Check configuration files for typos

## Conclusion

This testing framework provides comprehensive coverage for all aspects of the Sinaesta application. Follow the best practices outlined above to maintain high-quality, maintainable tests that ensure application reliability.