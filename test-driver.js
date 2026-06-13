import 'chromedriver';
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

(async function() {
  try {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    console.log('Building driver...');
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    console.log('Driver built successfully.');
    await driver.quit();
  } catch (e) {
    console.error('Error:', e);
  }
})();
