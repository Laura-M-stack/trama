import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Las fotos viven en el repo (site/img/fotos): no dependen de un servicio externo para verse.
const SITE = new URL('../site/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function archivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivos(join(dir, e.name)) : /\.(html|js|css)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}
const fuentes = archivos(SITE).map((f) => [f, readFileSync(f, 'utf8')]);

test('ninguna imagen se carga desde un CDN externo', () => {
  for (const [f, s] of fuentes) assert.ok(!/images\.unsplash\.com|upload\.wikimedia\.org/.test(s), f);
});

test('cada foto referenciada existe en el repo y no pesa de más', () => {
  const rutas = new Set(fuentes.flatMap(([, s]) => s.match(/img\/fotos\/[\w.-]+\.webp/g) ?? []));
  assert.ok(rutas.size > 0);
  for (const r of rutas) {
    const archivo = join(SITE, r);
    assert.ok(existsSync(archivo), `falta ${r}`);
    assert.ok(statSync(archivo).size < 250_000, `${r} pesa demasiado`);
  }
});
