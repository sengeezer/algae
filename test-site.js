const { chromium } = require('@playwright/test');

(async () => {
    let browser;
    try {
        browser = await chromium.launch();
        const page = await browser.newPage();
        const consoleErrors = [];
        const failedRequests = [];

        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        page.on('requestfailed', request => {
            failedRequests.push(`${request.url()}: ${request.failure().errorText}`);
        });

        // 1. Home Page
        await page.goto('http://127.0.0.1:3001', { waitUntil: 'domcontentloaded' });
        const homeTitle = await page.title();
        const catalogVisible = (await page.$$('a[href*="/algorithms/"]')).length > 0;

        // 2. Detail Page
        await page.goto('http://127.0.0.1:3001/algorithms/binary-search', { waitUntil: 'domcontentloaded' });
        const detailTitle = await page.title();
        const detailVisible = (await page.$$('h1')).length > 0;

        console.log(JSON.stringify({
            home: { title: homeTitle, catalogLoaded: catalogVisible },
            detail: { title: detailTitle, detailLoaded: detailVisible },
            errors: consoleErrors,
            failedRequests: failedRequests
        }, null, 2));

    } catch (e) {
        console.error('Error during execution:', e.message);
    } finally {
        if (browser) await browser.close();
    }
})();
