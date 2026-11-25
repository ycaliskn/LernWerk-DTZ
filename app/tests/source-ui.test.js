import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('source library is linked from both home and study-mode menu', () => {
  const links = app.match(/data-route="sources"/g) || [];
  assert.ok(links.length >= 2);
  assert.match(app, /document\.querySelector\('\[data-route="sources"\]'\)\?\.addEventListener\('click', renderSources\)/);
});

test('grammar study screen provides a direct source shortcut', () => {
  assert.match(app, /id="grammarSources"/);
  assert.match(app, /document\.querySelector\('#grammarSources'\)\?\.addEventListener\('click', renderSources\)/);
});

test('source screen presents curriculum and rights/attribution information', () => {
  assert.match(app, /Kaynaklar ve gramer müfredatı/);
  assert.match(app, /Bu seviye için referanslar/);
  assert.match(app, /Telif \/ kullanım/);
  assert.match(app, /onaylanmış ya da bu kurumlarla bağlantılı bir ürün değildir/);
});
