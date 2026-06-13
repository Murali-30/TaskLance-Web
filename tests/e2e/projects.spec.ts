import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver, cleanupTestData, login } from './utils';
import { BasePage } from './pages/BasePage';

describe('Projects & Kanban', () => {
  let driver: WebDriver;
  let uniqueProjectTitle: string;

  beforeAll(async () => {
    driver = await createDriver();
    uniqueProjectTitle = `Test Project ${Date.now()}`;
  });

  afterAll(async () => {
    await driver.quit();
  });

  afterEach(async () => {
    await cleanupTestData(driver);
  });

  beforeEach(async () => {
    await login(driver, `client_${Date.now()}@example.com`);
  });

  it('should create, filter, and view project details', async () => {
    const basePage = new BasePage(driver);
    // 1. Create a project
    const postProjectBtn = By.xpath('//*[contains(text(), "Post New Project")]');
    await basePage.safeClick(postProjectBtn);

    await driver.wait(until.urlContains('/projects/create'), 10000);
    
    await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="e.g. Build a responsive React dashboard"]')), 5000);
    await driver.findElement(By.xpath('//input[@placeholder="e.g. Build a responsive React dashboard"]')).sendKeys(uniqueProjectTitle);
    await driver.findElement(By.css('textarea')).sendKeys('Test Description');
    await basePage.safeClick(By.xpath('//button[contains(., "Next")]'));
    
    await driver.wait(until.elementLocated(By.css('input[type="number"]')), 5000);
    await driver.findElement(By.css('input[type="number"]')).sendKeys('1000');
    await basePage.safeClick(By.xpath('//button[contains(., "Next")]'));
    
    await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Post Project")]')), 5000);
    await basePage.safeClick(By.xpath('//button[contains(., "Post Project")]'));
    
    // It redirects to the project details page
    await driver.wait(until.urlMatches(/\/projects\/[a-zA-Z0-9]+/), 10000);
    
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Project posted successfully!")]')), 15000);
    const toastVisible = await driver.findElement(By.xpath('//*[contains(text(), "Project posted successfully!")]')).isDisplayed();
    expect(toastVisible).toBe(true);

    // 2. Filter projects
    await basePage.safeClick(By.xpath('//a[contains(., "Projects")]'));
    
    await driver.wait(until.elementLocated(By.xpath('//h1[contains(., "Projects")]')), 5000);
    const titleVisible = await driver.findElement(By.xpath('//h1[contains(., "Projects")]')).isDisplayed();
    expect(titleVisible).toBe(true);

    await driver.wait(until.elementLocated(By.xpath('//input[contains(@placeholder, "Search projects")]')), 5000);
    await driver.findElement(By.xpath('//input[contains(@placeholder, "Search projects")]')).sendKeys(uniqueProjectTitle);
    
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${uniqueProjectTitle}")]`)), 15000);
    const projectVisible = await driver.findElement(By.xpath(`//*[contains(text(), "${uniqueProjectTitle}")]`)).isDisplayed();
    expect(projectVisible).toBe(true);

    // 3. View project details
    await driver.findElement(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`)).click();
    
    await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(), "${uniqueProjectTitle}")]`)), 5000);
    const detailTitleVisible = await driver.findElement(By.xpath(`//h1[contains(text(), "${uniqueProjectTitle}")]`)).isDisplayed();
    expect(detailTitleVisible).toBe(true);
    
    // Invoices Tab exists
    await driver.findElement(By.xpath('//button[contains(., "Invoices")]')).click();
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Project Invoices")]')), 5000);
    const invoicesVisible = await driver.findElement(By.xpath('//*[contains(text(), "Project Invoices")]')).isDisplayed();
    expect(invoicesVisible).toBe(true);
    
    // Switch to Freelancer to test Deliverables
    await driver.findElement(By.xpath('//*[contains(text(), "Logout") or contains(text(), "Log out")]')).click();
    await driver.wait(until.urlContains('/login'), 5000);
    
    await login(driver, `freelancer_${Date.now()}@example.com`);
    
    await driver.wait(until.elementLocated(By.css('a[href="/projects"]')), 5000);
    await driver.findElement(By.css('a[href="/projects"]')).click();
    
    await driver.wait(until.elementLocated(By.xpath('//input[contains(@placeholder, "Search projects")]')), 5000);
    await driver.findElement(By.xpath('//input[contains(@placeholder, "Search projects")]')).sendKeys(uniqueProjectTitle);
    
    await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`)), 5000);
    await driver.findElement(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`)).click();
    
    await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Send Proposal")]')), 5000);
    const sendProposalVisible = await driver.findElement(By.xpath('//button[contains(., "Send Proposal")]')).isDisplayed();
    expect(sendProposalVisible).toBe(true);
  });
});
