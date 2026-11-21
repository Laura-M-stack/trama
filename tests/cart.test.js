import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_QTY, lineKey, addLine, setLineQty, removeLine, count, subtotal, subscriptionSavings, installments,
  formatPrice, normalizePostal, zoneFor, shippingFor, remainingForFreeShipping, priceFrom, hasPriceRange,
  stockStatus, applyFilters, parseStored, unitPrice, findVariant,
} from '../site/js/cart.js';

const CATALOG = [
  { id: 'a', name: 'Camisa de lino', desc: 'Fresca y liviana', category: 'camisas', price: 10000, variants: [
    { id: 's', label: 'S', stock: 4 }, { id: 'm', label: 'M', stock: 0 }, { id: 'l', label: 'L', stock: 25 }] },
  { id: 'b', name: 'Alimento perro', desc: 'Croquetas', category: 'alimento', audience: ['perros'], price: 8000, subscribable: true, variants: [
    { id: '3', label: '3 kg', price: 8000, stock: 10 }, { id: '15', label: '15 kg', price: 30000, stock: 2 }] },
  { id: 'c', name: 'Gorra', desc: 'Algodón', category: 'accesorios', price: 5000, variants: [{ id: 'u', label: 'Único', stock: 0 }] },
];

test('addLine suma y respeta el stock de la variante', () => {
  let items = addLine([], CATALOG, { id: 'a', vid: 's' }, 3);
  assert.deepEqual(items, [{ id: 'a', vid: 's', sub: false, qty: 3 }]);
  items = addLine(items, CATALOG, { id: 'a', vid: 's' }, 5);
  assert.equal(items[0].qty, 4); // stock 4
});

test('addLine no agrega variantes sin stock, ni inexistentes', () => {
  assert.deepEqual(addLine([], CATALOG, { id: 'a', vid: 'm' }), []);
  assert.deepEqual(addLine([], CATALOG, { id: 'zzz', vid: 's' }), []);
  assert.deepEqual(addLine([], CATALOG, { id: 'a', vid: 'zzz' }), []);
  assert.deepEqual(addLine([], CATALOG, { id: 'c', vid: 'u' }), []);
});

test('addLine tope general MAX_QTY aunque haya más stock', () => {
  const items = addLine([], CATALOG, { id: 'a', vid: 'l' }, 99);
  assert.equal(items[0].qty, MAX_QTY);
});

test('addLine ignora cantidades inválidas', () => {
  for (const q of [0, -3, NaN, 'abc', undefined]) {
    const out = addLine([], CATALOG, { id: 'a', vid: 'l' }, q);
    assert.equal(count(out), q === undefined ? 1 : 0);
  }
  assert.equal(addLine([], CATALOG, { id: 'a', vid: 'l' }, 2.9)[0].qty, 2);
});

test('la misma variante con y sin suscripción son líneas distintas', () => {
  let items = addLine([], CATALOG, { id: 'b', vid: '3', sub: false });
  items = addLine(items, CATALOG, { id: 'b', vid: '3', sub: true });
  assert.equal(items.length, 2);
  assert.notEqual(lineKey(items[0]), lineKey(items[1]));
});

test('la suscripción se ignora en productos que no la permiten', () => {
  const items = addLine([], CATALOG, { id: 'a', vid: 's', sub: true });
  assert.equal(items[0].sub, false);
});

test('setLineQty cambia, limita por stock y elimina en 0', () => {
  let items = addLine([], CATALOG, { id: 'b', vid: '15' }, 1);
  const key = lineKey(items[0]);
  assert.equal(setLineQty(items, CATALOG, key, 2)[0].qty, 2);
  assert.equal(setLineQty(items, CATALOG, key, 9)[0].qty, 2); // stock 2
  assert.deepEqual(setLineQty(items, CATALOG, key, 0), []);
  assert.equal(setLineQty(items, CATALOG, 'nope', 5), items);
});

test('removeLine y count', () => {
  let items = addLine([], CATALOG, { id: 'a', vid: 's' }, 2);
  items = addLine(items, CATALOG, { id: 'b', vid: '3' }, 1);
  assert.equal(count(items), 3);
  assert.equal(count(removeLine(items, lineKey(items[0]))), 1);
});

test('subtotal usa el precio de la variante y el descuento por suscripción', () => {
  let items = addLine([], CATALOG, { id: 'a', vid: 's' }, 2); // 20000
  items = addLine(items, CATALOG, { id: 'b', vid: '15' }, 1); // 30000
  assert.equal(subtotal(items, CATALOG), 50000);
  items = addLine([], CATALOG, { id: 'b', vid: '15', sub: true }, 1);
  assert.equal(subtotal(items, CATALOG), 27000);
  assert.equal(subscriptionSavings(items, CATALOG), 3000);
});

test('unitPrice redondea el descuento', () => {
  const { product, variant } = findVariant(CATALOG, 'b', '3');
  assert.equal(unitPrice(product, variant, true), 7200);
  assert.equal(unitPrice({ ...product, price: 999, subscribable: true }, { id: 'x', stock: 1 }, true), 899);
});

test('subtotal ignora líneas de productos que ya no existen', () => {
  assert.equal(subtotal([{ id: 'x', vid: 'y', sub: false, qty: 3 }], CATALOG), 0);
});

