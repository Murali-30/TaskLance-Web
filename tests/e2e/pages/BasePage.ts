import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BasePage {
  protected driver: WebDriver;
  protected timeout: number = 10000;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async navigate(url: string) {
    await this.driver.get(url);
  }

  async waitForElement(locator: By, timeout = this.timeout): Promise<WebElement> {
    const el = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async safeClick(locator: By, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const el = await this.waitForElement(locator);
        await el.click();
        return;
      } catch (e: any) {
        if (e.name === 'StaleElementReferenceError' && i < retries - 1) {
          await this.driver.sleep(100);
          continue;
        }
        if (e.name === 'ElementClickInterceptedError' || e.name === 'ElementNotInteractableError') {
          try {
            const el = await this.waitForElement(locator);
            await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
            await this.driver.executeScript('arguments[0].click();', el);
            return;
          } catch (err: any) {
             if (err.name === 'StaleElementReferenceError' && i < retries - 1) {
                await this.driver.sleep(100);
                continue;
             }
             throw err;
          }
        }
        throw e;
      }
    }
  }

  async safeType(locator: By, text: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const el = await this.waitForElement(locator);
        await el.clear();
        await el.sendKeys(text);
        return;
      } catch (e: any) {
        if (e.name === 'StaleElementReferenceError' && i < retries - 1) {
          await this.driver.sleep(100); // wait and retry
          continue;
        }
        throw e;
      }
    }
  }

  async getElementText(locator: By): Promise<string> {
    const el = await this.waitForElement(locator);
    return await el.getText();
  }

  async waitForUrl(urlFragment: string, timeout = this.timeout) {
    await this.driver.wait(until.urlContains(urlFragment), timeout);
  }
}
