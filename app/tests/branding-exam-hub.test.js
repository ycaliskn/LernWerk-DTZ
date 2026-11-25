import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('DeutschKraft branding is used consistently in the mobile shell and manifest', () => {
  assert.match(index, /<title>DeutschKraft/);
  assert.match(index, /<strong>DeutschKraft<\/strong>/);
  assert.doesNotMatch(index, /<strong>LernWerk<\/strong>/);
  assert.equal(manifest.short_name, 'DeutschKraft');
  assert.match(serviceWorker, /deutschkraft-shell/);
});

test('the original lifting mascot and distinct launcher icons are bundled locally', () => {
  for (const name of ['deutschkraft-mascot.png','icon-180.png','icon-192.png','icon-512.png','icon.svg']) {
    assert.ok(existsSync(new URL(`../assets/${name}`, import.meta.url)), `${name} exists`);
  }
  assert.match(app, /hero-mascot/);
});

test('B1 Prüfungen is a separate hub with all four exam skills', () => {
  assert.match(app, /function renderExamHub\(\)/);
  assert.match(app, /if \(next === 'exams'\) return renderExamHub\(\);/);
  for (const skill of ['Hören','Lesen','Schreiben','Sprechen']) assert.match(app, new RegExp(skill));
  assert.match(app, /data-route="exams"/);
});