test('installments y formatPrice', () => {
  assert.deepEqual(installments(10000, 3), { n: 3, each: 3334 });
  assert.equal(installments(0), null);
  assert.equal(installments(-5), null);
  assert.equal(formatPrice(1234567), '$ 1.234.567');
  assert.equal(formatPrice(0), '$ 0');
});

test('normalizePostal acepta CP de 4 dígitos y formato viejo', () => {
  assert.equal(normalizePostal('1636'), '1636');
  assert.equal(normalizePostal(' b1636abc '), '1636');
  for (const bad of ['', '123', '12345', 'abcd', null, undefined, '16 36', '0000a']) {
    assert.equal(normalizePostal(bad), null, `debería rechazar ${JSON.stringify(bad)}`);
  }
});

test('zoneFor: zonas y CP inexistentes', () => {
  assert.equal(zoneFor('1425').name, 'CABA y GBA');
  assert.equal(zoneFor('5000').name, 'Interior cercano');
  assert.equal(zoneFor('9400').name, 'Interior lejano');
  assert.equal(zoneFor('0123'), null); // empieza en 0: no existe
  assert.equal(zoneFor('xx'), null);
});

test('shippingFor: sin compra, gratis, con CP y sin CP', () => {
  assert.deepEqual(shippingFor(0, '1425', 60000), { cost: 0, free: false, zone: null, known: true });
  assert.equal(shippingFor(70000, null, 60000).free, true);
  assert.equal(shippingFor(70000, null, 60000).cost, 0);
  assert.equal(shippingFor(10000, '1425', 60000).cost, 3900);
  const unknown = shippingFor(10000, 'zzz', 60000);
  assert.equal(unknown.known, false);
  assert.equal(unknown.cost, null);
});

test('remainingForFreeShipping', () => {
  assert.equal(remainingForFreeShipping(0, 60000), 60000);
  assert.equal(remainingForFreeShipping(45000, 60000), 15000);
  assert.equal(remainingForFreeShipping(90000, 60000), 0);
});

test('priceFrom, hasPriceRange y stockStatus', () => {
  assert.equal(priceFrom(CATALOG[1]), 8000);
  assert.equal(hasPriceRange(CATALOG[1]), true);
  assert.equal(hasPriceRange(CATALOG[0]), false);
  assert.equal(stockStatus(CATALOG[0]), 'ok');
  assert.equal(stockStatus(CATALOG[2]), 'out');
  assert.equal(stockStatus({ ...CATALOG[0], variants: [{ id: 'x', label: 'x', stock: 2 }] }), 'low');
});

test('applyFilters: categoría, audiencia, búsqueda sin acentos y orden', () => {
  assert.equal(applyFilters(CATALOG, { filters: { category: 'camisas' } }).length, 1);
  assert.equal(applyFilters(CATALOG, { filters: { audience: 'perros' } }).length, 1);
  assert.equal(applyFilters(CATALOG, { filters: { audience: 'gatos' } }).length, 0);
  assert.equal(applyFilters(CATALOG, { filters: { category: 'all' } }).length, 3);
  assert.equal(applyFilters(CATALOG, { query: 'ALGODON' }).length, 1);
  assert.equal(applyFilters(CATALOG, { query: '  lino ' }).length, 1);
  assert.equal(applyFilters(CATALOG, { query: 'xyz' }).length, 0);
  assert.deepEqual(applyFilters(CATALOG, { sort: 'price-asc' }).map((p) => p.id), ['c', 'b', 'a']);
  assert.deepEqual(applyFilters(CATALOG, { sort: 'price-desc' }).map((p) => p.id), ['a', 'b', 'c']);
  assert.equal(applyFilters(CATALOG, { sort: 'name' })[0].name, 'Alimento perro');
});

test('parseStored descarta lo inválido y conserva lo válido', () => {
  const raw = JSON.stringify([
    { id: 'a', vid: 's', qty: 2 },
    { id: 'a', vid: 's', qty: 3 }, // duplicado
    { id: 'a', vid: 'm', qty: 1 }, // sin stock
    { id: 'b', vid: '15', qty: 99, sub: true }, // tope por stock
    { id: 'b', vid: '3', qty: 1, sub: true },
    { id: 'zzz', vid: 's', qty: 1 },
    { id: 'a', vid: 'l', qty: -4 },
    { id: 'a', vid: 'l', qty: 'x' },
    null, 5, 'texto', { id: 7, vid: 's', qty: 1 },
    { id: 'a', vid: 'l', qty: 1, sub: true }, // suscripción no permitida: queda sin sub
  ]);
  const out = parseStored(raw, CATALOG);
  assert.deepEqual(out, [
    { id: 'a', vid: 's', sub: false, qty: 2 },
    { id: 'b', vid: '15', sub: true, qty: 2 },
    { id: 'b', vid: '3', sub: true, qty: 1 },
    { id: 'a', vid: 'l', sub: false, qty: 1 },
  ]);
});

test('parseStored tolera JSON roto y formatos distintos', () => {
  assert.deepEqual(parseStored('no es json', CATALOG), []);
  assert.deepEqual(parseStored('{"a":1}', CATALOG), []);
  assert.deepEqual(parseStored(null, CATALOG), []);
  assert.deepEqual(parseStored('', CATALOG), []);
});
