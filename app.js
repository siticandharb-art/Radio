const C = window.CONFIG, $ = id => document.getElementById(id);
document.title = C.nombre; $("brand").textContent = C.nombre; $("titulo").textContent = C.nombre;
$("eslogan").textContent = C.eslogan; $("anio").textContent = new Date().getFullYear();

// Reproductor
const audio = $("audio"), play = $("play"), estado = $("estado");
if (!C.streamUrl) { estado.textContent = "Transmisión próximamente."; play.disabled = true; play.style.opacity = .5; }
else {
  audio.src = C.streamUrl; audio.volume = .8;
  play.onclick = () => { if (audio.paused) { audio.src = C.streamUrl; audio.play().catch(() => estado.textContent = "No se pudo conectar con la transmisión."); } else { audio.pause(); audio.removeAttribute("src"); audio.load(); } };
  audio.onplaying = () => { play.textContent = "❚❚"; estado.textContent = "Reproduciendo"; };
  audio.onpause = () => { play.textContent = "▶"; estado.textContent = ""; };
  audio.onwaiting = () => estado.textContent = "Cargando…";
  audio.onerror = () => { if (audio.src) estado.textContent = "Error de transmisión. Probá de nuevo."; };
}
$("vol").oninput = e => audio.volume = e.target.value;

// Videos
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = d => d ? new Date(d).toLocaleDateString("es-AR", {day:"numeric",month:"long",year:"numeric"}) : "";
$("grid-videos").innerHTML = (window.VIDEOS||[]).map(v =>
  `<a class="card" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${v.id}"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg"><div><b>${esc(v.titulo)}</b><small>${fmt(v.fecha)}</small></div></a>`).join("");
$("ver-yt").href = C.youtube;

// Noticias
const gn = $("grid-noticias");
if (!C.feeds.length) gn.innerHTML = '<p class="vacio">Las noticias aparecerán acá próximamente.</p>';
else fetch("/api/noticias?" + C.feeds.map(f => "f=" + encodeURIComponent(f.url)).join("&"))
  .then(r => r.json()).then(list => {
    gn.innerHTML = list.length ? list.map(n => `<a class="card" target="_blank" rel="noopener" href="${esc(n.link)}">${n.img ? `<img loading="lazy" alt="" src="${esc(n.img)}">` : '<div class="ph"></div>'}<div><b>${esc(n.titulo)}</b><small>${esc(n.fuente)} · ${fmt(n.fecha)}</small></div></a>`).join("") : '<p class="vacio">No hay noticias por ahora.</p>';
  }).catch(() => gn.innerHTML = '<p class="vacio">No se pudieron cargar las noticias.</p>');

// Contacto
const L = [];
if (C.whatsapp) L.push(["WhatsApp", "https://wa.me/" + C.whatsapp]);
if (C.email) L.push(["Email", "mailto:" + C.email]);
if (C.instagram) L.push(["Instagram", C.instagram]);
if (C.facebook) L.push(["Facebook", C.facebook]);
if (C.youtube) L.push(["YouTube", C.youtube]);
$("contactos").innerHTML = L.map(([n,u]) => `<a class="btn" target="_blank" rel="noopener" href="${esc(u)}">${n}</a>`).join("");
