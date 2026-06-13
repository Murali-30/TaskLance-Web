import { By, WebDriver, until } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  private editProfileBtn = By.xpath('//button[contains(., "Edit Profile")]');
  private saveProfileBtn = By.xpath('//button[contains(., "Save Profile")]');
  private successToast = By.xpath('//*[contains(text(), "Profile updated successfully!")]');
  
  constructor(driver: WebDriver) {
    super(driver);
  }

  async verifyProfileName(name: string) {
    try {
      const el = await this.waitForElement(By.xpath(`//h1[contains(., "${name}")]`));
      return await el.isDisplayed();
    } catch (e: any) {
      if (e.name === 'StaleElementReferenceError') {
        const el = await this.waitForElement(By.xpath(`//h1[contains(., "${name}")]`));
        return await el.isDisplayed();
      }
      throw e;
    }
  }

  async updateName(oldName: string, newName: string) {
    await this.safeClick(this.editProfileBtn);
    const nameInput = By.css(`input[value="${oldName}"]`);
    
    await this.safeType(nameInput, newName);
    await this.safeClick(this.saveProfileBtn);
    await this.waitForElement(this.successToast);
  }

  async toggleGitHubConnection() {
    const githubDiv = await this.waitForElement(By.xpath('//div[contains(@class, "flex items-center justify-between") and .//span[contains(text(), "GitHub")]]'));
    const githubConnectBtn = await githubDiv.findElement(By.css('button'));
    
    let btnText = await githubConnectBtn.getText();
    await this.driver.executeScript('arguments[0].click();', githubConnectBtn);
    
    if (btnText === 'Connect') {
      await this.waitForElement(By.xpath('//*[contains(text(), "GitHub connected.")]'));
      await this.driver.wait(async () => {
        return await githubConnectBtn.getText() === 'Disconnect';
      }, this.timeout);
    } else {
      await this.waitForElement(By.xpath('//*[contains(text(), "GitHub disconnected.")]'));
      await this.driver.wait(async () => {
        return await githubConnectBtn.getText() === 'Connect';
      }, this.timeout);
    }
  }
  
  async getGitHubButtonText() {
    const githubDiv = await this.waitForElement(By.xpath('//div[contains(@class, "flex items-center justify-between") and .//span[contains(text(), "GitHub")]]'));
    const githubConnectBtn = await githubDiv.findElement(By.css('button'));
    return await githubConnectBtn.getText();
  }
}
