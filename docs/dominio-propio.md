# Dominio propio para la página pública

> Estado: **propuesta, sin implementar**. Escrito el 2026-09-24 en la rama
> `feature/site-builder`. Nada de esto existe todavía en el código.

Hoy la página de un negocio vive en `novu.uy/public/<slug>`. La propuesta es que
pueda vivir en `mibarberia.com`.

## Por qué

Es lo único que cambia la respuesta a «¿esto reemplaza a mi web?» de «casi» a
«sí». Un negocio que compara con Wix no está contando bloques: está mirando la
barra de direcciones. Y a diferencia de casi todo lo demás del constructor, **no
toca el modelo del documento ni el saneador** — es enrutado e infraestructura.

## Lo que hace falta

### 1. Esquema

```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS custom_domain        VARCHAR(253),
  ADD COLUMN IF NOT EXISTS custom_domain_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS custom_domain_added_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_custom_domain
  ON businesses (lower(custom_domain)) WHERE custom_domain IS NOT NULL;
```

El índice único es la parte importante: **dos negocios no pueden reclamar el
mismo dominio**. Sin eso, quien lo agregue segundo secuestra el tráfico del
primero.

`custom_domain_status`: `pending` → `verified` → `active`, más `error`.

Va en `runMigrations()` **y** en un archivo numerado, como el resto.

### 2. Resolver el negocio por `Host`, no por ruta

Hoy `app/public/[slug]/page.tsx` saca el slug de la URL. Con dominio propio la
petición llega a `mibarberia.com/` sin slug en ningún lado.

Un `middleware.ts` en la raíz del frontend lee la cabecera `Host`; si no es
`novu.uy` ni un dominio de Vercel, reescribe a `/public/<slug>` buscando el slug
por dominio. Esa búsqueda pega a la API en **cada petición**, así que necesita
caché — probablemente un endpoint público `/api/public/domains/:host` con
`revalidate` alto, no `no-store`.

⚠️ El middleware corre en el Edge Runtime: no hay `pg` ahí, solo `fetch`.

### 3. Verificación de titularidad

Nadie puede apuntar un dominio que no es suyo, pero sí puede **reclamarlo** en el
panel y quedarse con él. Por eso hace falta verificar antes de activar:

1. El dueño agrega `mibarberia.com` en el panel.
2. Se le muestra un registro TXT con un token, o un CNAME a `cname.vercel-dns.com`.
3. Un endpoint autenticado consulta el DNS y, si coincide, pasa a `verified`.

Node trae `dns/promises` (`resolveTxt`, `resolveCname`), así que no hace falta
dependencia nueva.

### 4. Certificado y alta en Vercel

Vercel emite el certificado solo para dominios **agregados al proyecto**. Hay dos
caminos:

- **API de dominios de Vercel** desde el backend (`POST /v10/projects/:id/domains`),
  con un token de proyecto. Automático, pero suma un secreto más y una dependencia
  de su API.
- **Manual al principio**: el dueño agrega el dominio, el equipo lo da de alta.
  Sirve para validar la demanda antes de automatizar.

Para los primeros negocios, el camino manual alcanza.

### 5. Lo que hay que revisar después

- **CSP**: `frame-ancestors` y `form-action` son `'self'`. Con la página servida
  desde otro dominio hay que confirmar que `'self'` sigue resolviendo a lo
  esperado — y `connect-src` ya apunta a la API por `NEXT_PUBLIC_API_URL`, que no
  cambia.
- **Canónicas y sitemap**: `alternates.canonical` en `public/[slug]/page.tsx`
  apunta a `/public/<slug>`. Con dominio propio la canónica tiene que ser el
  dominio, o Google indexa las dos y se reparten la señal.
- **Cookies y OAuth**: la página pública no usa sesión, así que no debería
  afectar. Confirmar antes de dar por cerrado.
- **Plan**: probablemente Negocio, pero es decisión de precios.

## Esfuerzo

Medio. El grueso no es código sino operación: DNS, certificados y el soporte de
la gente que lo configura mal. El código en sí —migración, middleware,
verificación, pantalla en el panel— es acotado y no toca el constructor.

## Lo que NO hay que hacer

Activar el dominio sin verificar la titularidad. Es la diferencia entre una
función y un secuestro de tráfico.
