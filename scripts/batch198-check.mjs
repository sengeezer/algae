import { chromium } from 'playwright';

async function checkRoute(browser, route, title) {
  const page = await browser.newPage();
  try {
    const response = await page.goto(`http://localhost:3001/algorithms/${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    if (!response || !response.ok()) {
      console.error(`FAIL ${route}: HTTP ${response?.status()}`);
      return false;
    }
    const h1 = await page.locator('h1').first().textContent();
    const bodyLength = await page.locator('body').evaluate(el => el.innerText.length);
    if (!h1 || bodyLength < 120) {
      console.error(`FAIL ${route}: Missing h1 or body too short (${bodyLength} chars)`);
      return false;
    }
    console.log(`PASS ${route}: h1="${h1.substring(0, 40)}...", body=${bodyLength} chars`);
    return true;
  } catch (err) {
    console.error(`FAIL ${route}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await chromium.launch();
  const routes = [
    ['binary-tree-to-doubly-linked-list', 'Binary Tree to Doubly Linked List'],
    ['reverse-a-singly-linked-list-in-groups', 'Reverse a Singly Linked List in Groups'],
    ['reverse-a-doubly-linked-list-in-groups', 'Reverse a Doubly Linked List in Groups']
  ];
  
  let passed = 0;
  for (const [route, title] of routes) {
    if (await checkRoute(browser, route, title)) {
      passed++;
    }
  }
  
  await browser.close();
  console.log(`\nResult: ${passed}/${routes.length} routes verified`);
  process.exit(passed === routes.length ? 0 : 1);
}

main();
