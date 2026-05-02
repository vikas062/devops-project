import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Catch console errors and logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
        console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to frontend...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });

    await browser.close();
    console.log("Done checking.");
})();
