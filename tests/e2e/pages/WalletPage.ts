import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class WalletPage extends BasePage {
  private walletLink = By.css('a[href="/wallet"]');
  private withdrawBtn = By.xpath('//button[contains(., "Withdraw Funds")]');
  private exportBtn = By.xpath('//button[contains(., "Export")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToWallet() {
    await this.safeClick(this.walletLink);
    await this.waitForElement(By.xpath('//h1[contains(., "Wallet")]'));
  }

  async withdrawFunds() {
    await this.safeClick(this.withdrawBtn);
  }

  async exportCSV() {
    await this.safeClick(this.exportBtn);
  }

  async verifyToast(text: string) {
    const el = await this.waitForElement(By.xpath(`//*[contains(text(), "${text}")]`));
    return await el.isDisplayed();
  }

  async isBalanceVisible() {
    const el = await this.waitForElement(By.xpath('//*[contains(text(), "Available Balance")]'));
    return await el.isDisplayed();
  }
}
