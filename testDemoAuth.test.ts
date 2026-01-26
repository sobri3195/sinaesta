// Test for demo authentication service
import { demoAuthService } from './services/demoAuthService';

describe('Demo Authentication Service', () => {
  test('should initialize with backend enabled', () => {
    expect(demoAuthService.isBackendActive()).toBe(true);
  });

  test('should recognize demo accounts', () => {
    expect(demoAuthService.isDemoAccount('demo@sinaesta.com')).toBe(true);
    expect(demoAuthService.isDemoAccount('student1@sinaesta.com')).toBe(true);
    expect(demoAuthService.isDemoAccount('invalid@test.com')).toBe(false);
  });

  test('should login with valid demo credentials', async () => {
    const response = await demoAuthService.loginDemoAccount('demo@sinaesta.com', 'demo123');
    expect(response).toBeDefined();
    expect(response.user).toBeDefined();
    expect(response.user.email).toBe('demo@sinaesta.com');
    expect(response.accessToken).toBeDefined();
  });

  test('should fail with invalid demo credentials', async () => {
    await expect(
      demoAuthService.loginDemoAccount('demo@sinaesta.com', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials for demo account');
  });

  test('should toggle backend state', () => {
    demoAuthService.setBackendEnabled(false);
    expect(demoAuthService.isBackendActive()).toBe(false);

    demoAuthService.setBackendEnabled(true);
    expect(demoAuthService.isBackendActive()).toBe(true);
  });

  test('should handle tryDemoLogin for demo accounts', async () => {
    const response = await demoAuthService.tryDemoLogin('student1@sinaesta.com', 'admin123');
    expect(response).toBeDefined();
    expect(response.user.email).toBe('student1@sinaesta.com');
  });
});