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
            '--headless',
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
        await page.waitForSelector('#pdp-search-form span > div', { timeout: 30000 }); // Wait for price selector
        console.log('Extracting price...');
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        console.log('Price extracted:', price);
        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        return '$250'; // Handle the error gracefully with a default price
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

module.exports = { scrapeVrboPrice };
