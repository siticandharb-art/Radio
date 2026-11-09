import { put } from '@vercel/blob';
import { sesionOk, json } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });
  if (!sesionOk(req)) return json(res, 401, { error: 'Sesión vencida' });
  try {
    const m = String((req.body || {}).dataUrl || '').match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return json(res, 400, { error: 'La imagen no es válida' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 3.5 * 1024 * 1024) return json(res, 413, { error: 'La imagen es muy pesada' });
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const b = await put('fotos/nota.' + ext, buf, { access: 'public', contentType: 'image/' + m[1], addRandomSuffix: true, cacheControlMaxAge: 31536000 });
    return json(res, 200, { url: b.url });
  } catch (e) {
    return json(res, 500, { error: 'No se pudo subir la imagen' });
  }
}
