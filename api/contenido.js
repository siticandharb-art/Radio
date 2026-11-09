import { sesionOk, leer, guardar, limpiarNota, json } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { notas } = await leer();
      if (req.query.admin) {
        if (!sesionOk(req)) return json(res, 401, { error: 'Sesión vencida' });
        res.setHeader('Cache-Control', 'no-store');
        return json(res, 200, { notas });
      }
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10');
      return json(res, 200, { notas: notas.filter((n) => n.publicada !== false) });
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      if (!sesionOk(req)) return json(res, 401, { error: 'Sesión vencida' });
      const lista = (req.body || {}).notas;
      if (!Array.isArray(lista) || lista.length > 300) return json(res, 400, { error: 'Datos inválidos' });
      const notas = lista.map(limpiarNota);
      await guardar({ notas });
      return json(res, 200, { ok: true, notas });
    }
    return json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    return json(res, 500, { error: 'No se pudo completar la operación' });
  }
}
