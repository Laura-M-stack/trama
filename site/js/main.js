import { SHOP, FILTER_GROUPS, PRODUCTS } from './products.js';
import {
  addLine, setLineQty, removeLine, lineKey, count, subtotal, subscriptionSavings, installments, formatPrice,
  shippingFor, remainingForFreeShipping, zoneFor, normalizePostal, priceFrom, hasPriceRange, stockStatus,
  applyFilters, parseStored, findVariant, maxFor, unitPrice, LOW_STOCK,
} from './cart.js';

const CART_KEY = `${SHOP.key}-cart-v1`;
const POSTAL_KEY = `${SHOP.key}-postal-v1`;
const $ = (id) => document.getElementById(id);

const state = {
  items: [],
  postal: '',
  query: '',
  sort: 'relevance',
  filters: Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, 'all'])),
};
const openers = new Map();

const store = {
  read(k) { try { return localStorage.getItem(k); } catch { return null; } },
  write(k, v) { try { localStorage.setItem(k, v); } catch { /* modo privado o sin espacio: sigue en memoria */ } },
};

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach((c) => c != null && node.append(c));
  return node;
}

// ── Diálogos ────────────────────────────────────────────────────────────
function openDialog(dlg, opener) {
  openers.set(dlg, opener ?? document.activeElement);
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}
function closeDialog(dlg) {
  if (dlg.open) dlg.close();
  openers.get(dlg)?.focus?.();
}
function wireDialog(dlg, closeBtn) {
  closeBtn.addEventListener('click', () => closeDialog(dlg));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dlg); });
}

// ── Catálogo ────────────────────────────────────────────────────────────
function renderFilters() {
  $('filters').replaceChildren(...FILTER_GROUPS.map((g) =>
    el('div', { class: 'filter-group', role: 'group', 'aria-label': g.label },
      el('span', { class: 'filter-label', text: g.label }),
      ...g.options.map((o) => el('button', {
        class: 'chip', type: 'button', 'data-group': g.key, 'data-value': o.id,
        'aria-pressed': String(state.filters[g.key] === o.id), text: o.label,
      })),
    )));
}

function cardBadge(p) {
  const s = stockStatus(p);
  if (s === 'out') return el('span', { class: 'badge badge-out', text: 'Sin stock' });
  if (s === 'low') return el('span', { class: 'badge badge-low', text: 'Últimas unidades' });
  if (p.badge) return el('span', { class: 'badge', text: p.badge });
  return null;
}

function renderGrid() {
  const list = applyFilters(PRODUCTS, { filters: state.filters, query: state.query, sort: state.sort });
  $('empty').hidden = list.length > 0;
  $('grid').replaceChildren(...list.map((p) => {
    const from = priceFrom(p);
    const inst = SHOP.installments ? installments(from, SHOP.installments) : null;
    const out = stockStatus(p) === 'out';
    const quick = p.variants.length === 1 && !p.subscribable && !out;
    const price = hasPriceRange(p) ? `Desde ${formatPrice(from)}` : formatPrice(from);
    return el('li', { class: 'card' },
      el('button', { class: 'card-open', type: 'button', 'data-open': p.id, 'aria-label': `${p.name}, ${price}. Ver detalle` },
        el('span', { class: 'card-img' },
          el('img', { src: p.img, alt: p.alt, width: '600', height: '750', loading: 'lazy', decoding: 'async' }),
          cardBadge(p)),
        el('span', { class: 'card-name', text: p.name }),
        el('span', { class: 'card-sub', text: p.tagline ?? '' }),
      ),
      el('div', { class: 'card-foot' },
        el('div', { class: 'card-price' },
          el('span', { class: 'price', text: price }),
          inst ? el('span', { class: 'inst', text: `${inst.n} cuotas sin interés de ${formatPrice(inst.each)}` }) : null),
        el('button', {
          class: 'btn btn-quiet', type: 'button', disabled: out,
          ...(quick ? { 'data-quick': p.id } : { 'data-open': p.id }),
          text: out ? 'Sin stock' : quick ? 'Agregar' : 'Elegir opciones',
          'aria-label': out ? `${p.name}: sin stock` : `${quick ? 'Agregar' : 'Elegir opciones de'} ${p.name}`,
        }),
      ),
    );
  }));
  const n = list.length;
  $('results-live').textContent = n === 0 ? 'No hay productos con esos filtros' : `${n} ${n === 1 ? 'producto' : 'productos'}`;
}

// ── Detalle de producto ─────────────────────────────────────────────────
let current = null; // { product, vid, sub }
const pdlg = $('pdialog');

function firstAvailable(p) {
  return p.variants.find((v) => v.stock > 0)?.id ?? p.variants[0].id;
}

function openProduct(id, opener) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  current = { product, vid: firstAvailable(product), sub: false };
  $('p-img').src = product.imgLarge ?? product.img;
  $('p-img').alt = product.alt;
  $('p-title').textContent = product.name;
  $('p-desc').textContent = product.desc;
  const details = Array.isArray(product.details) ? product.details : [];
  $('p-details').hidden = details.length === 0;
  $('p-details').replaceChildren(...details.map(([k, v]) => el('div', {}, el('dt', { text: k }), el('dd', { text: v }))));
  $('p-live').textContent = '';
  $('p-sub-wrap').hidden = !product.subscribable;
  $('p-sub').checked = false;
  renderVariants();
  renderProductState();
  openDialog(pdlg, opener);
  $('p-close').focus();
}

