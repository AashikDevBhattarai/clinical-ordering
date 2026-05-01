import { Builder, By, Key, until } from "selenium-webdriver";

const baseUrl = process.env.SELENIUM_BASE_URL ?? "http://127.0.0.1:5173";
const browserName = process.env.SELENIUM_BROWSER ?? "chrome";
const selectAllModifier = process.platform === "darwin" ? Key.COMMAND : Key.CONTROL;

const driver = await new Builder().forBrowser(browserName).build();

async function waitForTestId(testId, timeout = 15000) {
  return driver.wait(until.elementLocated(By.css(`[data-testid="${testId}"]`)), timeout);
}

try {
  await driver.get(baseUrl);

  const patientRow = await driver.wait(
    until.elementLocated(By.css('[data-testid^="patient-row-"]')),
    15000,
  );
  await patientRow.click();

  const orderedBy = await waitForTestId("ordered-by-input");
  await orderedBy.sendKeys("Dr. WebDriver");

  const reason = await waitForTestId("order-reason-input");
  await reason.sendKeys("Selenium smoke workflow validation");

  const placeOrderButton = await waitForTestId("place-order-button");
  await placeOrderButton.click();

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(), 'draft report created')]")),
    15000,
  );

  const findings = await waitForTestId("report-findings-input");
  await findings.sendKeys(Key.chord(selectAllModifier, "a"), Key.DELETE);
  await findings.sendKeys("Normal LV size and function by Selenium smoke test.");

  await (await waitForTestId("finalize-report-button")).click();
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Report finalized.')]")), 15000);

  const note = await waitForTestId("report-action-note-input");
  await note.sendKeys("Automated amendment note");
  await (await waitForTestId("amend-report-button")).click();
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Report amended.')]")), 15000);

  const cancelNote = await waitForTestId("report-action-note-input");
  await cancelNote.sendKeys(Key.chord(selectAllModifier, "a"), Key.DELETE);
  await cancelNote.sendKeys("Automated cancel note");
  await (await waitForTestId("cancel-report-button")).click();
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Report canceled.')]")), 15000);
} finally {
  await driver.quit();
}
