const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://127.0.0.1:5173/';
const outputDir = path.resolve('tmp', 'qa-script-interaction');
fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const consoleIssues = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleIssues.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: '原创剧本档案' }).waitFor();
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert(!desktopOverflow, 'Desktop page has horizontal overflow.');

  const firstScript = page.getByRole('button', {
    name: '查看《两块门牌》的故事梗概、人物小传和分集大纲',
  });
  await firstScript.click();
  const scriptDialog = page.getByRole('dialog', { name: '《两块门牌》 剧本档案' });
  await scriptDialog.waitFor();
  await page.screenshot({ path: path.join(outputDir, 'desktop-script-summary.png') });

  await scriptDialog.getByRole('tab', { name: /人物小传/ }).click();
  assert(await scriptDialog.locator('.script-character-grid article').count() === 6, 'Character tab does not show 6 profiles.');
  await scriptDialog.getByRole('tab', { name: /分集大纲/ }).click();
  assert(await scriptDialog.locator('.script-chapter-list article').count() === 12, 'Two Doorplates outline does not show 12 episodes.');
  await page.keyboard.press('Escape');
  await scriptDialog.waitFor({ state: 'detached' });
  assert(await firstScript.evaluate((element) => document.activeElement === element), 'Focus did not return to the script card.');

  const riverScript = page.getByRole('button', {
    name: '查看《江水记得》的故事梗概、人物小传和六章结构',
  });
  await riverScript.click();
  const riverDialog = page.getByRole('dialog', { name: '《江水记得》 剧本档案' });
  await riverDialog.getByRole('tab', { name: /六章结构/ }).click();
  assert(await riverDialog.locator('.script-chapter-list article').count() === 6, 'River Remembers does not show its 6-part film structure.');
  await page.keyboard.press('Escape');

  await page.locator('#works').scrollIntoViewIfNeeded();
  const seriesPortals = page.locator('.series-portals > button');
  assert(await seriesPortals.count() === 2, 'Expected two series portals.');
  await seriesPortals.nth(0).click();
  const tongyouDialog = page.getByRole('dialog', { name: '通幽录 · 渝州篇' });
  await tongyouDialog.waitFor();
  assert((await tongyouDialog.locator('.episode-story-copy').innerText()).includes('故乡成了唯一证词'), 'Tongyoulu episode 1 story copy is missing.');
  await tongyouDialog.locator('.episode-menu-trigger').click();
  await tongyouDialog.locator('.episode-tab').nth(1).click();
  assert((await tongyouDialog.locator('.episode-story-copy').innerText()).includes('巷子会老'), 'Tongyoulu episode story did not update after selection.');
  await page.keyboard.press('Escape');

  await seriesPortals.nth(1).click();
  const maimaiDialog = page.getByRole('dialog', { name: '麦麦的魔法面包店' });
  await maimaiDialog.waitFor();
  assert((await maimaiDialog.locator('.episode-story-copy').innerText()).includes('顺着水波回来'), 'Maimai episode 1 story copy is missing.');
  await maimaiDialog.locator('.episode-menu-trigger').click();
  await maimaiDialog.locator('.episode-tab').nth(14).click();
  assert((await maimaiDialog.locator('.episode-story-copy').innerText()).includes('心里的光亮了'), 'Maimai episode 15 story copy did not update.');
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert(!mobileOverflow, 'Mobile page has horizontal overflow.');
  const mobileScript = page.getByRole('button', {
    name: '查看《两块门牌》的故事梗概、人物小传和分集大纲',
  });
  await mobileScript.click();
  const mobileDialog = page.getByRole('dialog', { name: '《两块门牌》 剧本档案' });
  await mobileDialog.getByRole('tab', { name: /人物小传/ }).click();
  const mobileGeometry = await mobileDialog.evaluate((dialog) => ({
    width: dialog.scrollWidth,
    clientWidth: dialog.clientWidth,
    viewportWidth: innerWidth,
  }));
  assert(mobileGeometry.width <= mobileGeometry.viewportWidth, 'Script dialog exceeds mobile viewport width.');
  assert(mobileGeometry.width === mobileGeometry.clientWidth, 'Script dialog has internal horizontal overflow.');
  await page.screenshot({ path: path.join(outputDir, 'mobile-script-characters.png') });
  await page.keyboard.press('Escape');

  assert(consoleIssues.length === 0, `Console issues: ${consoleIssues.join(' | ')}`);
  await browser.close();
  process.stdout.write(JSON.stringify({
    desktopOverflow,
    mobileOverflow,
    scriptTabs: ['故事梗概', '人物小传', '分集大纲 / 六章结构'],
    tongyouEpisodesChecked: [1, 2],
    maimaiEpisodesChecked: [1, 15],
    consoleIssues,
    screenshots: [
      path.join(outputDir, 'desktop-script-summary.png'),
      path.join(outputDir, 'mobile-script-characters.png'),
    ],
  }, null, 2));
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
