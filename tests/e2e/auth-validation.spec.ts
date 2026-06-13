import { describe, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver, BASE_URL, itPOM } from './utils';
import { BasePage } from './pages/BasePage';

describe('Auth Validation (30+ Cases)', () => {
  let driver: WebDriver;
  let page: BasePage;

  beforeAll(async () => {
    driver = await createDriver();
    page = new BasePage(driver);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  // ==========================================
  // REGISTRATION VALIDATION SCENARIOS
  // ==========================================
  const registerScenarios = [
    // Client Scenarios
    { role: 'client', name: '', email: 'test@test.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'empty name' },
    { role: 'client', name: 'A', email: 'test@test.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'very short name' },
    { role: 'client', name: 'John Doe', email: 'not-an-email', pwd: 'Password123!', confirm: 'Password123!', desc: 'invalid email format' },
    { role: 'client', name: 'John Doe', email: '', pwd: 'Password123!', confirm: 'Password123!', desc: 'empty email' },
    { role: 'client', name: 'John Doe', email: 'test@test', pwd: 'Password123!', confirm: 'Password123!', desc: 'incomplete email' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: '', confirm: 'Password123!', desc: 'empty password' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: 'short', confirm: 'short', desc: 'password too short' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: 'nouppercase1!', confirm: 'nouppercase1!', desc: 'password no uppercase' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: 'NOLOWERCASE1!', confirm: 'NOLOWERCASE1!', desc: 'password no lowercase' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: 'NoNumbers!!!', confirm: 'NoNumbers!!!', desc: 'password no numbers' },
    { role: 'client', name: 'John Doe', email: 'test@test.com', pwd: 'Password123!', confirm: 'Password124!', desc: 'passwords do not match' },
    { role: 'client', name: 'John Doe', email: 'alice@example.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'existing email' },

    // Freelancer Scenarios
    { role: 'freelancer', name: '', email: 'free@test.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'empty name' },
    { role: 'freelancer', name: 'A', email: 'free@test.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'very short name' },
    { role: 'freelancer', name: 'Fiona', email: 'not-an-email', pwd: 'Password123!', confirm: 'Password123!', desc: 'invalid email format' },
    { role: 'freelancer', name: 'Fiona', email: '', pwd: 'Password123!', confirm: 'Password123!', desc: 'empty email' },
    { role: 'freelancer', name: 'Fiona', email: 'test@test', pwd: 'Password123!', confirm: 'Password123!', desc: 'incomplete email' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: '', confirm: 'Password123!', desc: 'empty password' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: 'short', confirm: 'short', desc: 'password too short' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: 'nouppercase1!', confirm: 'nouppercase1!', desc: 'password no uppercase' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: 'NOLOWERCASE1!', confirm: 'NOLOWERCASE1!', desc: 'password no lowercase' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: 'NoNumbers!!!', confirm: 'NoNumbers!!!', desc: 'password no numbers' },
    { role: 'freelancer', name: 'Fiona', email: 'free@test.com', pwd: 'Password123!', confirm: 'Password124!', desc: 'passwords do not match' },
    { role: 'freelancer', name: 'Fiona', email: 'bob@example.com', pwd: 'Password123!', confirm: 'Password123!', desc: 'existing email' },
  ];

  describe.each(registerScenarios)('Registration Validation: $role - $desc', (scenario) => {
    itPOM(`should prevent registration with ${scenario.desc}`, () => driver, async () => {
      await driver.get(`${BASE_URL}/register?role=${scenario.role}`);
      await driver.wait(until.elementLocated(By.css('input[type="text"]')), 5000);
      
      const nameInput = await driver.findElement(By.css('input[type="text"]'));
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const pwdInputs = await driver.findElements(By.css('input[type="password"]'));
      
      // Clear fields and type
      if (scenario.name) { await nameInput.clear(); await nameInput.sendKeys(scenario.name); }
      if (scenario.email) { await emailInput.clear(); await emailInput.sendKeys(scenario.email); }
      if (scenario.pwd) { await pwdInputs[0].clear(); await pwdInputs[0].sendKeys(scenario.pwd); }
      if (scenario.confirm) { await pwdInputs[1].clear(); await pwdInputs[1].sendKeys(scenario.confirm); }
      
      await page.safeClick(By.xpath('//button[contains(., "Sign Up")]'));
      
      // We expect the URL to remain /register because it should fail validation
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/register');
    });
  });

  // ==========================================
  // LOGIN VALIDATION SCENARIOS
  // ==========================================
  const loginScenarios = [
    { email: '', pwd: 'password', desc: 'empty email' },
    { email: 'not-an-email', pwd: 'password', desc: 'invalid email' },
    { email: 'alice@example.com', pwd: '', desc: 'empty password' },
    { email: 'alice@example.com', pwd: 'wrongpassword', desc: 'wrong password' },
    { email: 'nonexistent@test.com', pwd: 'password123', desc: 'unregistered email' },
    { email: 'admin\' OR \'1\'=\'1', pwd: 'password', desc: 'SQL injection string in email' },
    { email: '<script>alert(1)</script>@test.com', pwd: 'password', desc: 'XSS string in email' },
  ];

  describe.each(loginScenarios)('Login Validation: $desc', (scenario) => {
    itPOM(`should prevent login with ${scenario.desc}`, () => driver, async () => {
      await driver.get(`${BASE_URL}/login`);
      await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
      
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const pwdInput = await driver.findElement(By.css('input[type="password"]'));
      
      if (scenario.email) {
        await emailInput.clear();
        await emailInput.sendKeys(scenario.email);
      }
      if (scenario.pwd) {
        await pwdInput.clear();
        await pwdInput.sendKeys(scenario.pwd);
      }
      
      await page.safeClick(By.xpath('//button[contains(., "Sign In")]'));
      
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });
  });
});