function renderVariants() {
  const { product, vid } = current;
  const box = $('p-variants');
  box.hidden = product.variants.length === 1;
  $('p-variants-legend').textContent = product.variantLabel ?? 'Opción';
  $('p-options').replaceChildren(...product.variants.map((v) => {
    const none = v.stock <= 0;
    const input = el('input', { type: 'radio', name: 'variant', value: v.id, checked: v.id === vid, disabled: none });
    return el('label', { class: `opt${none ? ' opt-off' : ''}` }, input,
      el('span', { class: 'opt-label', text: v.label }),
      none ? el('span', { class: 'opt-note', text: 'Sin stock' }) : null);
  }));
}

function renderProductState() {
  const { product, vid, sub } = current;
  const variant = product.variants.find((v) => v.id === vid);
  const price = unitPrice(product, variant, sub);
  $('p-price').textContent = formatPrice(price);
  const inst = SHOP.installments ? installments(price, SHOP.installments) : null;
  $('p-inst').textContent = inst ? `${inst.n} cuotas sin interés de ${formatPrice(inst.each)}` : '';
  const out = variant.stock <= 0;
  const inCart = state.items.find((i) => i.id === product.id && i.vid === vid && i.sub === sub)?.qty ?? 0;
  const atMax = !out && inCart >= maxFor(variant);
  let note = '';
  if (out) note = 'Esta opción no tiene stock por ahora.';
  else if (atMax) note = 'Ya tenés en el carrito todo lo que hay disponible.';
  else if (variant.stock <= LOW_STOCK) note = `Quedan ${variant.stock} ${variant.stock === 1 ? 'unidad' : 'unidades'}.`;
  $('p-note').textContent = note;
  const add = $('p-add');
  add.disabled = out || atMax;
  add.textContent = out ? 'Sin stock' : 'Agregar al carrito';
}

$('p-options').addEventListener('change', (e) => {
  if (e.target.name !== 'variant') return;
  current.vid = e.target.value;
  renderProductState();
});
$('p-sub').addEventListener('change', (e) => { current.sub = e.target.checked; renderProductState(); });
$('p-add').addEventListener('click', () => {
  const { product, vid, sub } = current;
  commit(addLine(state.items, PRODUCTS, { id: product.id, vid, sub }, 1));
  closeDialog(pdlg);
  openCart($('open-cart'));
});
wireDialog(pdlg, $('p-close'));

// ── Carrito ─────────────────────────────────────────────────────────────
const cdlg = $('cart');

function renderCart() {
  const n = count(state.items);
  const badge = $('cart-count');
  badge.textContent = String(n);
  badge.setAttribute('aria-label', n === 1 ? '1 producto' : `${n} productos`);
  $('cart-empty').hidden = n > 0;
  $('cart-body').hidden = n === 0;

  const sub = subtotal(state.items, PRODUCTS);
  const ship = shippingFor(sub, state.postal, SHOP.freeFrom);
  const left = remainingForFreeShipping(sub, SHOP.freeFrom);
  $('free-ship').textContent = sub <= 0 ? '' : left === 0
    ? 'Tu envío es gratis.'
    : `Te faltan ${formatPrice(left)} para el envío gratis.`;
  $('free-bar').style.setProperty('--p', `${sub <= 0 ? 0 : Math.min(100, Math.round((sub / SHOP.freeFrom) * 100))}%`);

  $('cart-list').replaceChildren(...state.items.map((i) => {
    const { product, variant } = findVariant(PRODUCTS, i.id, i.vid);
    const key = lineKey(i);
    const name = `${product.name}${product.variants.length > 1 ? ` (${variant.label})` : ''}`;
    const minus = el('button', { type: 'button', 'data-dec': key, 'aria-label': i.qty <= 1 ? `Quitar ${name} del carrito` : `Quitar una unidad de ${name}`, text: '−' });
    const plus = el('button', { type: 'button', 'data-inc': key, 'aria-label': `Agregar una unidad de ${name}`, disabled: i.qty >= maxFor(variant), text: '+' });
    return el('li', { class: 'line' },
      el('img', { src: product.img, alt: '', width: '72', height: '90', loading: 'lazy' }),
      el('div', { class: 'line-main' },
        el('div', { class: 'line-name', text: product.name }),
        el('div', { class: 'line-meta', text: [product.variants.length > 1 ? `${product.variantLabel ?? 'Opción'}: ${variant.label}` : null, i.sub ? 'Envío mensual' : null].filter(Boolean).join(' · ') }),
        el('div', { class: 'line-price', text: formatPrice(unitPrice(product, variant, i.sub)) }),
        el('div', { class: 'line-ctrl' },
          el('div', { class: 'qty' }, minus, el('output', { 'aria-label': `Cantidad de ${name}`, text: String(i.qty) }), plus),
          el('button', { class: 'link-btn', type: 'button', 'data-del': key, 'aria-label': `Eliminar ${name}`, text: 'Eliminar' })),
      ));
  }));

  $('t-sub').textContent = formatPrice(sub);
  const save = subscriptionSavings(state.items, PRODUCTS);
  $('t-save-row').hidden = save <= 0;
  $('t-save').textContent = `− ${formatPrice(save)}`;
  $('t-ship').textContent = ship.free ? 'Gratis' : ship.known ? formatPrice(ship.cost) : 'A calcular';
  const total = sub + (ship.cost ?? 0);
  $('t-total').textContent = formatPrice(total);
  $('t-total-note').textContent = ship.known ? '' : 'Sin envío: ingresá tu código postal.';
  const inst = SHOP.installments ? installments(total, SHOP.installments) : null;
  $('t-inst').textContent = inst ? `o ${inst.n} cuotas sin interés de ${formatPrice(inst.each)}` : '';
  $('checkout').disabled = n === 0;
  renderPostalMsg();
}

