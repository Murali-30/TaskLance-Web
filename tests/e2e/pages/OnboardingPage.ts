import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  private nextBtn = By.xpath('//button[contains(., "Next")]');
  private getStartedBtn = By.xpath('//button[contains(., "Get Started")]');
  private freelancerRole = By.xpath('//*[contains(text(), "I\'m a Freelancer")]');
  private createAccountBtn = By.xpath('//button[contains(., "Create Account")]');
  private logInLink = By.xpath('//*[contains(text(), "Log In")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async completeOnboardingToLogin() {
    await this.navigate('http://localhost:5173/');
    await this.waitForUrl('/onboarding');
    
    await this.safeClick(this.nextBtn);
    await this.safeClick(this.nextBtn);
    await this.safeClick(this.getStartedBtn);

    // Wait for role select screen
    await this.waitForElement(By.xpath('//*[contains(text(), "Choose your role")]'));
    await this.safeClick(this.freelancerRole);
    await this.safeClick(this.createAccountBtn);

    await this.safeClick(this.logInLink);
  }
}
