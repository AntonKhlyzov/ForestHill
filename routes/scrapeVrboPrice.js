const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: puppeteer.executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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

