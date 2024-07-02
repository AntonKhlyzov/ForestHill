const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(StealthPlugin());

async function scrapeVrboPrice(vrboUrl) {
    console.log('Launching browser...');
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

    // Log network requests
 page.on('request', request => {
    const url = request.url();
    if (url.includes('vrbo.com')) {
        console.log('Request:', url);
    }
});

    // Log request failures
    page.on('requestfailed', request => {
        console.log('Request failed:', request.url(), request.failure().errorText);
    });

    try {
        console.log('Navigating to:', vrboUrl);
        await page.goto(vrboUrl, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout

        console.log('Waiting for price selector...');
        await page.waitForSelector('#pdp-search-form span > div', { timeout: 30000 }); // Wait for price selector

        console.log('Extracting price...');
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        console.log('Price extracted:', price);

        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);

        // Capture screenshot on error
        await page.screenshot({ path: 'error_screenshot.png' });
        console.log('Screenshot captured.');

        return '$250'; // Handle the error gracefully with a default price
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

module.exports = { scrapeVrboPrice };
