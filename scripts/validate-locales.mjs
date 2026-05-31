import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');
const hangul = /[\u3131-\u318e\uac00-\ud7a3]/;
const postSlugs = [
  'adaptive-mobile-layout-handoff',
  'android',
  'browser-ui-validation-guardrails',
  'building-ai-native-cli-workflow',
  'claude-resume-troubleshooting',
  'codex-resume-tui-decision',
  'git',
  'jekyll',
  'jekyll-dependabot-cleanup',
  'linkedin-api-permission-check',
  'mysql',
  'windows-terminal-crash-fix',
];
const requiredPortfolioSections = [
  'selected-work',
  'aws-impact',
  'detailed-resume',
  'side-projects',
  'skills',
  'education',
  'full-records',
];
const checks = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    if (stat.isFile() && entry === 'index.html') checks.push(path);
  }
}

function fail(message, file) {
  const rel = relative(root, file).replaceAll('\\', '/');
  throw new Error(`${message}: ${rel}`);
}

walk(root);

for (const file of checks) {
  const rel = relative(root, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');
  const isEnglish = rel.startsWith('en/');
  const isJapanese = rel.startsWith('ja/');

  if (!isEnglish && !isJapanese) continue;

  if (html.includes('href="/portfolio/#full-records"')) {
    fail('Localized page links to Korean portfolio full records', file);
  }

  if (html.includes('currently kept in Korean') || html.includes('韓国語の原文')) {
    fail('Localized page contains placeholder translation copy', file);
  }

  if ((rel === 'en/portfolio/index.html' || rel === 'ja/portfolio/index.html')) {
    for (const sectionId of requiredPortfolioSections) {
      if (!html.includes(`id="${sectionId}"`)) {
        fail(`Localized portfolio is missing required section #${sectionId}`, file);
      }
    }
    for (const marker of ['HotDealppom', 'BikeNavi', 'claude-resume', 'codex-resume', 'image025.png']) {
      if (!html.includes(marker)) {
        fail(`Localized portfolio is missing expected detailed marker ${marker}`, file);
      }
    }
  }

  if (hangul.test(html)) {
    fail('Localized page still contains Hangul text', file);
  }

  const slug = rel.split('/')[1];
  const expectedLocale = isEnglish ? 'en' : 'ja';

  if (postSlugs.includes(slug)) {
    const rootPostLinks = [...html.matchAll(/href="\/([^/"#?]+)\//g)]
      .map((match) => match[1])
      .filter((candidate) => postSlugs.includes(candidate));
    const unexpectedRootPostLink = rootPostLinks.find((candidate) => candidate !== slug);

    if (unexpectedRootPostLink) {
      fail(`Localized post links to another Korean post path ${unexpectedRootPostLink}`, file);
    }

    const oppositeLocale = expectedLocale === 'en' ? 'ja' : 'en';
    if (!html.includes(`href="/${expectedLocale}/${slug}/"`)) {
      fail(`Localized post is missing self locale switch for ${slug}`, file);
    }
    if (!html.includes(`href="/${oppositeLocale}/${slug}/"`)) {
      fail(`Localized post is missing opposite locale switch for ${slug}`, file);
    }
    if (!html.includes(`href="/${slug}/"`)) {
      fail(`Localized post is missing Korean locale switch for ${slug}`, file);
    }
  } else {
    const badRootPostLink = html.match(/href="\/(adaptive-mobile-layout-handoff|android|browser-ui-validation-guardrails|building-ai-native-cli-workflow|claude-resume-troubleshooting|codex-resume-tui-decision|git|jekyll|jekyll-dependabot-cleanup|linkedin-api-permission-check|mysql|windows-terminal-crash-fix)\//);
    if (badRootPostLink) {
      fail(`Localized page links to Korean post path ${badRootPostLink[0]}`, file);
    }
  }
}

console.log(`Locale validation passed for ${checks.length} HTML files.`);
