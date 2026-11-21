# Trama

Demo de una tienda de ropa. Es un proyecto ficticio de portfolio: no procesa pagos.

**Demo:** https://laura-m-stack.github.io/trama/

## Qué muestra

- Diseño editorial: papel cálido, bordó, tipografía Instrument Serif e Instrument Sans, líneas finas y esquinas rectas.
- Catálogo con fotos reales, filtro por categoría, búsqueda sin distinguir acentos y orden por precio o nombre.
- Variantes por talle con stock propio: los talles agotados se ven tachados y no se pueden elegir; las últimas unidades se avisan.
- Carrito en un panel lateral (`<dialog>`) con cantidades limitadas por stock, envío gratis desde $ 120.000 con barra de progreso y cuotas.
- Cálculo de envío por código postal (valores de ejemplo por zona), con el formato nuevo (1425) y el viejo (C1425ABC).
- Contenido propio de una marca de ropa: historia de la tienda, guía de talles con tablas accesibles y ficha de composición, cuidado y calce en cada prenda.
- Carrito guardado en `localStorage`; al leerlo se descarta lo que ya no existe, no tiene stock o está duplicado.
- Accesibilidad: foco visible, foco devuelto al cerrar los paneles, botones con nombre accesible, `prefers-reduced-motion`, áreas táctiles de 44 px.

## Tecnología

HTML, CSS y JavaScript sin dependencias ni build. La lógica de la tienda está separada del DOM en `site/js/cart.js` y se prueba con el runner nativo de Node.

## Uso

```powershell
npm test      # pruebas de la lógica de la tienda
npm start     # servidor local en http://localhost:4173
```

Requiere Node 20 o superior. El sitio publicado es el contenido de `site/`.

## Estructura

```
site/                sitio estático (index.html, css, js)
site/js/cart.js      lógica pura: variantes, stock, envío, filtros
site/js/products.js  catálogo de ejemplo
tests/               pruebas con node:test
scripts/serve.mjs    servidor local mínimo
```

## Créditos

Fotos: [Unsplash](https://unsplash.com). Precios y stock son datos de ejemplo.
