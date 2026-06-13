import { describe, expect, beforeAll, afterAll } from '@jest/globals';
import { WebDriver, until } from 'selenium-webdriver';
import { createDriver, itPOM } from './utils';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';

describe('Authentication & Onboarding', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  itPOM('should navigate onboarding and login', () => driver, async () => {
    const onboardingPage = new OnboardingPage(driver);
    const loginPage = new LoginPage(driver);

    await onboardingPage.completeOnboardingToLogin();
    await loginPage.login('alice@example.com', 'password');

    const url = await driver.getCurrentUrl();
    expect(url).toContain('/dashboard');
  });
});
