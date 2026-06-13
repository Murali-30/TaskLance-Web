import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver, BASE_URL, cleanupTestData, itPOM } from './utils';
import { BasePage } from './pages/BasePage';

describe('Freelancer Workflow (Empty State)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    await driver.quit();
  });

  afterEach(async () => {
    await cleanupTestData(driver);
  });

  itPOM('should verify all buttons in empty state for freelancer', () => driver, async () => {
    const basePage = new BasePage(driver);
    // 1. Sign Up
    await driver.get(`${BASE_URL}/register?role=freelancer`);
    
    await driver.wait(until.elementLocated(By.css('input[type="text"]')), 10000);
    await driver.findElement(By.css('input[type="text"]')).sendKeys('Jane Freelancer');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('jane@example.com');
    
    const passwordInputs = await driver.findElements(By.css('input[type="password"]'));
    await passwordInputs[0].sendKeys('password123');
    await passwordInputs[1].sendKeys('password123'); // Confirm Password
    
    await driver.findElement(By.css('input[type="checkbox"]')).click();
    await basePage.safeClick(By.xpath('//button[contains(., "Sign Up")]'));

    await driver.wait(until.urlContains('/dashboard'), 10000);

    const welcomeEl = await basePage.waitForElement(By.xpath('//h1[contains(., "Welcome back")]'), 5000);
    const welcomeVisible = await welcomeEl.isDisplayed();
    expect(welcomeVisible).toBe(true);

    // 2. Check Dashboard Empty State
    await basePage.safeClick(By.xpath('//a[contains(., "View All")]'));
    await driver.wait(until.urlContains('/projects'), 10000);
    
    // 3. Check Projects Empty Search
    await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="Search projects by title or skills..."]')), 5000);
    await basePage.safeType(By.xpath('//input[@placeholder="Search projects by title or skills..."]'), 'NonExistentGibberish12345');
    
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "No projects found matching your criteria")]')), 15000);

    // 2. Wallet Workflow
    const walletLink = await driver.findElement(By.xpath('//a[contains(., "Wallet")]'));
    await walletLink.click();
    
    // Wait for a second so state populates
    await driver.sleep(1000);
    
    // Find projects button
    const findProjectsButtons = await driver.findElements(By.xpath('//*[contains(text(), "Find Projects")]'));
    if (findProjectsButtons.length > 0) {
      const isVisible = await findProjectsButtons[0].isDisplayed();
      if (isVisible) {
        await findProjectsButtons[0].click();
        await driver.wait(until.urlContains('/projects'), 10000);
        
        const projectsEl = await basePage.waitForElement(By.xpath('//h1[contains(., "Projects")]'), 5000);
        const projectsVisible = await projectsEl.isDisplayed();
        expect(projectsVisible).toBe(true);
      }
    }
  });
});
