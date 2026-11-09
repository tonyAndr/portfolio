import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const locales = [
  ['en', 'index.html', '/'],
  ['es', 'es/index.html', '/es/'],
];
for (const [locale, file, route] of locales) {
  test(`${locale}: complete static page, metadata, and navigation`, async () => {
    const html = await readFile(`dist/${file}`, 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="https://apov.dev${route}"`),
    );
    for (const id of [
      'main',
      'top',
      'about',
      'work',
      'stack',
      'contact',
      'support',
    ]) {
      assert.match(html, new RegExp(`id="${id}"`));
    }
    for (const language of ['en', 'es', 'x-default'])
      assert.match(html, new RegExp(`hreflang="${language}"`));
    assert.match(html, /mailto:andropov.anton@gmail.com/);
    assert.match(
      html,
      /https:\/\/www.linkedin.com\/in\/anton-andropov-38a853110\//,
    );
    assert.equal((html.match(/<article\b/g) || []).length, 4);
    assert.doesNotMatch(
      html,
      /href="(?:#|javascript:|)"|\[PUBLIC_|\[PORTRAIT_|example\.com|your photo here/,
    );
    assert.doesNotMatch(
      html,
      /<iframe|<form|google-analytics|googletagmanager/,
    );
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
    for (const match of html.matchAll(/href="#([^"]+)"/g))
      assert.ok(ids.includes(match[1]), `Missing fragment ${match[1]}`);
    for (const match of html.matchAll(
      /(?:src|href)="(\/(?:_astro|og|institutional)\/[^"?#]+)"/g,
    )) {
      assert.ok(
        (await stat(path.join('dist', match[1]))).isFile(),
        `Missing asset ${match[1]}`,
      );
    }
  });
}

test('build excludes source documents, private notes, and environment files', async () => {
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else
        assert.doesNotMatch(
          file,
          /\.pdf$|\.env|handoff|award|obligations|IMG2025|reference\.png/i,
        );
    }
  }
  await walk('dist');
});

test('sitemap, robots, and real error page exist', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  assert.match(sitemap, /<loc>https:\/\/apov.dev\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/apov.dev\/es\/<\/loc>/);
  assert.equal((sitemap.match(/<url>/g) || []).length, 2);
  assert.match(
    await readFile('dist/robots.txt', 'utf8'),
    /Sitemap: https:\/\/apov.dev\/sitemap.xml/,
  );
  assert.match(await readFile('dist/404.html', 'utf8'), /noindex, follow/);
});
