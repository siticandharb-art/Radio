// Utilidades compartidas del panel: sesión, guardado y limpieza de datos.
import crypto from 'node:crypto';
import { put, list, del } from '@vercel/blob';

const SECCIONES = ['Música', 'Entrevistas', 'Mundo', 'Actualidad', 'Comunidad'];
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
  if (!ultima) return { notas: [] };
  const r = await fetch(ultima.url, { cache: 'no-store' });
  const d = await r.json();
  return { notas: Array.isArray(d.notas) ? d.notas : [] };
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

export function limpiarNota(n) {
  n = n && typeof n === 'object' ? n : {};
  const foto = str(n.foto, 800);
  return {
    id: Number(n.id) || Date.now(),
    titulo: str(n.titulo, 180) || 'Sin título',
    bajada: str(n.bajada, 420),
    seccion: SECCIONES.includes(n.seccion) ? n.seccion : 'Actualidad',
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
