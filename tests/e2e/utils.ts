import * as fs from 'fs';
import * as path from 'path';
import { it } from '@jest/globals';
// @ts-ignore
import chromedriver from 'chromedriver';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

export const BASE_URL = 'http://localhost:5173';

export async function createDriver(): Promise<WebDriver> {
  const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);

  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // Removed to open Chrome visibly as requested
  if (process.env.CI) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080'); // Fix interactability issues
  options.addArguments('--disable-extensions');
  
  return await new Builder()
    .forBrowser('chrome')
    .setChromeService(serviceBuilder)
    .setChromeOptions(options)
    .build();
}

export async function login(driver: WebDriver, email: string = 'alice@example.com') {
  await driver.get(`${BASE_URL}/login`);
  
  await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
  await driver.findElement(By.css('input[type="email"]')).sendKeys(email);
  await driver.findElement(By.css('input[type="password"]')).sendKeys('password');
  
  const signInButton = await driver.findElement(By.xpath('//button[contains(., "Sign In")]'));
  await signInButton.click();
  
  await driver.wait(until.urlContains('/dashboard'), 10000);
}

export async function cleanupTestData(driver: WebDriver) {
  try {
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript(`
      if (window.__cleanupTestData) {
        window.__cleanupTestData(); // Execute asynchronously without returning Promise
      }
    `);
  } catch (e) {
    console.error('Cleanup failed in utils', e);
  }
}

export async function takeScreenshot(driver: WebDriver, testName: string) {
  try {
    const data = await driver.takeScreenshot();
    const artifactsDir = path.join(process.cwd(), 'tests', 'e2e', 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(artifactsDir, `${safeName}_${Date.now()}.png`);
    fs.writeFileSync(filePath, data, 'base64');
    console.log(`📸 Screenshot saved: ${filePath}`);
  } catch (err) {
    console.error('Failed to take screenshot', err);
  }
}

// Enterprise test runner wrapper ensuring screenshots on failure
export function itPOM(name: string, driverFn: () => WebDriver, testFn: () => Promise<void>) {
  it(name, async () => {
    try {
      await testFn();
    } catch (error) {
      const driver = driverFn();
      if (driver) {
        await takeScreenshot(driver, name);
      }
      throw error; // Rethrow to let Jest fail the test
    }
  }, 120000);
}
