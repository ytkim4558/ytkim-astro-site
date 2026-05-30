import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const htmlFiles = [];
const failures = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    if (stat.isFile() && entry.endsWith('.html')) htmlFiles.push(path);
  }
}

function toRoute(file) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function targetPathFromUrl(rawUrl, currentFile) {
  const [pathPart] = rawUrl.split('#');
  if (!pathPart) return currentFile;
  const cleanPath = decodeURIComponent(pathPart.split('?')[0]);
  const absolute = cleanPath.startsWith('/')
    ? join(root, cleanPath)
    : resolve(dirname(currentFile), cleanPath);

  if (cleanPath.endsWith('/')) return join(absolute, 'index.html');
  if (cleanPath.endsWith('.html') || cleanPath.includes('.')) return absolute;
  return join(absolute, 'index.html');
}

function hasAnchor(file, anchor) {
  if (!anchor) return true;
  if (!existsSync(file)) return false;
  const html = readFileSync(file, 'utf8');
  const decoded = decodeURIComponent(anchor);
  return html.includes(`id="${decoded}"`) || html.includes(`name="${decoded}"`);
}

function shouldSkip(rawUrl) {
  return (
    !rawUrl ||
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('mailto:') ||
    rawUrl.startsWith('tel:') ||
    rawUrl.startsWith('javascript:') ||
    rawUrl.startsWith('data:') ||
    rawUrl.includes('${')
  );
}

function recordFailure(file, rawUrl, reason) {
  failures.push(`${toRoute(file)} -> ${rawUrl} (${reason})`);
}

walk(root);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const refs = [
    ...html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g),
  ].map((match) => match[1]);

  for (const rawUrl of refs) {
    if (shouldSkip(rawUrl)) continue;

    const [pathPart, anchor] = rawUrl.split('#');
    if (!pathPart && anchor) {
      if (!hasAnchor(file, anchor)) recordFailure(file, rawUrl, 'missing same-page anchor');
      continue;
    }

    const target = normalize(targetPathFromUrl(rawUrl, file));
    const relativeTarget = relative(root, target);
    if (relativeTarget.startsWith('..')) {
      recordFailure(file, rawUrl, 'outside dist');
      continue;
    }

    if (!existsSync(target)) {
      recordFailure(file, rawUrl, 'missing file');
      continue;
    }

    if (anchor && !hasAnchor(target, anchor)) {
      recordFailure(file, rawUrl, 'missing target anchor');
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Broken internal links found:\n${failures.join('\n')}`);
}

console.log(`Internal link validation passed for ${htmlFiles.length} HTML files.`);
