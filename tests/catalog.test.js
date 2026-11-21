import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOP, FILTER_GROUPS, PRODUCTS } from '../site/js/products.js';

test('el catálogo tiene ids únicos y todo lo necesario', () => {
  assert.ok(SHOP.key && SHOP.name);
  const ids = PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of PRODUCTS) {
    assert.ok(p.name && p.desc && p.alt && p.img, p.id);
    assert.ok(Number.isInteger(p.price) && p.price > 0, p.id);
    assert.ok(p.variants.length > 0, p.id);
  }
});

test('las variantes tienen ids únicos y stock entero', () => {
  for (const p of PRODUCTS) {
    const vids = p.variants.map((v) => v.id);
    assert.equal(new Set(vids).size, vids.length, p.id);
    for (const v of p.variants) assert.ok(Number.isInteger(v.stock) && v.stock >= 0, `${p.id}/${v.id}`);
  }
});

test('cada valor de filtro de los productos existe en los filtros', () => {
  for (const g of FILTER_GROUPS) {
    const valid = new Set(g.options.map((o) => o.id));
    for (const p of PRODUCTS) {
      for (const v of [].concat(p[g.key] ?? [])) assert.ok(valid.has(v), `${p.id}: ${g.key}=${v}`);
    }
  }
});

test('cada categoría de los filtros tiene al menos un producto', () => {
  for (const g of FILTER_GROUPS) {
    for (const o of g.options.filter((x) => x.id !== 'all')) {
      assert.ok(PRODUCTS.some((p) => [].concat(p[g.key] ?? []).includes(o.id)), `${g.key}=${o.id} está vacío`);
    }
  }
});

test('los detalles son pares [etiqueta, valor] no vacíos', () => {
  for (const p of PRODUCTS) {
    assert.ok(Array.isArray(p.details) && p.details.length > 0, p.id);
    for (const d of p.details) assert.ok(Array.isArray(d) && d.length === 2 && d[0] && d[1], p.id);
  }
});
