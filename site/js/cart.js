// Lógica pura de la tienda: sin DOM, para poder probarla con node --test.
export const MAX_QTY = 10;
export const LOW_STOCK = 3;
export const SUBSCRIPTION_DISCOUNT = 0.1;

export const lineKey = (l) => `${l.id}:${l.vid}${l.sub ? ':sub' : ''}`;

const clampInt = (n, max) => Math.min(max, Math.max(0, Math.trunc(Number(n)) || 0));

export function findVariant(catalog, id, vid) {
  const product = catalog.find((p) => p.id === id);
  const variant = product?.variants.find((v) => v.id === vid);
  return product && variant ? { product, variant } : null;
}

export const maxFor = (variant) => Math.min(MAX_QTY, Math.max(0, variant.stock));

export function unitPrice(product, variant, sub = false) {
  const base = variant.price ?? product.price;
  return sub && product.subscribable ? Math.round(base * (1 - SUBSCRIPTION_DISCOUNT)) : base;
}

export function addLine(items, catalog, { id, vid, sub = false }, qty = 1) {
  const found = findVariant(catalog, id, vid);
  if (!found) return items;
  const cap = maxFor(found.variant);
  const add = clampInt(qty, cap);
  if (add === 0) return items;
  const wantsSub = Boolean(sub) && Boolean(found.product.subscribable);
  const line = { id, vid, sub: wantsSub };
  const key = lineKey(line);
  const cur = items.find((i) => lineKey(i) === key);
  if (!cur) return [...items, { ...line, qty: add }];
  return items.map((i) => (lineKey(i) === key ? { ...i, qty: Math.min(cap, i.qty + add) } : i));
}

export function setLineQty(items, catalog, key, qty) {
  const cur = items.find((i) => lineKey(i) === key);
  if (!cur) return items;
  const found = findVariant(catalog, cur.id, cur.vid);
  const q = found ? clampInt(qty, maxFor(found.variant)) : 0;
  return q === 0 ? removeLine(items, key) : items.map((i) => (lineKey(i) === key ? { ...i, qty: q } : i));
}

export const removeLine = (items, key) => items.filter((i) => lineKey(i) !== key);

export const count = (items) => items.reduce((n, i) => n + i.qty, 0);

export function lineTotal(line, catalog) {
  const found = findVariant(catalog, line.id, line.vid);
  return found ? unitPrice(found.product, found.variant, line.sub) * line.qty : 0;
}

export const subtotal = (items, catalog) => items.reduce((sum, i) => sum + lineTotal(i, catalog), 0);

// Lo que se ahorra por elegir envío mensual, para mostrarlo en el carrito.
export function subscriptionSavings(items, catalog) {
  return items.reduce((sum, i) => {
    const f = findVariant(catalog, i.id, i.vid);
    if (!f || !i.sub) return sum;
    return sum + (unitPrice(f.product, f.variant, false) - unitPrice(f.product, f.variant, true)) * i.qty;
  }, 0);
}

export function installments(total, n = 3) {
  if (!(total > 0) || n < 1) return null;
  return { n, each: Math.ceil(total / n) };
}

export const formatPrice = (n) => '$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ── Envío por código postal (valores de ejemplo) ─────────────────────────
const ZONES = {
  1: { name: 'CABA y GBA', cost: 3900, days: '1 a 3 días hábiles' },
  2: { name: 'Interior cercano', cost: 5900, days: '3 a 5 días hábiles' },
  5: { name: 'Interior cercano', cost: 5900, days: '3 a 5 días hábiles' },
  6: { name: 'Interior cercano', cost: 5900, days: '3 a 5 días hábiles' },
  7: { name: 'Interior cercano', cost: 5900, days: '3 a 5 días hábiles' },
  3: { name: 'Interior lejano', cost: 8200, days: '5 a 8 días hábiles' },
  4: { name: 'Interior lejano', cost: 8200, days: '5 a 8 días hábiles' },
  8: { name: 'Interior lejano', cost: 8200, days: '5 a 8 días hábiles' },
  9: { name: 'Interior lejano', cost: 8200, days: '5 a 8 días hábiles' },
};

// Acepta 1636 y también el formato viejo B1636ABC. Devuelve null si no es válido.
export function normalizePostal(raw) {
  const m = /^[A-Za-z]?(\d{4})(?:[A-Za-z]{3})?$/.exec(String(raw ?? '').trim());
  return m ? m[1] : null;
}

export function zoneFor(raw) {
  const cp = normalizePostal(raw);
  if (!cp) return null;
  const z = ZONES[cp[0]];
  return z ? { cp, ...z } : null;
}

export function shippingFor(sub, postal, freeFrom) {
  if (!(sub > 0)) return { cost: 0, free: false, zone: null, known: true };
  const zone = zoneFor(postal);
  if (sub >= freeFrom) return { cost: 0, free: true, zone, known: true };
  if (!zone) return { cost: null, free: false, zone: null, known: false };
  return { cost: zone.cost, free: false, zone, known: true };
}

export const remainingForFreeShipping = (sub, freeFrom) =>
  sub <= 0 ? freeFrom : Math.max(0, freeFrom - sub);

// ── Catálogo ─────────────────────────────────────────────────────────────
export const priceFrom = (p) => Math.min(...p.variants.map((v) => v.price ?? p.price));
export const hasPriceRange = (p) => new Set(p.variants.map((v) => v.price ?? p.price)).size > 1;

export function stockStatus(p) {
  const total = p.variants.reduce((n, v) => n + Math.max(0, v.stock), 0);
  if (total === 0) return 'out';
  return total <= LOW_STOCK * 2 ? 'low' : 'ok';
}

export const normalizeText = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function applyFilters(products, { filters = {}, query = '', sort = 'relevance' } = {}) {
  const q = normalizeText(query);
  let out = products.filter((p) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value || value === 'all') continue;
      const own = p[key];
      if (Array.isArray(own) ? !own.includes(value) : own !== value) return false;
    }
    if (!q) return true;
    return normalizeText(`${p.name} ${p.desc} ${p.category}`).includes(q);
  });
  if (sort === 'price-asc') out = [...out].sort((a, b) => priceFrom(a) - priceFrom(b));
  else if (sort === 'price-desc') out = [...out].sort((a, b) => priceFrom(b) - priceFrom(a));
  else if (sort === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return out;
}

// Lee lo guardado sin confiar en él: descarta productos o variantes que ya no existen,
// sin stock, cantidades inválidas, suscripciones no permitidas y duplicados.
export function parseStored(raw, catalog) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  const out = [];
  for (const row of data) {
    if (!row || typeof row.id !== 'string' || typeof row.vid !== 'string') continue;
    const found = findVariant(catalog, row.id, row.vid);
    if (!found) continue;
    const qty = clampInt(row.qty, maxFor(found.variant));
    if (qty === 0) continue;
    const line = { id: row.id, vid: row.vid, sub: Boolean(row.sub) && Boolean(found.product.subscribable) };
    const key = lineKey(line);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...line, qty });
  }
  return out;
}
