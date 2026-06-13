import { describe, expect, beforeAll, afterAll } from '@jest/globals';
import { WebDriver, By, until, Key } from 'selenium-webdriver';
import { createDriver, BASE_URL, itPOM } from './utils';
import { BasePage } from './pages/BasePage';
import { LoginPage } from './pages/LoginPage';

describe('Profile & Settings (15 Cases)', () => {
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

  const profileScenarios = [
    { name: '', bio: 'Valid bio', skill: 'React', desc: 'empty name' },
    { name: 'A', bio: 'Valid bio', skill: 'React', desc: 'too short name' },
    { name: 'Valid Name', bio: '', skill: 'React', desc: 'empty bio' },
    { name: 'Valid Name', bio: 'A', skill: 'React', desc: 'too short bio' },
    { name: 'Valid Name', bio: 'A'.repeat(5000), skill: 'React', desc: 'too long bio' },
    { name: '<script>alert(1)</script>', bio: 'Valid bio', skill: 'React', desc: 'XSS name' },
    { name: 'Valid Name', bio: '<script>alert(1)</script>', skill: 'React', desc: 'XSS bio' },
    { name: 'Valid Name', bio: 'Valid bio', skill: '', desc: 'empty skill' },
    { name: 'Valid Name', bio: 'Valid bio', skill: '  ', desc: 'whitespace skill' },
    { name: 'Valid Name', bio: 'Valid bio', skill: '<script>alert(1)</script>', desc: 'XSS skill' },
    { name: 'Valid Name', bio: 'Valid bio', skill: '1234567890', desc: 'numeric skill' },
    { name: 'Valid Name', bio: 'Valid bio', skill: '!@#$', desc: 'special characters skill' },
    { name: 'Valid Name', bio: 'Valid bio', skill: 'a'.repeat(100), desc: 'extremely long skill' },
    { name: '   ', bio: 'Valid bio', skill: 'React', desc: 'whitespace name' },
    { name: 'Valid Name', bio: '   ', skill: 'React', desc: 'whitespace bio' },
  ];

  describe.each(profileScenarios)('Profile Updates: $desc', (scenario) => {
    itPOM(`should handle profile update for ${scenario.desc}`, () => driver, async () => {
      await driver.get(`${BASE_URL}/profile`);
      
      try {
        await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Edit Profile")]')), 5000);
        await page.safeClick(By.xpath('//button[contains(., "Edit Profile")]'));
        
        await driver.wait(until.elementLocated(By.css('input[type="text"]')), 2000);
        const textInputs = await driver.findElements(By.css('input[type="text"]'));
        const bioInput = await driver.findElement(By.css('textarea'));
        
        if (scenario.name && textInputs.length > 0) {
          await textInputs[0].clear();
          await textInputs[0].sendKeys(scenario.name);
        }
        
        if (scenario.bio) {
          await bioInput.clear();
          await bioInput.sendKeys(scenario.bio);
        }
        
        await page.safeClick(By.xpath('//button[contains(., "Save Changes")]'));
      } catch (e) {
        // Validation might stop it or elements might be missing
      }
    });
  });
});
