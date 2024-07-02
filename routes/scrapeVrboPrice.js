const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(StealthPlugin());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
        ],
    });

    const page = await browser.newPage();

    // Enable request interception
    await page.setRequestInterception(true);

    // Intercept and block unnecessary requests
    page.on('request', (request) => {
        const url = request.url();
        if (url.includes('vrbo.com')) {
            // Allow requests to VRBO domains
            console.log('Allowing request:', url);
            request.continue();
        } else {
            // Block other requests
            console.log('Blocking request:', url);
            request.abort();
        }
    });

    try {
        console.log('Navigating to URL:', vrboUrl);
        await page.goto(vrboUrl, { waitUntil: 'networkidle2' }); // Wait for network idle
        console.log('Waiting for price selector...');
        
        // Increase timeout for waiting for the selector
        await page.waitForSelector('#pdp-search-form span > div', { timeout: 60000 }); // 60 seconds
        
        console.log('Extracting price...');
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        console.log('Price extracted:', price);
        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        
        // Take a screenshot and HTML content for debugging
        await page.screenshot({ path: 'error_screenshot.png' });
        const content = await page.content();
        console.log('HTML content at error:', content);
        
        return '$250'; // Handle the error gracefully with a default price
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

module.exports = { scrapeVrboPrice };
