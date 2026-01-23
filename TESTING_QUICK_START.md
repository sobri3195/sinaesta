# Sinaesta Testing Framework - Quick Start Guide

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Tests by Type
```bash
# Unit tests only
npm run test:unit

# Component tests
npm run test:components

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Run with UI
```bash
# Unit/component test UI
npm run test:ui

# E2E test UI
npm run test:e2e:ui
```

### Coverage Report
```bash
npm run test:coverage
# Open coverage/index.html to view detailed coverage
```

## 📁 Test Structure

```
tests/
├── unit/           # Unit tests (services, hooks, utils)
├── components/     # React component tests
├── integration/    # Multi-component flow tests
├── e2e/          # End-to-end browser tests
└── utils/         # Test utilities and mocks
```

## 🎯 Test Coverage Goals

- **Overall**: 80% minimum
- **Critical paths**: 100%
- **All components**: Basic render tests
- **All services**: Unit tests
- **Key user flows**: E2E tests

## 🛠️ Development Workflow

1. **Write tests first** (TDD approach)
2. **Run tests frequently** during development
3. **Maintain high coverage** (80%+)
4. **Test user behavior**, not implementation
5. **Mock external dependencies**

## 🔧 Available Scripts

- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:codegen` - Generate E2E tests

## 📚 Documentation

See [TESTING_FRAMEWORK.md](./TESTING_FRAMEWORK.md) for comprehensive documentation.