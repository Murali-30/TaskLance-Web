import { describe, beforeAll, afterAll, afterEach } from '@jest/globals';
import { WebDriver, By, until, Key } from 'selenium-webdriver';
import { createDriver, BASE_URL, cleanupTestData, itPOM } from './utils';
import { BasePage } from './pages/BasePage';


describe('Proposal Workflow End-to-End', () => {
  let clientDriver: WebDriver;
  let freelancerDriver: WebDriver;
  let clientEmail: string;
  let freelancerEmail: string;
  let uniqueProjectTitle: string;

  beforeAll(async () => {
    clientDriver = await createDriver();
    freelancerDriver = await createDriver();
    const timestamp = Date.now();
    clientEmail = `client_${timestamp}@example.com`;
    freelancerEmail = `freelancer_${timestamp}@example.com`;
    uniqueProjectTitle = `Awesome Startup App ${timestamp}`;
  });

  afterAll(async () => {
    if (clientDriver) await clientDriver.quit();
    if (freelancerDriver) await freelancerDriver.quit();
  });

  afterEach(async () => {
    if (clientDriver) await cleanupTestData(clientDriver);
  });

  itPOM('client creates project, freelancer proposes, client accepts concurrently', () => clientDriver, async () => {
    const clientPage = new BasePage(clientDriver);
    const freelancerPage = new BasePage(freelancerDriver);

    // ==========================================
    // 1. Client Registration & Project Creation
    // ==========================================
    await clientDriver.get(`${BASE_URL}/register?role=client`);
    await clientDriver.wait(until.elementLocated(By.css('input[type="text"]')), 10000);
    await clientPage.safeType(By.css('input[type="text"]'), 'Charlie Client');
    await clientPage.safeType(By.css('input[type="email"]'), clientEmail);
    
    const clientPwdInputs = await clientDriver.findElements(By.css('input[type="password"]'));
    await clientPwdInputs[0].sendKeys('password');
    await clientPwdInputs[1].sendKeys('password');
    
    await clientPage.safeClick(By.css('input[type="checkbox"]'));
    await clientPage.safeClick(By.xpath('//button[contains(., "Sign Up")]'));

    await clientDriver.wait(until.urlContains('/dashboard'), 10000);
    
    await clientPage.safeClick(By.xpath('//*[contains(text(), "Post New Project")]'));
    await clientDriver.wait(until.urlContains('/projects/create'), 10000);
    
    await clientDriver.wait(until.elementLocated(By.xpath('//input[@placeholder="e.g. Build a responsive React dashboard"]')), 15000);
    await clientPage.safeType(By.xpath('//input[@placeholder="e.g. Build a responsive React dashboard"]'), uniqueProjectTitle);
    await clientPage.safeType(By.css('textarea'), 'We need an awesome app.');
    await clientPage.safeClick(By.xpath('//button[contains(., "Next")]'));
    
    await clientDriver.wait(until.elementLocated(By.css('input[type="number"]')), 15000);
    await clientPage.safeType(By.css('input[type="number"]'), '5000');
    await clientPage.safeClick(By.xpath('//button[contains(., "Next")]'));
    
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Post Project")]')), 15000);
    await clientPage.safeClick(By.xpath('//button[contains(., "Post Project")]'));
    
    // Project posted successfully
    await clientDriver.wait(until.urlMatches(/\/projects\/[a-zA-Z0-9]+/), 15000);
    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Project posted successfully!")]')), 15000);


    // ==========================================
    // 2. Freelancer Registration & Proposal
    // ==========================================
    await freelancerDriver.get(`${BASE_URL}/register?role=freelancer`);
    await freelancerDriver.wait(until.elementLocated(By.css('input[type="text"]')), 10000);
    await freelancerPage.safeType(By.css('input[type="text"]'), 'Fiona Freelancer');
    await freelancerPage.safeType(By.css('input[type="email"]'), freelancerEmail);
    
    const freePwdInputs = await freelancerDriver.findElements(By.css('input[type="password"]'));
    await freePwdInputs[0].sendKeys('password');
    await freePwdInputs[1].sendKeys('password');
    
    await freelancerPage.safeClick(By.css('input[type="checkbox"]'));
    await freelancerPage.safeClick(By.xpath('//button[contains(., "Sign Up")]'));

    await freelancerDriver.wait(until.urlContains('/dashboard'), 10000);

    // Freelancer navigates to Projects
    await freelancerPage.safeClick(By.css('a[href="/projects"]'));
    await freelancerDriver.wait(until.elementLocated(By.xpath('//input[contains(@placeholder, "Search projects")]')), 5000);
    
    // Wait slightly to ensure DB synced
    await freelancerDriver.sleep(1000);
    const searchInput = await freelancerDriver.findElement(By.xpath('//input[contains(@placeholder, "Search projects")]'));
    await searchInput.sendKeys(uniqueProjectTitle);
    
    await freelancerDriver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`)), 15000);
    await freelancerPage.safeClick(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`));
    
    // Verify "Send Proposal" button is visible
    await freelancerDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Send Proposal")]')), 5000);
    await freelancerPage.safeClick(By.xpath('//button[contains(., "Send Proposal")]'));

    // Submit Proposal Modal
    await freelancerDriver.wait(until.elementLocated(By.css('input[type="number"]')), 5000);
    await freelancerPage.safeType(By.css('input[type="number"]'), '4500');
    await freelancerPage.safeType(By.css('textarea'), 'I am an expert in building awesome apps.');
    
    // The submit button in the modal
    await freelancerPage.safeClick(By.xpath('//button[@type="submit" and contains(., "Send Proposal")]'));
    
    await freelancerDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Proposal sent successfully!")]')), 5000);
    await freelancerDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Proposal Sent")]')), 5000);


    // ==========================================
    // 3. Client Accepts Proposal
    // ==========================================
    // Client goes back to Dashboard -> Projects -> Project Details
    await clientPage.safeClick(By.css('a[href="/dashboard"]'));
    await clientPage.safeClick(By.css('a[href="/projects"]'));
    
    await clientDriver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`)), 15000);
    await clientPage.safeClick(By.xpath(`//h3[contains(text(), "${uniqueProjectTitle}")]`));

    // Check Proposals Tab
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Proposals")]')), 5000);
    await clientPage.safeClick(By.xpath('//button[contains(., "Proposals")]'));
    
    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "I am an expert in building awesome apps.")]')), 15000);
    await clientPage.safeClick(By.xpath('//button[contains(., "Accept Proposal")]'));

    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Proposal accepted. Project is now In Progress!")]')), 5000);
    
    // Verify project status changed
    await clientDriver.wait(until.elementLocated(By.xpath('//span[contains(text(), "in progress") or contains(text(), "In Progress")]')), 5000);

    // ==========================================
    // 4. Communication Check
    // ==========================================
    // Client checks Messages for automated chat
    await clientPage.safeClick(By.css('a[href="/messages"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Hi! I just accepted your proposal")]')), 10000);

    // Client sends a message
    const msgInput = await clientDriver.findElement(By.css('textarea[placeholder="Type a message..."]'));
    await msgInput.sendKeys('Thanks for accepting!');
    await msgInput.sendKeys(Key.ENTER);
    
    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Thanks for accepting!")]')), 5000);

    // Freelancer checks Messages and sees the message
    await freelancerPage.safeClick(By.css('a[href="/messages"]'));
    await freelancerDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Hi! I just accepted your proposal")]')), 10000);
    await freelancerDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Thanks for accepting!")]')), 5000);

    // ==========================================
    // 5. Screen & Button Verification
    // ==========================================
    // Client systematically navigates through every screen
    
    // 5a. Dashboard Verification
    await clientPage.safeClick(By.css('a[href="/dashboard"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//h1[contains(., "Welcome back")]')), 5000);
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Post New Project")]')), 5000);

    // 5b. Projects Verification
    await clientPage.safeClick(By.css('a[href="/projects"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//input[contains(@placeholder, "Search")]')), 5000);
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Post Project") or contains(., "Post New Project")]')), 5000);

    // 5c. Wallet Verification
    await clientPage.safeClick(By.css('a[href="/wallet"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Available Balance")]')), 5000);
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Add $500")]')), 5000);

    // 5d. Profile Verification
    await clientPage.safeClick(By.css('a[href="/profile"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//button[contains(., "Edit Profile")]')), 5000);

    // 5e. Settings Verification
    await clientPage.safeClick(By.css('a[href="/settings"]'));
    await clientDriver.wait(until.elementLocated(By.xpath('//h1[contains(., "Settings")]')), 5000);
    await clientDriver.wait(until.elementLocated(By.xpath('//h3[contains(., "Privacy & Security")]')), 5000);

    // Test completed successfully
  });
});
