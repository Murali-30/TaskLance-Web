import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private emailInput = By.css('input[type="email"]');
  private passwordInput = By.css('input[type="password"]');
  private signInBtn = By.xpath('//button[contains(., "Sign In")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async login(email = 'alice@example.com', password = 'password') {
    await this.navigate('http://localhost:5173/login');
    await this.safeType(this.emailInput, email);
    await this.safeType(this.passwordInput, password);
    await this.safeClick(this.signInBtn);
    await this.waitForUrl('/dashboard');
  }
}
