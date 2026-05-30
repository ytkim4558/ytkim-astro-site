import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const distRoot = join(repoRoot, 'dist');
const failures = [];

function attrsToMap(attrs) {
  const map = {};
  for (const match of attrs.matchAll(/\s([:\w-]+)=["']([^"']*)["']/g)) {
    map[match[1]] = match[2];
  }
  for (const match of attrs.matchAll(/\s([:\w-]+)(?=\s|>|$)/g)) {
    if (!(match[1] in map)) map[match[1]] = true;
  }
  return map;
}

function hasElementId(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\bid=["']${escaped}["']`, 'i').test(html);
}

function collectAnchorTargets(html, filter) {
  return new Set(
    [...html.matchAll(/<a\b([^>]*)>/gi)]
      .map((match) => attrsToMap(match[1]))
      .filter(filter)
      .map((attrs) => attrs.href)
      .filter((href) => href?.startsWith('#'))
      .map((href) => href.slice(1))
  );
}

function findContentSlice(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startPattern = new RegExp(`<([a-z0-9]+)([^>]*)\\bid=["']${escaped}["'][^>]*>`, 'i');
  const start = html.match(startPattern);
  if (!start || start.index === undefined) return '';

  const tag = start[1].toLowerCase();
  const boundaries = {
    section: /<\/section>/i,
    details: /<\/details>/i,
    div: /<(?:div\b[^>]*class=["'][^"']*\bcompany-heading\b|h1\b)/i,
    h2: /<(?:h1|h2|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/i,
    h3: /<(?:h1|h2|h3|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/i,
  };
  const afterStart = html.slice(start.index + start[0].length);
  const boundary = boundaries[tag] ?? /<(?:h1|h2|h3|section|details|div\b[^>]*class=["'][^"']*\bcompany-heading\b)/i;
  const end = afterStart.search(boundary);
  return end === -1 ? html.slice(start.index) : html.slice(start.index, start.index + start[0].length + end);
}

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

function distHtml(route) {
  const normalized = route.endsWith('/') ? route : `${route}/`;
  return join(distRoot, normalized, 'index.html');
}

function validatePosts() {
  const postsDir = join(repoRoot, 'src', 'content', 'posts');
  const postFiles = walk(postsDir, (path) => /\.(md|mdx)$/i.test(path));
  const listingFiles = [
    'index.html',
    'en/index.html',
    'ja/index.html',
    ...walk(join(distRoot, 'tag'), (path) => path.endsWith('index.html')).map((path) => relative(distRoot, path)),
    ...walk(join(distRoot, 'en', 'tag'), (path) => path.endsWith('index.html')).map((path) => relative(distRoot, path)),
    ...walk(join(distRoot, 'ja', 'tag'), (path) => path.endsWith('index.html')).map((path) => relative(distRoot, path)),
  ]
    .map((path) => join(distRoot, path))
    .filter(existsSync)
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  for (const file of postFiles) {
    const source = readFileSync(file, 'utf8');
    if (/^draft:\s*true\s*$/m.test(source)) continue;

    const slug = file.replace(/\\/g, '/').split('/').pop().replace(/\.(md|mdx)$/i, '').toLowerCase();
    const routes = [`/${slug}/`, `/posts/${slug}/`, `/en/${slug}/`, `/ja/${slug}/`];

    for (const route of routes) {
      if (!existsSync(distHtml(route))) {
        failures.push(`post ${slug}: missing built route ${route}`);
      }
    }

    if (!listingFiles.includes(`href="/${slug}/"`)) {
      failures.push(`post ${slug}: Korean canonical route /${slug}/ is not reachable from index or tag listings`);
    }
    if (!listingFiles.includes(`href="/en/${slug}/"`)) {
      failures.push(`post ${slug}: English route /en/${slug}/ is not reachable from index or tag listings`);
    }
    if (!listingFiles.includes(`href="/ja/${slug}/"`)) {
      failures.push(`post ${slug}: Japanese route /ja/${slug}/ is not reachable from index or tag listings`);
    }
  }
}

function validatePortfolio() {
  const pages = [
    ['ko', 'portfolio/index.html'],
    ['en', 'en/portfolio/index.html'],
    ['ja', 'ja/portfolio/index.html'],
  ];
  const requiredReachableContent = [
    { id: 'detail-aws', access: 'modal' },
    { id: 'detail-cj', access: 'modal' },
    { id: 'detail-gbike', access: 'modal' },
    { id: 'detail-teamnova', access: 'modal' },
    { id: 'detail-diotek', access: 'modal' },
    { id: 'detail-digitalaria', access: 'modal' },
    { id: 'side-projects', access: 'modal-or-anchor' },
    {
      id: 'detail-hotdealppom',
      access: 'modal',
      contains: ['HotDealppom', 'youtube.com/embed/VqLyBLSEtoQ', 'image025.png'],
    },
  ];
  const intentionallyHiddenContent = new Set(['detailed-resume', 'full-records']);

  for (const [locale, relPath] of pages) {
    const file = join(distRoot, relPath);
    if (!existsSync(file)) {
      failures.push(`${locale} portfolio: missing built page ${relPath}`);
      continue;
    }

    const html = readFileSync(file, 'utf8');
    const modalTargets = collectAnchorTargets(html, (attrs) => 'data-portfolio-modal' in attrs);
    const anchorTargets = collectAnchorTargets(html, () => true);

    for (const id of intentionallyHiddenContent) {
      if (!hasElementId(html, id)) {
        failures.push(`${locale} portfolio: intentionally hidden content #${id} is declared but missing`);
      }
    }

    for (const item of requiredReachableContent) {
      if (!hasElementId(html, item.id)) {
        failures.push(`${locale} portfolio: required content #${item.id} is missing`);
        continue;
      }

      const modalReachable = modalTargets.has(item.id);
      const anchorReachable = anchorTargets.has(item.id);
      if (item.access === 'modal' && !modalReachable) {
        failures.push(`${locale} portfolio: required content #${item.id} is not reachable through a portfolio modal`);
      }
      if (item.access === 'modal-or-anchor' && !modalReachable && !anchorReachable) {
        failures.push(`${locale} portfolio: required content #${item.id} is not reachable through a modal or visible anchor`);
      }

      if (item.contains) {
        const content = findContentSlice(html, item.id);
        for (const marker of item.contains) {
          if (!content.includes(marker)) {
            failures.push(`${locale} portfolio: required content #${item.id} is reachable but missing marker ${marker}`);
          }
        }
      }
    }
  }
}

validatePosts();
validatePortfolio();

if (failures.length > 0) {
  throw new Error(`Content reachability validation failed:\n${failures.join('\n')}`);
}

console.log('Content reachability validation passed for posts and localized portfolio content.');
