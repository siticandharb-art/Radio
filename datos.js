/* ==================================================================
   DATOS DE LA WEB · Sittic&Harb Radio
   ------------------------------------------------------------------
   Todo lo que se ve en la web sale de este archivo. Para cambiar
   textos, agregar notas o programas, se edita SOLO este archivo.

   AGREGAR UNA NOTA:
   1. Copiá un bloque { ... } de NOTAS (desde la llave { hasta la },).
   2. Pegalo ARRIBA DE TODO de la lista. La primera nota es la
      principal de la portada.
   3. Poné un id nuevo (un número que no se repita).
   4. Completá los campos. La foto va en la carpeta img/.
   5. Borrá "ejemplo: true" para que no diga "texto de ejemplo".
   6. Si la nota tiene video, agregá  video: 'link de la publicación'
   ================================================================== */

var SITIO = {
  instagram: 'https://www.instagram.com/sitticharbradio_radio_online',
  youtube:   'https://www.youtube.com/@SitticRadio',
  facebook:  '',   // pegá acá el link de la página de Facebook
  mail:      '',   // ej: 'contacto@sitticharbradio.com'
  whatsapp:  '',   // solo números con código de país, ej: '5491112345678'
  formulario:'',   // link de Formspree (https://formspree.io/f/xxxx). Vacío = se envía por WhatsApp, mail o Instagram
  radio:     ''    // link https de la transmisión en vivo (vacío = no se muestra el reproductor)
};

var SECCIONES = ['Música', 'Entrevistas', 'Mundo', 'Actualidad', 'Comunidad'];

var NOTAS = [
  {
    id: 1, seccion: 'Entrevistas', foto: 'img/a1.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Una charla sobre los discos que nunca pasan de moda',
    bajada: 'Invitados de distintos países cuentan qué canciones los acompañan desde siempre y por qué volvieron a escucharlas.',
    texto: [
      'Texto de ejemplo. Acá va el desarrollo de la nota, con los datos principales y las voces de los protagonistas.',
      'Segundo párrafo de ejemplo. Cuando tengamos las notas reales de la radio, se cargan acá con sus fotos y su firma.'
    ]
  },
  {
    id: 2, seccion: 'Música', foto: 'img/a2.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Cinco boleros que merecen otra vuelta',
    bajada: 'Una selección para escuchar sin apuro, con la historia de cada tema.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 3, seccion: 'Actualidad', foto: 'img/a3.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Qué cambia en la programación esta semana',
    bajada: 'Horarios, invitados y novedades de los programas de la radio.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 4, seccion: 'Mundo', foto: 'img/a4.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Las noticias de la semana en tres minutos',
    bajada: 'Lo que pasó en el mundo, contado de forma simple y directa.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 5, seccion: 'Comunidad', foto: 'img/a5.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Saludos y dedicatorias de los oyentes',
    bajada: 'Los mensajes que llegaron desde distintos países.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 6, seccion: 'Música', foto: 'img/a2.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'La historia detrás de una canción',
    bajada: 'Cómo nació un clásico que todavía se canta en cualquier reunión.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 7, seccion: 'Entrevistas', foto: 'img/a1.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Un invitado nuevo llega al micrófono',
    bajada: 'Una conversación pensada para escuchar de punta a punta.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 8, seccion: 'Música', foto: 'img/a5.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Las dedicatorias más pedidas',
    bajada: 'Los temas que más se repiten cuando el público elige.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 9, seccion: 'Mundo', foto: 'img/a4.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Título de una noticia internacional',
    bajada: 'Resumen breve de la noticia y por qué le importa a la audiencia.',
    texto: ['Texto de ejemplo.']
  },
  {
    id: 10, seccion: 'Entrevistas', foto: 'img/a10.jpg', autor: 'Redacción', fecha: '', ejemplo: true,
    titulo: 'Voces de afuera: argentinos que viven lejos',
    bajada: 'Historias de quienes llevan la música y las costumbres a otro país.',
    texto: ['Texto de ejemplo.']
  }
];

/* PROGRAMAS: son series de videos, sin horario fijo. */
var PROGRAMAS = [
  { nombre: 'Miradas',         foto: 'img/miradas.jpg', descripcion: '' },
  { nombre: 'Voces del Mundo', foto: 'img/a4.jpg',      descripcion: '' },
  { nombre: 'UnArtículo',      foto: '',                descripcion: '' },
  { nombre: 'Happy',           foto: '',                descripcion: '' }
];

/* ==================================================================
   VIDEOS: las publicaciones de Instagram y Facebook.
   Para cargar una: copiá el link de la publicación (los tres puntitos
   → "Copiar enlace"), pegalo en link, poné la portada en img/ y
   completá título y programa (tiene que ser igual al nombre de arriba).
   red: 'Instagram', 'Facebook' o 'YouTube'.
   Las más nuevas van arriba.
   ================================================================== */
var VIDEOS = [
  { titulo: 'Miradas: la ciudad vista desde adentro', programa: 'Miradas',         red: 'Instagram', link: '', foto: 'img/a10.jpg', fecha: '', ejemplo: true },
  { titulo: 'Un recorrido por el mundo en un minuto',  programa: 'Voces del Mundo', red: 'Instagram', link: '', foto: 'img/a4.jpg',  fecha: '', ejemplo: true },
  { titulo: 'La música que nos acompaña',             programa: 'Happy',           red: 'Facebook',  link: '', foto: 'img/a2.jpg',  fecha: '', ejemplo: true },
  { titulo: 'Entrevista: una voz detrás del micrófono', programa: 'UnArtículo',    red: 'Instagram', link: '', foto: 'img/a1.jpg',  fecha: '', ejemplo: true },
  { titulo: 'Viajar escuchando',                       programa: 'Voces del Mundo', red: 'Instagram', link: '', foto: 'img/a3.jpg',  fecha: '', ejemplo: true },
  { titulo: 'Dedicatorias de los seguidores',          programa: 'Happy',           red: 'Facebook',  link: '', foto: 'img/a5.jpg',  fecha: '', ejemplo: true }
];
