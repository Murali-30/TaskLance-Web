import { describe, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, cleanupTestData, itPOM } from './utils';
import { LoginPage } from './pages/LoginPage';
import { MessagesPage } from './pages/MessagesPage';

describe('Communication', () => {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let messagesPage: MessagesPage;

  beforeAll(async () => {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    messagesPage = new MessagesPage(driver);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  afterEach(async () => {
    await cleanupTestData(driver);
  });

  beforeEach(async () => {
    await loginPage.login(`freelancer_${Date.now()}@example.com`, 'password');
  });

  itPOM('should view messages page empty state', () => driver, async () => {
    await messagesPage.navigateToMessages();
    
    const h2Visible = await messagesPage.isNoMessagesTitleVisible();
    expect(h2Visible).toBe(true);

    const textVisible = await messagesPage.isNoMessagesTextVisible();
    expect(textVisible).toBe(true);
  });
});
