const puppeteer = require('puppeteer-extra');
require("dotenv").config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

console.log('Puppeteer Executable Path:', puppeteer.executablePath());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
       args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote'],
       executablePath: 
        process.env.NODE_ENV === 'production' 
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    try {
        console.log('Navigating to VRBO URL:', vrboUrl);
        await page.goto(vrboUrl, { waitUntil: 'networkidle2' });

        console.log('Waiting for price selector to appear...');
        await page.waitForSelector('#pdp-search-form span > div', { timeout: 10000 }); // 10 seconds timeout

        console.log('Selector found, extracting price...');
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        console.log('Extracted Price:', price);
        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        return '$250'; // Handle the error gracefully
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeVrboPrice };
