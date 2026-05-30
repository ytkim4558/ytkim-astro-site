import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const pages = [
  ['ko', 'portfolio/index.html'],
  ['en', 'en/portfolio/index.html'],
  ['ja', 'ja/portfolio/index.html'],
];
const failures = [];

function attrsToMap(attrs) {
  const map = {};
  for (const match of attrs.matchAll(/\s([:\w-]+)=["']([^"']*)["']/g)) {
    map[match[1]] = match[2];
  }
  return map;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findElement(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<([a-z0-9]+)([^>]*)\\bid=["']${escaped}["'][^>]*>`, 'i');
  const match = html.match(pattern);
  if (!match || match.index === undefined) return null;
  return { tag: match[1].toLowerCase(), start: match.index };
}

function modalContentSlice(html, element) {
  if (element.tag === 'section') {
    const end = html.indexOf('</section>', element.start);
    return end === -1 ? html.slice(element.start) : html.slice(element.start, end + '</section>'.length);
  }

  const boundaryByTag = {
    div: /<(?:div\b[^>]*class=["'][^"']*\bcompany-heading\b|h1\b)/gi,
    h2: /<(?:h1|h2|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/gi,
    h3: /<(?:h1|h2|h3|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/gi,
  };
  const boundary = boundaryByTag[element.tag] ?? /<(?:h1|h2|h3|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/gi;
  boundary.lastIndex = element.start + 1;
  const next = boundary.exec(html);
  return html.slice(element.start, next?.index ?? html.length);
}

for (const [locale, relPath] of pages) {
  const file = join(root, relPath);
  if (!existsSync(file)) {
    failures.push(`${locale}: missing built portfolio page ${relPath}`);
    continue;
  }

  const html = readFileSync(file, 'utf8');
  const modalLinks = [...html.matchAll(/<a\b([^>]*\bdata-portfolio-modal\b[^>]*)>/gi)];

  for (const link of modalLinks) {
    const attrs = attrsToMap(link[1]);
    const href = attrs.href ?? '';
    const title = attrs['data-modal-title'] ?? '(untitled)';

    if (!href.startsWith('#')) {
      failures.push(`${locale}: ${title} modal link must use an in-page detail target, found ${href || '(empty)'}`);
      continue;
    }

    const targetId = href.slice(1);
    const target = findElement(html, targetId);
    if (!target) {
      failures.push(`${locale}: ${title} modal target #${targetId} is missing`);
      continue;
    }

    if (target.tag === 'li') {
      failures.push(`${locale}: ${title} modal target #${targetId} points to a summary list item, not detailed content`);
      continue;
    }

    const content = modalContentSlice(html, target);
    const text = stripTags(content);
    const mediaCount = (content.match(/<(?:img|iframe)\b/gi) ?? []).length;
    const listItemCount = (content.match(/<li\b/gi) ?? []).length;

    if (text.length < 160 && listItemCount < 2) {
      failures.push(`${locale}: ${title} modal target #${targetId} has too little detail`);
    }

    if (/hotdeal|mobile experiments/i.test(`${title} ${attrs['data-modal-meta'] ?? ''}`)) {
      if (!/HotDealppom/i.test(content) || !/image025\.png/i.test(content) || !/youtube\.com\/embed\/VqLyBLSEtoQ/i.test(content)) {
        failures.push(`${locale}: ${title} modal target #${targetId} does not include HotDealppom screenshots and video detail`);
      }
      if (mediaCount < 2) {
        failures.push(`${locale}: ${title} modal target #${targetId} should include HotDealppom media, found ${mediaCount}`);
      }
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Portfolio modal validation failed:\n${failures.join('\n')}`);
}

console.log(`Portfolio modal validation passed for ${pages.length} localized portfolio pages.`);
