const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push(`${request.url()}: ${request.failure().errorText}`);
  });

  try {
    console.log('--- Navigating to Home Page ---');
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('Page Title:', title);

    const heading = await page.locator('h1, h2').first().textContent();
    console.log('Heading:', heading);

    const cards = await page.locator('.card, [class*="card"]').count();
    console.log('Algorithm Cards Count:', cards);

    console.log('\n--- Navigating to Binary Search Page ---');
    await page.goto('http://127.0.0.1:3001/algorithms/binary-search', { waitUntil: 'networkidle' });
    const bsTitle = await page.locator('h1').textContent();
    console.log('Binary Search Page Header:', bsTitle);

    const content = await page.locator('body').textContent();
    const hasKeyContent = content.toLowerCase().includes('binary search');
    console.log('Contains "binary search" text:', hasKeyContent);

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:', consoleErrors);
    }
    if (failedRequests.length > 0) {
      console.log('\nFailed Requests:', failedRequests);
    }
    await browser.close();
  }
})();
