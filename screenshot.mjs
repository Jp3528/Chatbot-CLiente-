import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const outputPath = 'C:/Users/USER/.gemini/antigravity/brain/47536342-bc76-4196-9306-05974b6b6fa4/live_preview.png';
  await page.screenshot({ path: outputPath });

  await browser.close();
  console.log('Captura generada con exito en:', outputPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