function renderPostalMsg() {
  const msg = $('postal-msg');
  msg.classList.remove('is-error');
  const z = zoneFor(state.postal);
  if (!state.postal) { msg.textContent = ''; return; }
  msg.textContent = z ? `${z.name}: llega en ${z.days}.` : '';
}

function commit(next) {
  state.items = next;
  store.write(CART_KEY, JSON.stringify(state.items));
  renderCart();
}

function openCart(opener) {
  $('demo-msg').textContent = '';
  openDialog(cdlg, opener);
  $('close-cart').focus();
}

$('open-cart').addEventListener('click', (e) => openCart(e.currentTarget));
wireDialog(cdlg, $('close-cart'));

$('cart-list').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const cur = (key) => state.items.find((i) => lineKey(i) === key)?.qty ?? 0;
  const { inc, dec, del } = t.dataset;
  if (inc) commit(setLineQty(state.items, PRODUCTS, inc, cur(inc) + 1));
  else if (dec) commit(setLineQty(state.items, PRODUCTS, dec, cur(dec) - 1));
  else if (del) commit(removeLine(state.items, del));
  else return;
  // El botón pulsado pudo desaparecer al volver a dibujar: devolver el foco a un lugar válido.
  const key = inc || dec;
  const again = key && $('cart-list').querySelector(`[data-${inc ? 'inc' : 'dec'}="${CSS.escape(key)}"]:not(:disabled)`);
  (again || $('cart-list').querySelector('button') || $('close-cart')).focus();
});

$('postal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = $('postal').value;
  const cp = normalizePostal(raw);
  const msg = $('postal-msg');
  if (!cp || !zoneFor(cp)) {
    msg.classList.add('is-error');
    msg.textContent = 'Ingresá un código postal de 4 números, por ejemplo 1425.';
    $('postal').setAttribute('aria-invalid', 'true');
    return;
  }
  $('postal').removeAttribute('aria-invalid');
  state.postal = cp;
  store.write(POSTAL_KEY, cp);
  renderCart();
});

$('checkout').addEventListener('click', () => {
  $('demo-msg').textContent = 'Esto es una demostración: no se procesa ningún pago.';
});

// ── Filtros, búsqueda y orden ───────────────────────────────────────────
$('filters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-group]');
  if (!b) return;
  state.filters[b.dataset.group] = b.dataset.value;
  renderFilters();
  renderGrid();
  $('filters').querySelector(`[data-group="${b.dataset.group}"][data-value="${CSS.escape(b.dataset.value)}"]`)?.focus();
});
$('search').addEventListener('input', (e) => { state.query = e.target.value; renderGrid(); });
$('sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });
$('clear-filters').addEventListener('click', () => {
  state.query = '';
  state.sort = 'relevance';
  Object.keys(state.filters).forEach((k) => { state.filters[k] = 'all'; });
  $('search').value = '';
  $('sort').value = 'relevance';
  renderFilters();
  renderGrid();
  $('search').focus();
});

$('grid').addEventListener('click', (e) => {
  const q = e.target.closest('[data-quick]');
  if (q) {
    const p = PRODUCTS.find((x) => x.id === q.dataset.quick);
    commit(addLine(state.items, PRODUCTS, { id: p.id, vid: p.variants[0].id }, 1));
    const prev = q.textContent;
    q.textContent = 'Agregado';
    setTimeout(() => { q.textContent = prev; }, 1200);
    return;
  }
  const o = e.target.closest('[data-open]');
  if (o && !o.disabled) openProduct(o.dataset.open, o);
});

// Si otra pestaña cambia el carrito, sincronizar.
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) { state.items = parseStored(e.newValue, PRODUCTS); renderCart(); }
});

// ── Inicio ──────────────────────────────────────────────────────────────
state.items = parseStored(store.read(CART_KEY), PRODUCTS);
const savedPostal = normalizePostal(store.read(POSTAL_KEY));
if (savedPostal && zoneFor(savedPostal)) { state.postal = savedPostal; $('postal').value = savedPostal; }
renderFilters();
renderGrid();
renderCart();
