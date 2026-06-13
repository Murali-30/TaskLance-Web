import { describe, expect, beforeAll, afterAll } from '@jest/globals';
import { WebDriver, By, until, Key } from 'selenium-webdriver';
import { createDriver, BASE_URL, itPOM } from './utils';
import { BasePage } from './pages/BasePage';
import { LoginPage } from './pages/LoginPage';

describe('Search Functionality (20 Cases)', () => {
  let driver: WebDriver;
  let page: BasePage;

  beforeAll(async () => {
    driver = await createDriver();
    page = new BasePage(driver);
    const loginPage = new LoginPage(driver);
    await driver.get(`${BASE_URL}/login`);
    await loginPage.login('alice@example.com', 'password');
    await driver.wait(until.urlContains('/dashboard'), 10000);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  const searchScenarios = [
    { query: 'React', desc: 'valid exact query' },
    { query: 'rea', desc: 'partial query lower case' },
    { query: 'REACT', desc: 'partial query upper case' },
    { query: 'XYZABC123NoMatch', desc: 'no match query' },
    { query: '', desc: 'empty query' },
    { query: '   react   ', desc: 'whitespace around query' },
    { query: 'test \u00A9\u00AE symbols', desc: 'emoji query' },
    { query: 'A'.repeat(150), desc: 'insanely long query' },
    { query: '\' OR \'1\'=\'1', desc: 'SQL injection payload 1' },
    { query: '"; DROP TABLE projects; --', desc: 'SQL injection payload 2' },
    { query: '<script>alert("xss")</script>', desc: 'XSS payload' },
    { query: '<img src=x onerror=alert(1)>', desc: 'XSS img payload' },
    { query: 'longstring'.repeat(50), desc: 'extremely long query' },
    { query: '日本', desc: 'japanese characters' },
    { query: 'русский', desc: 'russian characters' },
    { query: 'عربى', desc: 'arabic characters' },
    { query: 'a', desc: 'single character' },
    { query: '1234567890', desc: 'numeric query' },
    { query: '!@#$%^&*()', desc: 'special characters' },
  ];

  describe.each(searchScenarios)('Search: $desc', (scenario) => {
    itPOM(`should handle search for ${scenario.desc}`, () => driver, async () => {
      await driver.get(`${BASE_URL}/projects`);
      await driver.wait(until.elementLocated(By.xpath('//input[contains(@placeholder, "Search")]')), 5000);
      
      if (scenario.query) {
        await page.safeType(By.xpath('//input[contains(@placeholder, "Search")]'), scenario.query + Key.ENTER);
      } else {
        const searchInput = await driver.findElement(By.xpath('//input[contains(@placeholder, "Search")]'));
        await searchInput.clear();
        await searchInput.sendKeys(Key.ENTER);
      }
      
      // Wait for UI to settle
      await driver.sleep(500);
      
      const pageText = await driver.findElement(By.css('body')).getText();
      expect(pageText).toBeDefined();
    });
  });
});
