import { chromium } from "playwright";

const baseUrl = process.env.ALGAE_BASE_URL ?? "http://localhost:3001";
const ignoredHmrPath = "/_next/webpack-hmr";

function isIgnorableRuntimeNoise(value) {
  return value.includes(ignoredHmrPath) || value.includes("hot-update") || value.includes("WebSocket");
}

function recordFailure(failures, message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
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

  await page.goto(new URL("/algorithms/binary-search", baseUrl).toString(), {
    waitUntil: "domcontentloaded",
  });

  const detailHeading = (await page.locator("h1").textContent())?.trim() ?? "";
  if (detailHeading !== "Binary Search") {
    recordFailure(failures, `expected detail heading \"Binary Search\", got \"${detailHeading}\"`);
  } else {
    console.log("PASS binary-search detail heading is correct");
  }

  const detailText = (await page.textContent("body")) ?? "";
  const detailKeywords = ["Reference Notes", "Why It Surfaces", "Worked Example"];
  if (!detailKeywords.some((keyword) => detailText.includes(keyword))) {
    recordFailure(
      failures,
      `expected detail page to include one of: ${detailKeywords.join(", ")}`,
    );
  } else {
    console.log("PASS binary-search detail page contains reference content");
  }

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