/**
 * Post-level rules for the newest blog post (blogPosts[0]), run by the agency
 * blog writer (blog/writer/PROMPT.md, STEP 4) before the repo checks. CI does
 * not check these: word count, dashes, title and description length, tags,
 * author, and that every internal href is a real route.
 *
 * Usage: npx tsx scripts/blog-writer-postcheck.ts [index]   (default 0, the newest)
 */
import { readFileSync } from 'node:fs';
import { blogPosts } from '../src/data/blogPosts';

const p = blogPosts[Number(process.argv[2] ?? 0)];
const errs: string[] = [];
const today = new Date().toISOString().slice(0, 10);
const words = p.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const all = JSON.stringify(p);

const dash = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
if (dash.test(all) || /&mdash;|&ndash;|\\u201[34]/.test(all)) errs.push('dash found');
if (words < 500 || words > 800) errs.push(`visible words ${words}, need 500 to 800`);
if (p.title.length >= 65) errs.push(`title is ${p.title.length} chars`);
if (p.description.length >= 160) errs.push(`description is ${p.description.length} chars`);
if (p.tags.length < 2 || p.tags.length > 4) errs.push(`${p.tags.length} tags`);
if (p.author !== 'DigitalCraft AI') errs.push('author must be DigitalCraft AI');
if (p.date > today) errs.push('future date');
if (blogPosts.filter((x) => x.date === p.date).length > 1) errs.push('date already used');
if (blogPosts.filter((x) => x.slug === p.slug).length > 1) errs.push('slug already used');
if (/<h1/i.test(p.content)) errs.push('h1 in content');

const routes = new Set(
  [...readFileSync('src/App.tsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1]),
);
const slugs = new Set(blogPosts.map((x) => x.slug));
const hrefs = [...p.content.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith('/'));
for (const h of hrefs) {
  const path = h.split(/[?#]/)[0];
  const ok = routes.has(path) || (path.startsWith('/blog/') && slugs.has(path.slice(6)));
  if (!ok) errs.push(`dead link ${h}`);
}
if (!hrefs.some((h) => /\/demo(\/|$)/.test(h))) errs.push('no demo link');
if (!hrefs.some((h) => /^\/(construction|realestate|homeservices|ai-for-[a-z-]+)$/.test(h))) {
  errs.push('no construction, real estate or home-services landing page link');
}
if (!p.content.includes('href="https://calendly.com/mutaaf"')) errs.push('CTA Calendly link missing');

console.log(`${p.slug} | ${words} words | ${p.date}`);
if (errs.length) {
  console.log('POSTCHECK FAIL: ' + errs.join('; '));
  process.exit(1);
}
console.log('POSTCHECK OK');
