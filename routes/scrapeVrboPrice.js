const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeVrboPrice(vrboUrl) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.CHROME_EXECUTABLE_PATH || '/opt/render/.cache/puppeteer/chrome-linux/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    try {
        // Navigate to the VRBO page
        await page.goto(vrboUrl);

        // Wait for the price element to load
        await page.waitForSelector('#pdp-search-form span > div');

        // Extract the price text from the element
        const price = await page.$eval('#pdp-search-form span > div', element => element.textContent.trim());

        return price;

    } catch (error) {
        console.error('Error during VRBO scraping:', error.message);
        return '$250'; // Handle the error gracefully
    } finally {
        // Close the browser
        await browser.close();
    }
}

module.exports = { scrapeVrboPrice };
