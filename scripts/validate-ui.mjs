import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { chromium } from '@playwright/test';

const repoRoot = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const distRoot = join(repoRoot, 'dist');
const failures = [];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function walk(dir, predicate, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, predicate, out);
    if (stat.isFile() && predicate(path)) out.push(path);
  }
  return out;
}

function routeFromHtmlFile(path) {
  const rel = relative(distRoot, path).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/index\.html$/, '')}`;
}

function createStaticServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    let file = join(distRoot, pathname);
    if (!existsSync(file) && !extname(file)) file = join(distRoot, pathname, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${url.pathname}`);
      return;
    }

    res.writeHead(200, { 'content-type': mimeTypes[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function assertNoHorizontalOverflow(page, label, selector = 'html') {
  const overflow = await page.locator(selector).evaluate((node) => {
    const el = node instanceof HTMLElement ? node : document.documentElement;
    return {
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  if (overflow.scrollWidth > overflow.clientWidth + 2 && overflow.scrollWidth > overflow.viewportWidth + 2) {
    failures.push(`${label}: horizontal overflow (${overflow.scrollWidth}px > ${overflow.clientWidth}px)`);
  }
}

async function validatePageBasics(page, baseUrl, route, viewportName) {
  const label = `${viewportName} ${route}`;
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

  const bodyTextLength = await page.locator('body').innerText().then((text) => text.trim().length);
  if (bodyTextLength < 120) failures.push(`${label}: page text is unexpectedly short (${bodyTextLength} chars)`);

  const headingCount = await page.locator('h1, h2').count();
  if (headingCount === 0) failures.push(`${label}: no visible heading structure`);

  await assertNoHorizontalOverflow(page, label);

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images
      .filter((img) => img instanceof HTMLImageElement)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') ?? '')
  );
  if (brokenImages.length > 0) failures.push(`${label}: broken images: ${brokenImages.join(', ')}`);
}

async function validatePortfolioModal(page, baseUrl, viewportName, route, modalSpec) {
  const label = `${viewportName} ${route} ${modalSpec.target}`;
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

  const trigger = page.locator(`[data-portfolio-modal][href="${modalSpec.target}"]`).first();
  if ((await trigger.count()) === 0) {
    failures.push(`${label}: modal trigger is missing`);
    return;
  }

  await trigger.click();
  const dialog = page.locator('#portfolio-modal[open]');
  await dialog.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
    failures.push(`${label}: modal did not open`);
  });
  if ((await dialog.count()) === 0) return;

  const content = page.locator('#portfolio-modal-content');
  const text = await content.innerText();
  if (text.trim().length < modalSpec.minTextLength) {
    failures.push(`${label}: modal detail text is too short (${text.trim().length} chars)`);
  }
  for (const marker of modalSpec.textMarkers) {
    if (!text.includes(marker)) failures.push(`${label}: modal text missing marker "${marker}"`);
  }

  const imageCount = await content.locator('img').count();
  if (imageCount < modalSpec.minImages) failures.push(`${label}: expected at least ${modalSpec.minImages} images, found ${imageCount}`);

  const iframeCount = await content.locator('iframe').count();
  if (iframeCount < modalSpec.minIframes) failures.push(`${label}: expected at least ${modalSpec.minIframes} iframes, found ${iframeCount}`);

  const brokenModalImages = await content.locator('img').evaluateAll((images) =>
    images
      .filter((img) => img instanceof HTMLImageElement)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') ?? '')
  );
  if (brokenModalImages.length > 0) failures.push(`${label}: broken modal images: ${brokenModalImages.join(', ')}`);

  await assertNoHorizontalOverflow(page, label, '#portfolio-modal-content');

  if (viewportName === 'mobile') {
    const crampedGalleryItems = await content.locator('.portfolio-gallery a').evaluateAll((items) => {
      const rects = items.map((item) => item.getBoundingClientRect());
      return rects.filter((rect) => rect.width < Math.min(260, window.innerWidth - 60)).length;
    });
    if (crampedGalleryItems > 0) failures.push(`${label}: ${crampedGalleryItems} gallery items are too narrow on mobile`);
  }

  if (process.env.VALIDATE_UI_SCREENSHOTS === '1') {
    const screenshotDir = join(repoRoot, '.tmp-shots');
    mkdirSync(screenshotDir, { recursive: true });
    await dialog.screenshot({
      path: join(screenshotDir, `modal-${viewportName}-${route.replace(/\W+/g, '-')}-${modalSpec.target.slice(1)}.png`),
    });
  }

  await page.keyboard.press('Escape');
}

const htmlRoutes = walk(distRoot, (path) => path.endsWith('index.html'))
  .map(routeFromHtmlFile)
  .filter((route) => !route.startsWith('/posts/'))
  .sort();

const viewports = [
  ['desktop', { width: 1366, height: 900 }],
  ['mobile', { width: 390, height: 844, isMobile: true }],
];

const portfolioModalSpecs = [
  {
    target: '#side-projects',
    minTextLength: 500,
    minImages: 0,
    minIframes: 0,
    textMarkers: ['claude-resume', 'codex-resume', 'HotDealppom'],
  },
  {
    target: '#detail-hotdealppom',
    minTextLength: 220,
    minImages: 4,
    minIframes: 1,
    textMarkers: ['HotDealppom', 'KoNLPy', 'MariaDB'],
  },
  {
    target: '#detail-bikenavi',
    minTextLength: 140,
    minImages: 5,
    minIframes: 3,
    textMarkers: ['BikeNavi', 'Google Maps', 'Tmap'],
  },
];

if (!existsSync(distRoot)) {
  throw new Error('dist directory is missing. Run npm run build before npm run validate:ui.');
}

const { server, baseUrl } = await createStaticServer();
const browser = await chromium.launch();

try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const route of htmlRoutes) {
      await validatePageBasics(page, baseUrl, route, viewportName);
    }

    for (const route of ['/portfolio/', '/en/portfolio/', '/ja/portfolio/']) {
      for (const modalSpec of portfolioModalSpecs) {
        await validatePortfolioModal(page, baseUrl, viewportName, route, modalSpec);
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  throw new Error(`UI validation failed:\n${failures.join('\n')}`);
}

console.log(`UI validation passed for ${htmlRoutes.length} pages across desktop/mobile and portfolio modal content.`);
