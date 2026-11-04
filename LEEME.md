# Sittic&Harb Radio · web

## Archivos
- `index.html`: la página (diseño). No hace falta tocarla.
- `datos.js`: **todo el contenido**. Notas, programas, links, mail y WhatsApp se cambian acá.
- `app.js`: el funcionamiento (buscador, menú, formulario). No hace falta tocarlo.
- `img/`: fotos, ícono y la imagen que aparece al compartir el link.

## Publicar en Vercel
1. Subí **todo el contenido de esta carpeta** a un repositorio de GitHub.
2. En vercel.com: Add New → Project → elegí el repositorio → Deploy.
3. Cada vez que cambies algo en GitHub, Vercel actualiza la web sola.

## Cargar una nota nueva
Abrí `datos.js` en GitHub (el lápiz para editar), copiá un bloque de nota y pegalo arriba de todo en la lista NOTAS. Cambiá id, título, bajada, texto y foto, y guardá con "Commit changes".

## Cargar videos de Instagram o Facebook
En la publicación tocá los tres puntitos → "Copiar enlace". En `datos.js`, lista VIDEOS: copiá un bloque, pegá el link, poné título, programa y la portada (una captura del video guardada en img/). Las más nuevas van arriba. El video se abre en la red donde se publicó.

## Activar el formulario "Contanos tu historia"
En `datos.js`, dentro de SITIO, completá una de estas opciones:
- `whatsapp`: el número de la radio (ej. 5491112345678). La historia llega por WhatsApp.
- `mail`: abre el correo de la persona con el mensaje armado.
- `formulario`: link de Formspree (gratis en formspree.io). La historia llega directo a tu mail sin que la persona salga de la página.
Si no completás ninguno, la historia se envía por el chat de Instagram.
