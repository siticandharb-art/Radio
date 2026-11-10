import { sesionOk, leer, guardar, limpiarNota, limpiarLista, limpiarFuentes, json } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { notas, programas, secciones, fuentes } = await leer();
      if (req.query.admin) {
        if (!sesionOk(req)) return json(res, 401, { error: 'Sesión vencida' });
        res.setHeader('Cache-Control', 'no-store');
        return json(res, 200, { notas, programas, secciones, fuentes });
      }
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10');
      return json(res, 200, { notas: notas.filter((n) => n.publicada !== false), programas, secciones });
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      if (!sesionOk(req)) return json(res, 401, { error: 'Sesión vencida' });
      const lista = (req.body || {}).notas;
      if (!Array.isArray(lista) || lista.length > 300) return json(res, 400, { error: 'Datos inválidos' });
      const actual = await leer();
      const body = req.body || {};
      const secciones = limpiarLista(body.secciones === undefined ? actual.secciones : body.secciones, actual.secciones, 1);
      const programas = limpiarLista(body.programas === undefined ? actual.programas : body.programas, actual.programas, 0);
      const fuentes = body.fuentes === undefined ? actual.fuentes : limpiarFuentes(body.fuentes);
      const notas = lista.map((n) => limpiarNota(n, secciones, programas));
      await guardar({ notas, programas, secciones, fuentes });
      return json(res, 200, { ok: true, notas, programas, secciones, fuentes });
    }
    return json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    return json(res, 500, { error: 'No se pudo completar la operación' });
  }
}
