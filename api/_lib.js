// Utilidades compartidas del panel: sesión, guardado y limpieza de datos.
import crypto from 'node:crypto';
import { put, list, del } from '@vercel/blob';

export const SECCIONES_DEF = ['Música', 'Entrevistas', 'Mundo', 'Actualidad', 'Comunidad'];
export const PROGRAMAS_DEF = ['Miradas', 'Voces del Mundo', 'UnArtículo', 'Happy'];
export const FUENTES_DEF = [
  { nombre: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', seccion: 'Mundo' },
  { nombre: 'DW Español', url: 'https://rss.dw.com/xml/rss-sp-all', seccion: 'Mundo' },
  { nombre: 'France 24', url: 'https://www.france24.com/es/rss', seccion: 'Mundo' },
  { nombre: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada', seccion: 'Mundo' },
  { nombre: 'Clarín', url: 'https://www.clarin.com/rss/ciudades/', seccion: 'Buenos Aires' },
  { nombre: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/sociedad/?outputType=xml', seccion: 'Buenos Aires' },
  { nombre: 'Infobae', url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/sociedad/', seccion: 'Buenos Aires' },
  { nombre: 'El Deber', url: 'https://www.eldeber.com.bo/rss/feed', seccion: 'Bolivia' },
  { nombre: 'Opinión', url: 'https://www.opinion.com.bo/rss/', seccion: 'Bolivia' },
];
const secret = () => crypto.createHash('sha256').update('radio-admin|' + (process.env.ADMIN_PASSWORD || '')).digest();
const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

export function passwordOk(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof input !== 'string') return false;
  return crypto.timingSafeEqual(digest(input), digest(real));
}

export function crearToken() {
  const exp = String(Date.now() + 12 * 3600 * 1000);
  return exp + '.' + crypto.createHmac('sha256', secret()).update(exp).digest('base64url');
}

export function sesionOk(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const h = req.headers.authorization || '';
  const [exp, sig] = (h.startsWith('Bearer ') ? h.slice(7) : '').split('.');
  if (!exp || !sig) return false;
  const esperado = crypto.createHmac('sha256', secret()).update(exp).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b) && Number(exp) > Date.now();
}

// Cada guardado crea una versión nueva (contenido/<fecha>.json): así nunca se lee un archivo viejo de la caché.
async function versiones() {
  const { blobs } = await list({ prefix: 'contenido/' });
  return blobs.filter((x) => /^contenido\/\d+\.json$/.test(x.pathname)).sort((x, y) => (x.pathname < y.pathname ? 1 : -1));
}

export async function leer() {
  const [ultima] = await versiones();
  if (!ultima) return { notas: [], programas: PROGRAMAS_DEF, secciones: SECCIONES_DEF, fuentes: FUENTES_DEF };
  const r = await fetch(ultima.url, { cache: 'no-store' });
  const d = await r.json();
  return {
    notas: Array.isArray(d.notas) ? d.notas : [],
    programas: limpiarLista(d.programas, PROGRAMAS_DEF, 0),
    secciones: limpiarLista(d.secciones, SECCIONES_DEF, 1),
    fuentes: Array.isArray(d.fuentes) ? limpiarFuentes(d.fuentes) : FUENTES_DEF,
  };
}

export async function guardar(data) {
  await put('contenido/' + String(Date.now()).padStart(15, '0') + '.json', JSON.stringify(data), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60,
  });
  const viejas = (await versiones()).slice(5);
  if (viejas.length) await del(viejas.map((x) => x.url));
}

const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const urlHttp = (v) => { v = str(v, 800); return /^https?:\/\//i.test(v) ? v : ''; };

export function limpiarLista(v, def, min) {
  if (!Array.isArray(v)) return def;
  const out = [];
  for (const x of v) { const t = str(x, 40); if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t); }
  const lista = out.slice(0, 20);
  return lista.length < min ? def : lista;
}

// Medios de los que se toman titulares (RSS). Solo links https.
export function limpiarFuentes(v) {
  if (!Array.isArray(v)) return FUENTES_DEF;
  const out = [];
  for (const f of v) {
    const nombre = str(f && f.nombre, 40), url = str(f && f.url, 500);
    const seccion = str(f && f.seccion, 40);
    if (nombre && /^https:\/\/[^\s]+$/i.test(url) && !out.some((o) => o.url === url)) out.push({ nombre, url, seccion });
  }
  return out.slice(0, 15);
}

export function limpiarNota(n, secciones = SECCIONES_DEF, programas = PROGRAMAS_DEF) {
  n = n && typeof n === 'object' ? n : {};
  const foto = str(n.foto, 800);
  return {
    id: Number(n.id) || Date.now(),
    titulo: str(n.titulo, 180) || 'Sin título',
    bajada: str(n.bajada, 420),
    seccion: secciones.includes(n.seccion) ? n.seccion : secciones[0],
    programa: programas.includes(n.programa) ? n.programa : '',
    autor: str(n.autor, 80) || 'Redacción',
    fecha: str(n.fecha, 40),
    foto: /^img\/[\w.-]+$/.test(foto) ? foto : urlHttp(foto),
    video: urlHttp(n.video),
    texto: (Array.isArray(n.texto) ? n.texto : []).slice(0, 200).map((t) => str(t, 6000)).filter(Boolean),
    publicada: n.publicada !== false,
    creada: Number(n.creada) || Date.now(),
  };
}

export function json(res, code, obj) {
  res.status(code).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(obj));
}
