import { chromium } from "playwright";

const baseUrl = process.env.ALGAE_BASE_URL ?? "http://localhost:3001";
const ignoredHmrPath = "/_next/webpack-hmr";
const catalogCardSelector = "article";

function isIgnorableRuntimeNoise(value) {
  return value.includes(ignoredHmrPath) || value.includes("hot-update") || value.includes("WebSocket");
}

function recordFailure(failures, message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

async function expectTextIncludes(locator, value, failures, message) {
  const text = (await locator.textContent())?.trim() ?? "";

  if (!text.includes(value)) {
    recordFailure(failures, `${message}; got \"${text}\"`);
    return false;
  }

  console.log(`PASS ${message}`);
  return true;
}

async function expectCount(locator, expected, failures, message) {
  const count = await locator.count();

  if (count !== expected) {
    recordFailure(failures, `${message}; expected ${expected}, got ${count}`);
    return false;
  }

  console.log(`PASS ${message}`);
  return true;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
const failedRequests = [];
const failures = [];

page.on("console", (message) => {
  if (message.type() !== "error") {
    return;
  }

  const text = message.text();
  if (!isIgnorableRuntimeNoise(text)) {
    consoleErrors.push(text);
  }
});

page.on("requestfailed", (request) => {
  const failure = `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "unknown error"}`;
  if (!isIgnorableRuntimeNoise(failure)) {
    failedRequests.push(failure);
  }
});

try {
  console.log(`Smoke checking ${baseUrl}`);

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /search interview algorithms/i }).waitFor();

  const homeTitle = await page.title();
  if (homeTitle !== "Algae") {
    recordFailure(failures, `expected home title \"Algae\", got \"${homeTitle}\"`);
  } else {
    console.log("PASS home title is Algae");
  }

  const homeText = (await page.textContent("body")) ?? "";
  if (!homeText.includes("Binary Search")) {
    recordFailure(failures, "expected Binary Search to appear on the home page");
  } else {
    console.log("PASS home page contains Binary Search");
  }

  const searchInput = page.getByRole("textbox", { name: "Search" });
  await searchInput.fill("recursive search tree");
  await page.waitForURL(/\?q=recursive\+search\+tree/);
  await page.getByRole("heading", { name: "Backtracking Search" }).waitFor();

  await expectCount(
    page.locator(catalogCardSelector),
    1,
    failures,
    "search narrows the catalog to one result",
  );

  const clearFiltersButton = page.getByRole("button", { name: "Clear filters" });
  await clearFiltersButton.click();
  await page.waitForURL(baseUrl);

  const techniqueFilter = page.getByLabel("Technique");
  await techniqueFilter.selectOption("Memoization");
  await page.waitForURL(/\?technique=Memoization/);
  await page.getByRole("heading", { name: "Memoization DP" }).waitFor();

  await expectCount(
    page.locator(catalogCardSelector),
    1,
    failures,
    "technique filter narrows the catalog to one result",
  );

  await page.getByRole("link", { name: "Open reference" }).click();
  await page.waitForURL(new RegExp(`${baseUrl}/algorithms/memoization-dp$`));

  const detailHeading = (await page.locator("h1").textContent())?.trim() ?? "";
  if (detailHeading !== "Memoization DP") {
    recordFailure(failures, `expected detail heading \"Memoization DP\", got \"${detailHeading}\"`);
  } else {
    console.log("PASS memoization-dp detail heading is correct");
  }

  const detailText = (await page.textContent("body")) ?? "";
  const detailKeywords = ["Reference Notes", "Why It Surfaces", "Worked Example", "Reference implementation"];
  if (!detailKeywords.some((keyword) => detailText.includes(keyword))) {
    recordFailure(
      failures,
      `expected detail page to include one of: ${detailKeywords.join(", ")}`,
    );
  } else {
    console.log("PASS memoization-dp detail page contains reference content");
  }

  await expectTextIncludes(
    page.locator("body"),
    "one hash map away",
    failures,
    "memoization-dp detail page includes newly added route content",
  );

  if (consoleErrors.length > 0) {
    recordFailure(failures, `browser console errors detected: ${consoleErrors.join(" | ")}`);
  }

  if (failedRequests.length > 0) {
    recordFailure(failures, `failed network requests detected: ${failedRequests.join(" | ")}`);
  }

  if (failures.length === 0) {
    console.log("Smoke check passed.");
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  process.exitCode = 1;
}