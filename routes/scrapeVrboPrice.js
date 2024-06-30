const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(StealthPlugin());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
        headless: true,
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
    try {
        await page.goto(vrboUrl, { waitUntil: 'networkidle2' }); // Wait for network idle
        await page.waitForSelector('#pdp-search-form span > div', { timeout: 30000 }); // Wait for price selector
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        return '$250'; // Handle the error gracefully with a default price
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeVrboPrice };
