const puppeteer = require('puppeteer-extra');
require("dotenv").config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
console.log(puppeteer.executablePath());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
       args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote',],
       executablePath: 
        process.env.NODE_ENV === 'production' 
        ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    try {
        await page.goto(vrboUrl);
        await page.waitForSelector('#pdp-search-form span > div');
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());
        return price;
    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        return '$250'; // Handle the error gracefully
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeVrboPrice };

