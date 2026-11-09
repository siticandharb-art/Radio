import { passwordOk, crearToken, json } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });
  const ok = passwordOk((req.body || {}).password);
  if (!ok) { await new Promise((r) => setTimeout(r, 800)); return json(res, 401, { error: 'Contraseña incorrecta' }); }
  return json(res, 200, { token: crearToken() });
}
