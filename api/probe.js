// TEMPORAL: prueba de RSS candidatos (se borra después)
import { parse } from './noticias.js';
const URLS = [
 'https://www.france24.com/es/rss','https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada','https://cnnespanol.cnn.com/feed/',
 'https://www.clarin.com/rss/ciudades/','https://www.clarin.com/rss/sociedad/','https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/sociedad/?outputType=xml',
 'https://www.infobae.com/arc/outboundfeeds/rss/category/sociedad/','https://www.pagina12.com.ar/rss/secciones/sociedad/notas','https://www.perfil.com/feed',
 'https://www.infobae.com/arc/outboundfeeds/rss/category/sociedad/policiales/','https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/buenos-aires/?outputType=xml',
 'https://eldeber.com.bo/rss','https://www.eldeber.com.bo/rss/feed','https://www.opinion.com.bo/rss/','https://www.lostiempos.com/rss.xml','https://www.la-razon.com/feed/',
 'https://correodelsur.com/rss','https://www.unitel.bo/rss','https://erbol.com.bo/rss.xml','https://www.brujuladigital.net/rss.xml','https://www.opinion.com.bo/rss/section/2/','https://www.eldeber.com.bo/rss'
];
export default async function handler(req, res) {
  const out = await Promise.all(URLS.map(async (url) => {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 7000);
    try { const r = await fetch(url, { headers: { 'User-Agent': 'SitticHarbRadio/1.0 (+https://sitticandharbradio.lat)' }, signal: c.signal });
      const x = await r.text(); const it = parse(x, { nombre: 'x' });
      return { url, status: r.status, n: it.length, foto: it.filter((i) => i.foto).length, t: it.slice(0, 2).map((i) => i.titulo.slice(0, 80)) };
    } catch (e) { return { url, err: String(e).slice(0, 80) }; } finally { clearTimeout(t); }
  }));
  res.status(200).json(out);
}
