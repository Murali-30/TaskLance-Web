import { describe, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { WebDriver } from 'selenium-webdriver';
import { createDriver, cleanupTestData, itPOM } from './utils';
import { LoginPage } from './pages/LoginPage';
import { WalletPage } from './pages/WalletPage';

describe('Wallet', () => {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let walletPage: WalletPage;

  beforeAll(async () => {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    walletPage = new WalletPage(driver);
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

  itPOM('should view wallet page', () => driver, async () => {
    await walletPage.navigateToWallet();
    const balanceVisible = await walletPage.isBalanceVisible();
    expect(balanceVisible).toBe(true);
  });

  itPOM('should withdraw funds and show toast', () => driver, async () => {
    await walletPage.navigateToWallet();
    await walletPage.withdrawFunds();
    
    // Because balance is 0 for a new user, it will show an error toast
    const toastVisible = await walletPage.verifyToast("No funds available to withdraw.");
    expect(toastVisible).toBe(true);
  });

  itPOM('should export CSV', () => driver, async () => {
    await walletPage.navigateToWallet();
    await walletPage.exportCSV();
    
    // Ensure the action doesn't crash the browser
    await driver.sleep(1000);
  });
});
