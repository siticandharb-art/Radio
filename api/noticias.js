// Noticias de otros medios: lee los RSS que cada medio publica y devuelve título, resumen corto y link a la nota original.
// La nota completa nunca se copia: siempre se enlaza al medio, que conserva sus derechos.
import crypto from 'node:crypto';
import { leer, json, sesionOk } from './_lib.js';

const UA = 'SitticHarbRadio/1.0 (+https://sitticandharbradio.lat)';
const MAX_POR_FUENTE = 12;
const REGIONAL = /infobae\.com\/(colombia|mexico|peru|venezuela|cuba|chile|espana|centroamerica)\//i;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', laquo: '«', raquo: '»', ndash: '–', mdash: '—', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' };
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => (ENT[n.toLowerCase()] ?? m));
}
const texto = (s) => decode(decode(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
function tag(xml, names) {
  for (const n of names) {
    const m = xml.match(new RegExp('<' + n + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + n + '>', 'i'));
    if (m && m[1].trim()) return m[1];
  }
  return '';
}
function attr(xml, re) { const m = xml.match(re); return m ? decode(m[1]) : ''; }
function recortar(s, n) { if (s.length <= n) return s; const c = s.slice(0, n); return c.slice(0, Math.max(c.lastIndexOf(' '), n - 20)).replace(/[\s,;:.-]+$/, '') + '…'; }
const http = (u) => (/^https?:\/\//i.test(u) ? u : '');

export function parse(xml, fuente) {
  const bloques = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  const out = [];
  for (const b of bloques.slice(0, MAX_POR_FUENTE)) {
    const titulo = texto(tag(b, ['title']));
    let link = texto(tag(b, ['link'])) || attr(b, /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) || attr(b, /<link[^>]*href=["']([^"']+)["']/i);
    if (!link) { const g = texto(tag(b, ['guid'])); if (/^https?:\/\//.test(g)) link = g; }
    if (!titulo || !http(link)) continue;
    if (REGIONAL.test(link)) continue; // ediciones de otros países (ej. Infobae Colombia/México)
    const cuerpo = tag(b, ['description', 'summary', 'content:encoded', 'content']);
    const fechaTxt = texto(tag(b, ['pubDate', 'published', 'updated', 'dc:date']));
    const fecha = Date.parse(fechaTxt) || 0;
    const foto = http(attr(b, /<media:content[^>]*url=["']([^"']+)["']/i) || attr(b, /<media:thumbnail[^>]*url=["']([^"']+)["']/i) ||
      attr(b, /<enclosure[^>]*type=["']image[^"']*["'][^>]*url=["']([^"']+)["']/i) || attr(b, /<enclosure[^>]*url=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/i) ||
      attr(decode(cuerpo), /<img[^>]*src=["']([^"']+)["']/i));
    const id = 'm' + crypto.createHash('sha1').update(link.split('?')[0]).digest('hex').slice(0, 10);
    const fotoGrande = foto.replace(/(ichef\.bbci\.co\.uk\/ace\/ws\/)\d+\//, '$1800/');
    out.push({ id, seccion: fuente.seccion || '', fuente: fuente.nombre, titulo: recortar(titulo, 200), link, resumen: recortar(texto(cuerpo), 220), foto: fotoGrande, fecha });
  }
  return out;
}

async function traer(f) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(f.url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, signal: ctrl.signal, redirect: 'follow' });
    if (!r.ok) return { items: [], ok: false };
    const xml = (await r.text()).slice(0, 3_000_000);
    return { items: parse(xml, f), ok: true };
  } catch { return { items: [], ok: false }; } finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  try {
    const { fuentes } = await leer();
    const resultados = await Promise.all(fuentes.map(traer));
    const vistos = new Set(); let items = [];
    resultados.forEach((r) => r.items.forEach((it) => { const k = it.link.split('?')[0]; if (!vistos.has(k)) { vistos.add(k); items.push(it); } }));
    // Orden por fecha, pero mezclando medios para que no copen uno solo
    items.sort((a, b) => b.fecha - a.fecha);
    const cuenta = {}; const mezcla = [];
    for (const it of items) { cuenta[it.fuente] = (cuenta[it.fuente] || 0) + 1; if (cuenta[it.fuente] <= (/Bolivia/.test(it.seccion) ? 4 : 6)) mezcla.push(it); }
    items = mezcla.slice(0, 45);
    const estado = fuentes.map((f, i) => ({ nombre: f.nombre, ok: resultados[i].ok, cantidad: resultados[i].items.length }));
    res.setHeader('Cache-Control', req.query.admin && sesionOk(req) ? 'no-store' : 'public, s-maxage=1800, stale-while-revalidate=3600');
    return json(res, 200, { actualizado: Date.now(), items, fuentes: estado });
  } catch (e) {
    return json(res, 500, { error: 'No se pudieron cargar las noticias' });
  }
}
