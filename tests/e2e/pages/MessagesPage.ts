import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class MessagesPage extends BasePage {
  private messagesLink = By.css('a[href="/messages"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToMessages() {
    await this.safeClick(this.messagesLink);
    await this.waitForElement(By.xpath('//h1[contains(., "Messages")] | //h2[contains(., "No Messages")]'));
  }

  async isNoMessagesTitleVisible() {
    const el = await this.waitForElement(By.xpath('//h2[contains(., "No Messages")]'));
    return await el.isDisplayed();
  }

  async isNoMessagesTextVisible() {
    const el = await this.waitForElement(By.xpath('//*[contains(text(), "You don\'t have any active conversations yet.")]'));
    return await el.isDisplayed();
  }
}
