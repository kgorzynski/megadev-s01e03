// Screenshot the built page as the desk sees it: `npm run build`, then `npm run shot`.
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const page = 'kb/incidents/4471-causes';
const port = 4319;
const browsers = ['/usr/bin/brave', '/usr/bin/chromium', '/usr/bin/google-chrome'];
const executablePath = process.env.SHOT_BROWSER ?? browsers.find((b) => existsSync(b));

const server = spawn('node_modules/.bin/vite', ['preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' });
try {
  const url = `http://127.0.0.1:${port}/${page}`;
  for (let i = 0; i < 50; i++) {
    if (await fetch(url).then((r) => r.ok, () => false)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch({ executablePath, headless: true });
  const tab = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await tab.goto(url, { waitUntil: 'networkidle' });
  const stamp = await tab.locator('.stamp').innerText();
  console.log(stamp);
  if (!/desk ref DR-[0-9A-Z]{4}-[0-9A-Z]{4}/.test(stamp)) throw new Error(`no desk ref on the page: ${stamp}`);
  await tab.screenshot({ path: 'docs/4471-causes.png', fullPage: true });
  await browser.close();
  copyFileSync(`build/${page}.html`, 'docs/4471-causes.html');
} finally {
  server.kill();
}
