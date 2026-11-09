/* Sittic&Harb Radio · lógica de la web. Los contenidos están en datos.js */
(function(){
  var A = NOTAS, P = PROGRAMAS, S = SITIO, CATS = SECCIONES, V = (typeof VIDEOS !== 'undefined' ? VIDEOS : []);
  var igUser = (S.instagram || '').replace(/\/+$/, '').split('/').pop();
  var DM = igUser ? 'https://ig.me/m/' + igUser : S.instagram;
  var $ = function(s){ return document.querySelector(s); };
  var app = $('#app'), ov = $('#ov'), ovb = $('#ovb'), q = $('#q'), qx = $('#qx'), tabsEl = $('#tabs');
  var cur = { v:'home', a:null }, nav = 0, useHash = true;
  var BASE_TITLE = 'Sittic&Harb Radio · De Argentina al mundo';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function byId(i){ for (var k = 0; k < A.length; k++) if (A[k].id == i) return A[k]; return null; }
  function inCat(c){ return A.filter(function(x){ return x.seccion === c; }); }

  /* Ondas decorativas para notas sin foto */
  function waves(root){
    (root || document).querySelectorAll('.wave:not([data-ok])').forEach(function(el){
      el.setAttribute('data-ok', '1');
      var n = parseInt(el.getAttribute('data-n'), 10) || 30, seed = parseFloat(el.getAttribute('data-seed')) || 1;
      for (var k = 0; k < n; k++){
        var t = k/(n-1), env = .35 + .65*Math.sin(Math.PI*t), v = Math.abs(Math.sin(k*.55+seed)*Math.cos(k*.17+seed*1.7));
        var b = document.createElement('i'); b.style.setProperty('--h', Math.max(10, Math.min(100, 12 + 88*env*(.25+.75*v))).toFixed(0) + '%'); el.appendChild(b);
      }
    });
  }
  function ph(seed, n, img, eager){
    if (img) return '<div class="ph"><img src="' + esc(img) + '" alt="" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async"></div>';
    return '<div class="ph"><div class="wave" data-n="' + (n||26) + '" data-seed="' + seed + '" aria-hidden="true"></div></div>';
  }
  function meta(a){
    return '<p class="meta">Por <b>' + esc(a.autor || 'Redacción') + '</b>' + (a.fecha ? ' · ' + esc(a.fecha) : '') + (a.ejemplo ? ' · <span class="ej">texto de ejemplo</span>' : '') + '</p>';
  }
  function row(a){ return '<article class="row" data-go="nota:' + a.id + '"><div><div class="kicker">' + esc(a.seccion) + '</div><h3>' + esc(a.titulo) + '</h3>' + meta(a) + '</div>' + ph(a.id, 14, a.foto) + '</article>'; }
  function big(a){ return '<article class="big" data-go="nota:' + a.id + '">' + ph(a.id+3, 34, a.foto) + '<div class="kicker">' + esc(a.seccion) + '</div><h3>' + esc(a.titulo) + '</h3><p>' + esc(a.bajada) + '</p></article>'; }
  function sector(cat){
    var l = inCat(cat); if (!l.length) return '';
    return '<section class="sector"><div class="sh"><h2>' + esc(cat) + '</h2><button data-go="cat:' + esc(cat) + '">Ver más ›</button></div><div class="sec-g">' + big(l[0]) + '<div class="list">' + l.slice(1,4).map(row).join('') + '</div></div></section>';
  }
  function today(){ try { var f = new Date().toLocaleDateString('es-AR', {weekday:'long', day:'numeric', month:'long'}); return f.charAt(0).toUpperCase() + f.slice(1); } catch(e){ return ''; } }
  function ctaInner(){ return '<div class="kicker">Tu voz en la radio</div><h3>Contanos tu historia</h3><p>Si tenés una historia o una noticia para compartir, mandánosla y la convertimos en video.</p><button class="btn-gold" data-go="historia">Contar mi historia</button>'; }
  function vidsDe(n){ return V.filter(function(v){ return v.programa === n; }); }
  function progList(){ return '<ul class="plist">' + P.map(function(p){ var k = vidsDe(p.nombre).length; return '<li data-go="videos:' + esc(p.nombre) + '">' + esc(p.nombre) + '<small>' + (k ? k + ' video' + (k === 1 ? '' : 's') + ' ›' : 'Ver ›') + '</small></li>'; }).join('') + '</ul>'; }

  function focusables(r){ r.querySelectorAll('article[data-go],li[data-go]').forEach(function(el){ el.tabIndex = 0; el.setAttribute('role', 'link'); }); }

  /* ---------- Íconos de redes ---------- */
  var ICO = {
    Instagram:'<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>',
    Facebook:'<svg viewBox="0 0 24 24"><path d="M14.5 8H17V4.5h-2.5A3.5 3.5 0 0011 8v2.5H8.5V14H11v6h3.5v-6H17l.5-3.5h-3V8.5a.5.5 0 01.5-.5z"/></svg>',
    YouTube:'<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor"/></svg>'
  };
  function redesData(){
    return [
      { n:'Instagram', h:'@sitticharbradio_radio_online', l:S.instagram, d:'Videos informativos, entrevistas y especiales. Acá se publica todo primero.' },
      { n:'Facebook',  h:'Sittic&Harb Radio',             l:S.facebook,  d:'Los mismos videos y las novedades de la comunidad.' },
      { n:'YouTube',   h:'@SitticRadio',                  l:S.youtube,   d:'Las entrevistas completas.' }
    ];
  }
  function rcard(r){
    var inner = '<span class="rico">' + ICO[r.n] + '</span><div><div class="kicker">' + r.n + '</div><h3>' + esc(r.h) + '</h3><p>' + esc(r.d) + '</p></div>';
    if (!r.l) return '<div class="rcard off">' + inner + '<span class="go">Link pendiente</span></div>';
    return '<a class="rcard" href="' + esc(r.l) + '" target="_blank" rel="noopener">' + inner + '<span class="go">Seguir ›</span></a>';
  }

  /* ---------- Tarjeta de video (abre la publicación en la red) ---------- */
  var PLAY = '<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>';
  function vcard(v){
    return '<a class="vcard" href="' + esc(v.link || S.instagram) + '" target="_blank" rel="noopener"><div class="ph v">' +
      (v.foto ? '<img src="' + esc(v.foto) + '" alt="" loading="lazy" decoding="async">' : '<div class="wave" data-n="18" data-seed="' + (v.titulo.length) + '" aria-hidden="true"></div>') +
      PLAY + '<span class="red">' + ICO[v.red || 'Instagram'] + esc(v.red || 'Instagram') + '</span></div>' +
      '<div class="kicker">' + esc(v.programa) + '</div><h3>' + esc(v.titulo) + '</h3>' + (v.ejemplo ? '<p class="meta"><span class="ej">ejemplo</span></p>' : (v.fecha ? '<p class="meta">' + esc(v.fecha) + '</p>' : '')) + '</a>';
  }


  /* ---------- Video de la nota: se previsualiza ahí mismo ---------- */
  function embed(u){
    u = String(u || ''); var m;
    if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)))
      return { t:'iframe', red:'YouTube', vert:/\/shorts\//.test(u), src:'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0&playsinline=1', poster:'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' };
    if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return { t:'iframe', red:'Vimeo', src:'https://player.vimeo.com/video/' + m[1] + '?autoplay=1' };
    if ((m = u.match(/instagram\.com\/(?:[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/)))
      return { t:'iframe', red:'Instagram', vert:true, src:'https://www.instagram.com/' + (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] + '/embed/' };
    if (/facebook\.com|fb\.watch|fb\.com/.test(u))
      return { t:'iframe', red:'Facebook', vert:/\/reel\//.test(u), src:'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=true&href=' + encodeURIComponent(u) };
    if (/\.(mp4|webm|mov)(\?|#|$)/i.test(u)) return { t:'video', red:'Video', src:u };
    return null;
  }
  function media(a){
    var e = a.video ? embed(a.video) : null;
    if (!a.video) return ph(a.id + 2, 50, a.foto, true);
    if (!e) return ph(a.id + 2, 50, a.foto, true) + '<a class="btn-line" href="' + esc(a.video) + '" target="_blank" rel="noopener" style="margin-bottom:20px">Ver el video ›</a>';
    var poster = a.foto || e.poster;
    return '<button type="button" class="vplay' + (e.vert ? ' v' : '') + '" data-vp="1" aria-label="Reproducir el video: ' + esc(a.titulo) + '">' +
      (poster ? '<img src="' + esc(poster) + '" alt="" fetchpriority="high" decoding="async">' : '<div class="wave" data-n="40" data-seed="' + a.id + '" aria-hidden="true"></div>') +
      '<span class="pb"><span>' + '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>' + '</span></span><span class="tag">' + esc(e.red) + '</span></button>';
  }
  function playVideo(btn){
    var a = byId(cur.a), e = a && embed(a.video); if (!e || btn.classList.contains('on')) return;
    btn.classList.add('on'); btn.removeAttribute('data-vp'); btn.setAttribute('aria-label', 'Video');
    btn.innerHTML = e.t === 'video'
      ? '<video src="' + esc(e.src) + '" controls autoplay playsinline' + (a.foto ? ' poster="' + esc(a.foto) + '"' : '') + '></video>'
      : '<iframe src="' + esc(e.src) + '" title="' + esc(a.titulo) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen scrolling="no" referrerpolicy="origin-when-cross-origin"></iframe>';
  }

  /* ---------- Vistas ---------- */
  function vHome(){
    var lead = A[0], p1 = A[2] || A[1], p2 = A[5] || A[3];
    var secs = CATS.filter(function(c){ return inCat(c).length > 1; }).slice(0, 3);
    var strip = '<section class="sector"><div class="sh"><h2>Últimos videos</h2><button data-go="videos">Ver todos ›</button></div><div class="vrow">' + V.slice(0, 6).map(vcard).join('') + '</div></section>';
    return '<div class="home">' +
      '<aside class="l"><div class="ct">Lo último</div>' + A.slice(1,6).map(row).join('') + '</aside>' +
      '<div class="c"><p class="today">' + today() + '</p>' +
        '<article class="lead" data-go="nota:' + lead.id + '">' + ph(1, 46, lead.foto, true) + '<div class="kicker">' + esc(lead.seccion) + '</div><h2>' + esc(lead.titulo) + '</h2><p class="dek">' + esc(lead.bajada) + '</p>' + meta(lead) + '</article>' +
        (V.length ? '<div class="vmob">' + strip + '</div>' : '') +
        '<div class="pair">' + [p1, p2].map(function(a){ return '<article data-go="nota:' + a.id + '">' + ph(a.id, 24, a.foto) + '<div class="kicker">' + esc(a.seccion) + '</div><h3>' + esc(a.titulo) + '</h3></article>'; }).join('') + '</div>' +
      '</div>' +
      '<aside class="r"><div class="panel"><div class="ct">Programas</div>' + progList() + '</div><div class="cta" style="margin-top:22px">' + ctaInner() + '</div></aside>' +
    '</div>' +
    (V.length ? '<div class="vdesk">' + strip + '</div>' : '') +
    secs.map(sector).join('') +
    '<section class="sector"><div class="sh"><h2>Seguinos en redes</h2><button data-go="redes">Ver más ›</button></div><div class="redes">' + redesData().map(rcard).join('') + '</div></section>';
  }
  function vNota(id){
    var a = byId(id); if (!a) return vNoEncontrado();
    var mas = A.filter(function(x){ return x.id != a.id && x.seccion === a.seccion; }).concat(A.filter(function(x){ return x.id != a.id && x.seccion !== a.seccion; })).slice(0, 4);
    return '<article class="view art"><button class="back" data-go="atras">‹ Volver</button>' +
      '<p class="crumb"><a data-go="home">Sittic&amp;Harb</a> <span>›</span> <a data-go="cat:' + esc(a.seccion) + '">' + esc(a.seccion) + '</a></p>' +
      '<h1>' + esc(a.titulo) + '</h1><p class="dek">' + esc(a.bajada) + '</p>' +
      '<div class="by">' + meta(a) + '<button class="share" data-share="' + a.id + '"><svg viewBox="0 0 24 24"><path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/></svg>Compartir</button></div>' +
      media(a) +
      '<div class="txt">' + (a.texto || []).map(function(x){ return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' +
      '<div class="sh" style="margin-top:34px"><h2>Más notas</h2></div>' + mas.map(row).join('') + '</article>';
  }
  function vCat(c){
    var all = c === 'Últimas', l = all ? A : inCat(c);
    return '<div class="view"><h1 class="vt">' + esc(all ? 'Últimas noticias' : c) + '</h1>' + (l.length ? l.map(row).join('') : '<p class="empty">Todavía no hay notas en esta sección.</p>') + '</div>';
  }
  function vProg(){
    return '<div class="view"><h1 class="vt">Programas</h1><p class="intro">Series de videos que publicamos en Instagram y Facebook.</p><div class="pgrid">' + P.map(function(p){
      var k = vidsDe(p.nombre).length;
      return '<article class="prog" data-go="videos:' + esc(p.nombre) + '">' + (p.foto ? '<img class="pimg" src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">' : '<div class="pimg ph"><div class="wave" data-n="22" data-seed="' + p.nombre.length + '" aria-hidden="true"></div></div>') +
        '<h3>' + esc(p.nombre) + '</h3><p>' + esc(p.descripcion || 'Descripción a completar.') + '</p><p class="more">' + (k ? 'Ver ' + k + ' video' + (k === 1 ? '' : 's') : 'Ver videos') + ' ›</p></article>';
    }).join('') + '</div></div>';
  }
  function vVideos(prog){
    var l = prog ? vidsDe(prog) : V;
    var chips = '<div class="fchips">' + ['Todos'].concat(P.map(function(p){ return p.nombre; })).map(function(n){
      var on = (n === 'Todos' && !prog) || n === prog;
      return '<button data-go="' + (n === 'Todos' ? 'videos' : 'videos:' + esc(n)) + '"' + (on ? ' class="on"' : '') + '>' + esc(n) + '</button>';
    }).join('') + '</div>';
    return '<div class="view"><h1 class="vt">' + (prog ? esc(prog) : 'Videos') + '</h1>' + chips +
      (l.length ? '<div class="vgrid">' + l.map(vcard).join('') + '</div>' : '<p class="empty">Todavía no cargamos videos de este programa. Mientras tanto, están todos en <a class="u" href="' + esc(S.instagram) + '" target="_blank" rel="noopener">Instagram</a>.</p>') +
      '<p class="meta" style="margin-top:22px">Cada video se abre en la red donde se publicó.</p></div>';
  }
  function vRedes(){
    return '<div class="view"><h1 class="vt">Redes</h1><p class="intro">Los videos se publican primero en nuestras redes. Seguinos para no perderte ninguno.</p><div class="redes" style="margin-top:20px">' + redesData().map(rcard).join('') + '</div>' +
      '<div class="cta" style="margin-top:28px">' + ctaInner() + '</div></div>';
  }
  function vHist(){
    return '<div class="view"><h1 class="vt">Contanos tu historia</h1><p class="intro">¿Tenés una historia, una noticia o algo que quieras que se sepa? Contanosla y la convertimos en video.</p>' +
      '<form class="hist" id="hist" novalidate>' +
      '<div class="fld"><label for="f1">Tu nombre</label><input id="f1" name="nombre" required autocomplete="name"></div>' +
      '<div class="fld"><label for="f2">Cómo te contactamos</label><input id="f2" name="contacto" required placeholder="Mail, teléfono o usuario de Instagram"></div>' +
      '<div class="fld"><label for="f3">Ciudad y país</label><input id="f3" name="lugar" autocomplete="address-level2"></div>' +
      '<div class="fld"><label for="f4">Tu historia o noticia</label><textarea id="f4" name="historia" required placeholder="Contanos qué pasó, cuándo y dónde."></textarea></div>' +
      '<label class="chk"><input type="checkbox" id="f5" required><span>Acepto que usen mi relato para hacer un video.</span></label>' +
      '<p class="err" id="ferr" hidden>Completá tu nombre, cómo contactarte, tu historia y marcá la casilla.</p>' +
      '<button class="send" type="submit" id="fsend">Enviar mi historia</button><p class="formnote">' + esc(canal().nota) + ' Usamos tus datos solo para contactarte por tu historia.</p></form><div id="okbox"></div></div>';
  }
  function vNoEncontrado(){ return '<div class="view"><h1 class="vt">No encontramos esa página</h1><p class="empty">Puede que la nota se haya movido. <a data-go="home" class="u">Volver al inicio</a></p></div>'; }

  /* ---------- Navegación con links propios (#/nota/2) ---------- */
  function hashFor(v, a){
    if (v === 'nota') return '#/nota/' + a;
    if (v === 'cat') return '#/seccion/' + encodeURIComponent(a);
    if (v === 'videos') return '#/videos' + (a ? '/' + encodeURIComponent(a) : '');
    if (v === 'programas' || v === 'historia' || v === 'redes') return '#/' + v;
    return '#/';
  }
  function parse(){
    var p = (location.hash || '').replace(/^#\/?/, '').split('/'), a = p[1] ? decodeURIComponent(p[1]) : null;
    if (p[0] === 'nota') return { v:'nota', a:a };
    if (p[0] === 'seccion') return { v:'cat', a:a };
    if (p[0] === 'videos') return { v:'videos', a:a };
    if (p[0] === 'programas' || p[0] === 'historia' || p[0] === 'redes') return { v:p[0], a:null };
    return { v:'home', a:null };
  }
  var CHIPS = ['Últimas', 'Videos'].concat(CATS, ['Programas', 'Redes']);
  var CHIP_GO = { 'Últimas':'home', 'Videos':'videos', 'Programas':'programas', 'Redes':'redes' };
  function drawTabs(){
    var on = cur.v === 'cat' ? cur.a : ({ home:'Últimas', videos:'Videos', programas:'Programas', redes:'Redes' })[cur.v] || '';
    tabsEl.innerHTML = CHIPS.map(function(c){
      var g = CHIP_GO[c] || 'cat:' + c;
      return '<button data-go="' + esc(g) + '"' + (c === on ? ' class="on" aria-current="page"' : '') + '>' + esc(c) + '</button>';
    }).join('');
    var onb = tabsEl.querySelector('.on'); if (onb && onb.scrollIntoView) try { onb.scrollIntoView({block:'nearest', inline:'center'}); } catch(e){}
    document.querySelectorAll('.tabbar button').forEach(function(b){
      var t = b.getAttribute('data-t'), m = (t === 'home' && (cur.v === 'home' || cur.v === 'cat' || cur.v === 'nota')) || t === cur.v || (t === 'videos' && cur.v === 'programas');
      b.classList.toggle('on', m);
    });
  }
  var TITLES = { programas:'Programas', historia:'Contanos tu historia', redes:'Redes' };
  function render(){
    var v = cur.v, h;
    if (v === 'nota') h = vNota(cur.a); else if (v === 'cat') h = vCat(cur.a); else if (v === 'programas') h = vProg(); else if (v === 'videos') h = vVideos(cur.a); else if (v === 'redes') h = vRedes(); else if (v === 'historia') h = vHist(); else h = vHome();
    app.innerHTML = h; waves(app); focusables(app); drawTabs();
    var a = v === 'nota' && byId(cur.a);
    var t = a ? a.titulo : (v === 'cat' ? cur.a : (v === 'videos' ? (cur.a || 'Videos') : TITLES[v]));
    document.title = t ? t + ' · Sittic&Harb Radio' : BASE_TITLE;
    window.scrollTo(0, 0);
  }
  function go(spec){
    var p = spec.split(':'), v = p[0], a = p.slice(1).join(':') || null;
    if (v === 'cerrar'){ closeOv(); return; }
    if (v === 'menu'){ openOv(false); return; }
    if (v === 'buscar'){ openOv(true); return; }
    if (v === 'atras'){ if (useHash && nav > 0){ nav--; history.back(); } else go('home'); return; }
    closeOv();
    var h = hashFor(v, a);
    if (useHash){
      if (location.hash === h || (h === '#/' && !location.hash)){ cur = { v:v, a:a }; render(); return; }
      try { nav++; location.hash = h; return; } catch(e){ useHash = false; }
    }
    cur = { v:v, a:a }; render();
  }
  window.addEventListener('hashchange', function(){ cur = parse(); closeOv(); render(); });

  /* ---------- Menú y buscador ---------- */
  function contactoSub(){
    var h = '';
    h += S.mail ? '<a href="mailto:' + esc(S.mail) + '">Mail: ' + esc(S.mail) + '</a>' : '<a>Mail: a completar</a>';
    h += S.whatsapp ? '<a href="https://wa.me/' + esc(S.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>' : '<a>WhatsApp: a completar</a>';
    h += '<a href="' + esc(DM) + '" target="_blank" rel="noopener">Escribinos por Instagram</a>';
    return h;
  }
  function menuHTML(){
    var h = '<a class="radio-row" data-go="cat:Música"><span class="dot"><svg viewBox="0 0 24 24"><path d="M6 10v4M10 7v10M14 4v16M18 9v6"/></svg></span><span>Música del recuerdo<small>Notas y especiales musicales</small></span></a>';
    h += '<div class="ov-l">Secciones</div>';
    h += '<details><summary>Últimas noticias</summary><div class="sub">' + A.slice(0,3).map(function(a){ return '<a data-go="nota:' + a.id + '">' + esc(a.titulo) + '</a>'; }).join('') + '<button class="all" data-go="cat:Últimas">Ver todas ›</button></div></details>';
    CATS.forEach(function(c){
      var l = inCat(c).slice(0,2);
      h += '<details><summary>' + esc(c) + '</summary><div class="sub">' + l.map(function(a){ return '<a data-go="nota:' + a.id + '">' + esc(a.titulo) + '</a>'; }).join('') + '<button class="all" data-go="cat:' + esc(c) + '">Ver todo en ' + esc(c) + ' ›</button></div></details>';
    });
    h += '<details><summary>Videos</summary><div class="sub">' + V.slice(0,3).map(function(v){ return '<a href="' + esc(v.link || S.instagram) + '" target="_blank" rel="noopener">' + esc(v.titulo) + '</a>'; }).join('') + '<button class="all" data-go="videos">Ver todos los videos ›</button></div></details>';
    h += '<details><summary>Programas</summary><div class="sub">' + P.map(function(p){ return '<a data-go="videos:' + esc(p.nombre) + '">' + esc(p.nombre) + '</a>'; }).join('') + '<button class="all" data-go="programas">Ver programas ›</button></div></details>';
    h += '<button class="plain" data-go="historia">Contanos tu historia<span class="tag">Nuevo</span></button>';
    h += '<details><summary>Redes</summary><div class="sub"><a href="' + esc(S.instagram) + '" target="_blank" rel="noopener">Instagram</a><a href="' + esc(S.youtube) + '" target="_blank" rel="noopener">YouTube</a>' + (S.facebook ? '<a href="' + esc(S.facebook) + '" target="_blank" rel="noopener">Facebook</a>' : '<a>Facebook (próximamente)</a>') + '<button class="all" data-go="redes">Ver redes ›</button></div></details>';
    h += '<details><summary>Contacto</summary><div class="sub">' + contactoSub() + '</div></details>';
    h += '<button class="plain" id="temaM">Modo oscuro<span class="sw" aria-hidden="true"><i></i></span></button>';
    return h;
  }
  function sugg(){ return '<div class="ov-l">Búsquedas sugeridas</div><div class="chips">' + ['Miradas','Entrevistas','Música del recuerdo','Mundo','Videos','Dedicatorias'].map(function(s){ return '<button data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>'; }
  function norm(s){ return String(s || '').toLowerCase().normalize ? String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : String(s || '').toLowerCase(); }
  function drawOv(){
    var raw = q.value.trim(), s = norm(raw); qx.hidden = !raw;
    if (!s){ ovb.innerHTML = sugg() + menuHTML(); themeLabel(); return; }
    var STOP = { de:1, del:1, la:1, el:1, los:1, las:1, y:1, en:1, un:1, una:1, que:1, por:1, con:1, al:1 };
    var words = s.split(/\s+/).filter(function(w){ return w.length > 1 && !STOP[w]; }); if (!words.length) words = [s];
    var score = function(txt){ txt = norm(txt); var n = 0; words.forEach(function(w){ if (txt.indexOf(w) > -1) n++; }); return n; };
    var rank = function(list, f){ return list.map(function(x){ return { x:x, s:score(f(x)) }; }).filter(function(o){ return o.s > 0; }).sort(function(a, b){ return b.s - a.s; }).map(function(o){ return o.x; }); };
    var r = rank(A, function(a){ return a.titulo + ' ' + a.bajada + ' ' + a.seccion + ' ' + (a.texto || []).join(' '); });
    var pr = rank(P, function(p){ return p.nombre + ' programa programas ' + (p.descripcion || ''); });
    var vr = rank(V, function(v){ return v.titulo + ' ' + v.programa + ' video videos ' + (v.red || ''); });
    var n = r.length + pr.length + vr.length;
    var h = '<div class="ov-l">' + n + ' resultado' + (n === 1 ? '' : 's') + '</div><div class="res">';
    h += pr.map(function(p){ return '<article class="row" data-go="videos:' + esc(p.nombre) + '"><div><div class="kicker">Programa</div><h3>' + esc(p.nombre) + '</h3></div></article>'; }).join('');
    h += r.map(function(a){ return '<article class="row" data-go="nota:' + a.id + '"><div><div class="kicker">' + esc(a.seccion) + '</div><h3>' + esc(a.titulo) + '</h3></div>' + ph(a.id, 10, a.foto) + '</article>'; }).join('');
    h += vr.map(function(v){ return '<a class="row" href="' + esc(v.link || S.instagram) + '" target="_blank" rel="noopener"><div><div class="kicker">Video · ' + esc(v.programa) + '</div><h3>' + esc(v.titulo) + '</h3></div>' + ph(1, 10, v.foto) + '</a>'; }).join('');
    if (!n) h += '<p class="empty">No encontramos nada para “' + esc(raw) + '”. Probá con otra palabra.</p>';
    ovb.innerHTML = h + '</div>'; focusables(ovb);
  }
  var lastFocus = null;
  function openOv(focus){ lastFocus = document.activeElement; ov.classList.add('open'); document.body.classList.add('lock'); drawOv(); setTimeout(function(){ (focus ? q : ov.querySelector('.ov-in')).focus({preventScroll:true}); }, 40); }
  function closeOv(){ if (!ov.classList.contains('open')) return; ov.classList.remove('open'); document.body.classList.remove('lock'); q.value = ''; q.blur(); if (lastFocus && lastFocus.focus) try { lastFocus.focus({preventScroll:true}); } catch(e){} }
  q.addEventListener('input', drawOv);
  q.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ var f = ovb.querySelector('.row'); if (f) go(f.getAttribute('data-go')); } });
  qx.addEventListener('click', function(){ q.value = ''; drawOv(); q.focus(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeOv(); });

  /* ---------- Tema claro / oscuro ---------- */
  var root = document.documentElement;
  function isDark(){ return root.getAttribute('data-theme') === 'dark'; }
  function themeLabel(){ var m = $('#temaM'); if (m) m.classList.toggle('on', isDark()); }
  function toggleTheme(){ var n = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', n); try { localStorage.setItem('sh-tema3', n); } catch(e){} themeLabel(); }
  $('#temaD').addEventListener('click', toggleTheme);

  function toast(m){ var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function(){ t.classList.remove('on'); }, 2400); }

  /* ---------- Clicks ---------- */
  document.addEventListener('click', function(e){
    var vp = e.target.closest('[data-vp]'); if (vp){ playVideo(vp); return; }
    var t = e.target.closest('[data-go],[data-q],[data-share],#temaM'); if (!t) return;
    if (t.id === 'temaM'){ toggleTheme(); return; }
    if (t.hasAttribute('data-q')){ q.value = t.getAttribute('data-q'); drawOv(); q.focus(); return; }
    if (t.hasAttribute('data-share')){
      var a = byId(t.getAttribute('data-share')), url = location.href;
      try { if (navigator.share){ navigator.share({ title:a.titulo, text:a.titulo + ' · Sittic&Harb Radio', url:url }).catch(function(){}); return; } } catch(x){}
      try { navigator.clipboard.writeText(url).then(function(){ toast('Link copiado'); }, function(){ toast('No se pudo copiar el link'); }); } catch(x){ toast('No se pudo copiar el link'); }
      return;
    }
    if (t.tagName === 'A' && t.getAttribute('href')) return;
    e.preventDefault(); go(t.getAttribute('data-go'));
  });
  document.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('article[data-go],li[data-go]')){ e.preventDefault(); go(e.target.getAttribute('data-go')); }
  });

  /* ---------- Formulario "Contanos tu historia" ---------- */
  function canal(){
    if (S.formulario) return { tipo:'form', nota:'Tu historia nos llega directo.' };
    if (S.whatsapp)   return { tipo:'wa',   nota:'Se envía por WhatsApp a la radio.' };
    if (S.mail)       return { tipo:'mail', nota:'Se envía por mail a la radio.' };
    return { tipo:'ig', nota:'Se envía por el chat de Instagram de la radio.' };
  }
  function okBox(title, body, extra){
    var f = $('#hist'); if (f) f.style.display = 'none';
    $('#okbox').innerHTML = '<div class="ok"><h3>' + title + '</h3><p>' + body + '</p>' + (extra || '') + '</div>';
    window.scrollTo(0, 0);
  }
  document.addEventListener('submit', function(e){
    if (e.target.id !== 'hist') return; e.preventDefault();
    var g = function(i){ return $('#' + i).value.trim(); };
    if (!g('f1') || !g('f2') || !g('f4') || !$('#f5').checked){ $('#ferr').hidden = false; return; }
    $('#ferr').hidden = true;
    var d = { nombre:g('f1'), contacto:g('f2'), lugar:g('f3') || '-', historia:g('f4') };
    var msg = 'Hola Sittic&Harb Radio, quiero contar mi historia.\n\nNombre: ' + d.nombre + '\nContacto: ' + d.contacto + '\nCiudad y país: ' + d.lugar + '\n\nMi historia:\n' + d.historia + '\n\nAcepto que usen mi relato para un video.';
    var c = canal(), btn = $('#fsend');
    if (c.tipo === 'form'){
      btn.disabled = true; btn.textContent = 'Enviando…';
      fetch(S.formulario, { method:'POST', headers:{ 'Accept':'application/json', 'Content-Type':'application/json' }, body:JSON.stringify(Object.assign({ _subject:'Nueva historia para la radio' }, d)) })
        .then(function(r){ if (!r.ok) throw 0; okBox('¡Gracias, ' + esc(d.nombre) + '!', 'Recibimos tu historia. Te vamos a contactar por ' + esc(d.contacto) + '.'); })
        .catch(function(){ btn.disabled = false; btn.textContent = 'Enviar mi historia'; toast('No se pudo enviar. Probá de nuevo.'); });
      return;
    }
    if (c.tipo === 'wa'){
      var wa = 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(msg);
      window.open(wa, '_blank', 'noopener');
      okBox('Abrimos WhatsApp', 'Si no se abrió solo, tocá el botón y mandá el mensaje.', '<a class="btn-gold" href="' + esc(wa) + '" target="_blank" rel="noopener">Abrir WhatsApp</a>');
      return;
    }
    if (c.tipo === 'mail'){
      var ml = 'mailto:' + S.mail + '?subject=' + encodeURIComponent('Mi historia para la radio') + '&body=' + encodeURIComponent(msg);
      location.href = ml;
      okBox('Abrimos tu correo', 'Revisá el mail y tocá enviar.', '<a class="btn-gold" href="' + esc(ml) + '">Abrir el correo</a>');
      return;
    }
    try { navigator.clipboard.writeText(msg); } catch(x){}
    okBox('Listo, ya casi está', 'Copiamos tu mensaje. Abrí el chat de Instagram de la radio y pegalo para enviarlo.', '<textarea readonly id="okmsg"></textarea><a class="btn-gold" href="' + esc(DM) + '" target="_blank" rel="noopener">Abrir chat de Instagram</a>');
    $('#okmsg').value = msg;
  });

  /* ---------- Pie ---------- */
  var fb = $('#fbFoot'); if (fb){ if (S.facebook){ fb.href = S.facebook; fb.hidden = false; } }

  /* ---------- Inicio ---------- */
  var sv = null; try { sv = localStorage.getItem('sh-tema3'); } catch(e){}
  if (sv === 'dark') root.setAttribute('data-theme', 'dark');
  cur = parse(); render();
})();
