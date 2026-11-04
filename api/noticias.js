// Función serverless de Vercel: lee los feeds RSS y devuelve JSON (evita problemas de CORS)
const dec = s => (s||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]+>/g,"")
  .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
const tag = (x,t) => { const m = x.match(new RegExp("<"+t+"[^>]*>([\\s\\S]*?)</"+t+">","i")); return m ? m[1] : ""; };

module.exports = async (req, res) => {
  const feeds = (req.query.f ? [].concat(req.query.f) : []).slice(0, 10);
  const items = [];
  await Promise.all(feeds.map(async f => {
    try {
      const u = new URL(f); if (!/^https?:$/.test(u.protocol)) return;
      const r = await fetch(u, { headers: { "user-agent": "SitticRadioBot/1.0" }, signal: AbortSignal.timeout(8000) });
      const xml = await r.text();
      const fuente = dec(tag(xml.replace(/<item[\s\S]*/i,""), "title")) || u.hostname;
      (xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || []).slice(0, 8).forEach(it => {
        const link = tag(it,"link").trim() || (it.match(/<link[^>]*href="([^"]+)"/i)||[])[1] || "";
        const img = (it.match(/<(?:media:content|enclosure)[^>]*url="([^"]+)"/i)||[])[1] || (it.match(/<img[^>]+src="([^"]+)"/i)||[])[1] || "";
        const fecha = new Date(dec(tag(it,"pubDate")||tag(it,"published")||tag(it,"updated")));
        items.push({ titulo: dec(tag(it,"title")), link: dec(link), resumen: dec(tag(it,"description")||tag(it,"summary")).slice(0,160), img, fuente, fecha: isNaN(fecha) ? null : fecha.toISOString() });
      });
    } catch (e) {}
  }));
  items.sort((a,b) => (b.fecha||"").localeCompare(a.fecha||""));
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
  res.status(200).json(items.slice(0, 30));
};
