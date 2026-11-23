/* Faculty directory: search, filters, and profile modal */
(() => {
  const LI = 'https://www.linkedin.com/in/';
  const F = [
    // Computer Science
    ['Barrameda, Rolando B.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology', 'PhD in Computer Science'], 'rolando-barrameda-315955423/', 'photos/faculty/barrameda.png'],
    ['Eduardo, Josephine T.', 'CS', ['Bachelor of Science in Computer Science', 'Master of Science in Computer Science'], 'josephine-eduardo-357149377/', 'photos/faculty/eduardo.png'],
    ['Erquita, Marnelli B.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology'], null, 'photos/faculty/erquita.png'],
    ['Herradura, Tita R.', 'CS', ['Bachelor of Science in Computer Engineering', 'Master of Computer Science, De La Salle University-Manila'], 'tita-herradura-b9046421a/', 'photos/faculty/herradura.png'],
    ['Kamantigue, Sheryl D.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology'], 'sheryl-kamantigue-51132062/', 'photos/faculty/kamantigue.png'],
    ['Manaois, Jennylinde R.', 'CS', ['Bachelor of Science in Computer Science, De La Salle University-Dasmariñas', 'Master in Information Technology, Adamson University'], null, 'photos/faculty/manaois.png'],
    ['Bancud, Jan Daenell', 'CS', ['Bachelor of Science in Computer Science'], 'jan-daenell-bancud-0aa9bb148/', 'photos/faculty/bancud.png'],
    ['Cabalsa, Elsie G.', 'CS', ['Bachelor of Science in Computer Science'], null, 'photos/faculty/cabalsa.png'],
    ['Colocado, Erika Kyle D.', 'CS', ['Bachelor of Science in Computer Science'], 'erika-kyle-colocado-26b5a3322/', 'photos/faculty/colocado.png'],
    ['De Ocampo, Gerson T.', 'CS', ['Bachelor of Science in Computer Science'], 'gers-dcmpo/', 'photos/faculty/ocampo.png', 'photos/faculty/deocampo.png'],
    ['Lodronio, Ranielle', 'CS', ['Bachelor of Science in Computer Science'], null, 'photos/faculty/lodronio.png'],
    ['Ong, Allen Joseph O.', 'CS', ['Bachelor of Science in Computer Science'], null, 'photos/faculty/ong.png'],
    ['Rollan, Joynalyn P.', 'CS', ['Bachelor of Science in Computer Science'], 'joynalyn-rollan-b40583217/', 'photos/faculty/rollan.png'],
    ['Zapanta, Orlando A.', 'CS', ['Bachelor of Science in Computer Science'], 'orlando-zapanta-2758451b8/', 'photos/faculty/zapanta.png'],
    // Information Technology
    ['Del Rosario, Maria Gloria A.', 'IT', ['Bachelor of Science in Secretarial Administration Major in Computer Education', 'Masters in Information Technology'], 'maria-gloria-del-rosario-9528b3106/', 'photos/faculty/delrosario.png', 'photos/faculty/rosario.png'],
    ['Doctor, Juanito C.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'juanito-doctor-695757360/', 'photos/faculty/doctor.png'],
    ['Gatpandan, Paulino H., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Master in Business Administration', 'Master of Science in Computer Science', 'Doctor in Information Technology'], 'paulino-gatpandan-9b6a17259/', 'photos/faculty/gatpandan.png'],
    ['Mayuga, Emelyn D.', 'IT', ['Bachelor of Science in Secretarial Administration Major in Computer Education', 'Master of Arts in Education Major in Computer Aided Information'], 'emelyn-mayuga-aa7ab466/', 'photos/faculty/mayuga.png'],
    ['Mitschek, Marivic R.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'marivic-mitschek-996643a7/', 'photos/faculty/mitscheck.png', 'photos/faculty/mitschek.png'],
    ['Mojica, Azenith R.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'azenith-mojica-130bb4147/', 'photos/faculty/mojica.png'],
    ['Naz, Sherry B.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'sherry-naz-47140b208/', 'photos/faculty/naz.png'],
    ['Pamintuan, Evangeline G.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'evangeline-pamintuan-861ba258/', 'photos/faculty/pamintuan.png'],
    ['Rosas, Maryli F., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology', 'Doctor in Information Technology'], 'maryli-rosas-33b467123/', 'photos/faculty/rosas.png'],
    ['Sanares, Roda N., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology', 'Doctor in Information Technology'], 'roda-sanares-dit-0a79822b7/', 'photos/faculty/sanares.png'],
    ['Sermaña, Rochelle D.', 'IT', ['Bachelor of Science in Computer Science', 'Master of Information Technology'], 'sermana-rochelle-3b60593b0/', 'photos/faculty/sernana.png', 'photos/faculty/sermana.png'],
    ['Baculod, Joneil M.', 'IT', ['Bachelor of Science in Information Technology'], 'joneil-baculod-b52399276/', 'photos/faculty/baculod.png'],
    ['Balleras, Randolph M.', 'IT', ['Bachelor of Science in Information Technology', 'Bachelor of Science in Civil Engineering', 'Master of Information Technology'], 'randolph-balleras-27251ba/', 'photos/faculty/balleras.png'],
    ['Galingana, Cesar D.', 'IT', ['Bachelor of Science in Computer Science', 'Diploma in Information Communication Technology (Level 7)'], 'cesar-galingana-042857171/', 'photos/faculty/galang.png', 'photos/faculty/galingana.png'],
    ['Galo, Michael C.', 'IT', ['Bachelor of Science in Information Technology'], 'michael-galo-350a9558/', 'photos/faculty/galo.png'],
    ['Galve, Arnold B.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'arnold-galve-184b71143/', 'photos/faculty/galve.png'],
    ['Lina, Maria Patricia B.', 'IT', ['Bachelor of Science in Computer Science'], null, 'photos/faculty/lina.png']
  ].map(([name, prog, deg, li, photo, altPhoto]) => {
    const all = deg.join(' ').toLowerCase();
    const lvl = /doctor|phd/.test(all) ? 'Doctorate' : /master/.test(all) ? "Master's" : "Bachelor's";
    const clean = name.replace(/, DIT$/, '');
    const [last, first] = clean.split(', ');
    return { name, prog, deg, lvl, li: li ? (li.startsWith('http') ? li : LI + li) : null, photo: photo || null, altPhoto: altPhoto || null, ini: (first[0] + last[0]).toUpperCase(), prof: prog === 'CS' ? 'Computer Science' : 'Information Technology' };
  });

  // Photos pre-built by build-photos.html (works even when the page is opened as a file)
  const EMBED = window.FACULTY_PHOTOS || {};
  const embedded = f => EMBED[f.photo] || (f.altPhoto && EMBED[f.altPhoto]) || null;

  const avatarHtml = f => f.photo ?
    `<span>${f.ini}</span><img src="${f.photo}" alt="${f.name}" style="display:none"${f.altPhoto ? ` data-alt="${f.altPhoto}"` : ''} onload="this.style.display='block';if(this.previousElementSibling)this.previousElementSibling.style.display='none'" onerror="if(!this.dataset.t&&this.dataset.alt){this.dataset.t='1';this.src=this.dataset.alt}else{this.remove()}">` :
    f.ini;

  const updateAvatars = root => {
    (root || document).querySelectorAll('.av-lg img').forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        img.style.display = 'block';
        if (img.previousElementSibling) img.previousElementSibling.style.display = 'none';
      }
    });
  };

  const grid = document.querySelector('.fac-grid'), q = document.getElementById('q'), count = document.getElementById('facCount'), empty = document.querySelector('.empty');
  const modal = document.getElementById('modal'), box = modal.querySelector('.modal-box');
  let prog = 'all', lvl = 'all', term = '';

  grid.innerHTML = F.map((f, i) => `
    <button class="fac" data-i="${i}" data-prog="${f.prog}" data-lvl="${f.lvl}" aria-label="View ${f.name}">
      <div class="pic"><div class="av-lg">${avatarHtml(f)}</div></div>
      <div class="info">
        <h3>${f.name}</h3>
        <div class="pos">Faculty, ${f.prof}</div>
        <span class="field">${f.prog === 'CS' ? 'Comp. Science' : 'Info. Tech'}</span><span class="field lvl">${f.lvl}</span>
        <p>${f.deg[f.deg.length - 1]}</p>
        <span class="view">View profile →</span>
      </div>
    </button>`).join('');
  updateAvatars(grid);
  const cards = [...grid.children];

  /* ---- Holographic card grid: hover = holo shimmer, click = large card with full credentials.
         Without WebGL2 the plain cards below stay visible. ---- */
  const cells = [];
  let deactivateNow = () => {};
  let openHolo = () => {};
  (() => {
    const hcGrid = document.getElementById('hcGrid'), holoModal = document.getElementById('holoModal');
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe || !hcGrid || !holoModal || !window.HoloCard) return;
    const lose = probe.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();

    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const disp = f => {
      const clean = f.name.replace(/, DIT$/, ''); const [last, first] = clean.split(', ');
      return first + ' ' + last + (/, DIT$/.test(f.name) ? ', DIT' : '');
    };
    const wrapText = (text, max, lines) => {
      const out = []; let cur = '';
      text.split(' ').forEach(w => {
        if ((cur + ' ' + w).trim().length > max) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
      });
      if (cur) out.push(cur);
      if (out.length > lines) { out.length = lines; out[lines - 1] = out[lines - 1].replace(/\s*\S{0,3}$/, '') + '\u2026'; }
      return out;
    };

    // Card art as an SVG data URI (630x880 = 63:88 card ratio).
    const cardArt = (f, photoUri) => {
      const name = disp(f);
      const c = f.prog === 'IT' ? ['#12b86a', '#06361f'] : ['#0c8a4c', '#04170f'];
      const size = Math.max(24, Math.min(42, Math.floor(520 / (name.length * 0.56))));
      const font = 'font-family="Arial, Helvetica, sans-serif"';
      const top = f.deg[f.deg.length - 1];
      const lines = wrapText(top, 38, 2).map((t, i) =>
        '<text x="86" y="' + (748 + i * 28) + '" ' + font + ' font-size="19" fill="#ffffff" fill-opacity=".88">' + esc(t) + '</text>').join('');
      const clipId = 'picClip_' + Math.random().toString(36).slice(2, 8);
      const portrait = photoUri ?
        '<defs><clipPath id="' + clipId + '"><rect x="56" y="168" width="518" height="400" rx="18"/></clipPath></defs>' +
        '<image href="' + photoUri + '" x="56" y="168" width="518" height="400" preserveAspectRatio="xMidYMin slice" clip-path="url(#' + clipId + ')"/>' :
        '<circle cx="315" cy="318" r="86" fill="#ffffff" fill-opacity=".9"/>' +
        '<path d="M140 568c0-96 76-152 175-152s175 56 175 152z" fill="#ffffff" fill-opacity=".9"/>';

      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="630" height="880" viewBox="0 0 630 880">' +
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
        '<linearGradient id="art" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7a4d"/><stop offset="1" stop-color="#06361f"/></linearGradient></defs>' +
        '<rect width="630" height="880" fill="#d4dae0"/>' +
        '<rect x="26" y="26" width="578" height="828" rx="14" fill="url(#bg)"/>' +
        '<text x="315" y="100" text-anchor="middle" ' + font + ' font-size="' + size + '" font-weight="700" fill="#ffffff">' + esc(name) + '</text>' +
        '<text x="315" y="138" text-anchor="middle" ' + font + ' font-size="20" font-weight="700" letter-spacing="4" fill="#ffc233">' + esc(f.prof.toUpperCase()) + '</text>' +
        '<rect x="56" y="168" width="518" height="400" rx="18" fill="url(#art)" stroke="#ffc233" stroke-width="3"/>' +
        portrait +
        '<rect x="56" y="598" width="518" height="226" rx="16" fill="#000000" fill-opacity=".34"/>' +
        '<text x="86" y="640" ' + font + ' font-size="16" font-weight="700" letter-spacing="3" fill="#ffc233">HIGHEST DEGREE</text>' +
        '<text x="86" y="690" ' + font + ' font-size="32" font-weight="700" fill="#ffffff">' + esc(f.lvl) + '</text>' +
        lines +
        '<text x="86" y="806" ' + font + ' font-size="15" fill="#ffffff" fill-opacity=".6" letter-spacing="2">CICS  \u00b7  DLSU-D</text>' +
        '</svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };

    const holoRoot = document.getElementById('holoCard'), holoInfo = document.getElementById('holoInfo'), holoClose = document.getElementById('holoClose');
    let holo = null, holoIndex = -1, lastFocus = null, closing = 0;
    const live = []; // cells that currently own a WebGL context, oldest first
    const MAX_LIVE = 4;
    // Cards start with the photo already inside the art when photos-data.js is present
    const art = F.map(f => cardArt(f, embedded(f)));
    const shine = { preset: 'gold', foilColor: '#e2e6ec', intensity: 0.48, scale: 1, edgeSparkle: 0.45, frame: 4, glare: 0.28, tiltMax: 14, hoverScale: 1.04, radius: 14, width: 320, shadow: true };

    // ---- Fallback when photos-data.js is missing: read the photo through a canvas (needs http://, not file://) ----
    const toDataUri = url => new Promise(resolve => {
      if (!url) return resolve(null);
      const img = new Image();
      img.onload = () => {
        try {
          const max = 720;
          const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * s));
          c.height = Math.max(1, Math.round(img.naturalHeight * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/png'));
        } catch (err) {
          console.warn('[faculty] Could not put the photo on the card. Run build-photos.html and add photos-data.js next to faculty.html.', url);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });

    // Puts the photo into the card art (grid card, hover card and popup) and removes the separate overlay photo
    const artJobs = [];
    const ensureArt = i => artJobs[i] || (artJobs[i] = (async () => {
      const f = F[i];
      if (!f.photo || embedded(f)) return;
      let uri = await toDataUri(f.photo);
      if (!uri && f.altPhoto) uri = await toDataUri(f.altPhoto);
      if (!uri) return;
      art[i] = cardArt(f, uri);
      if (cells[i]) {
        const staticImg = cells[i].querySelector('.hc-img');
        if (staticImg) staticImg.src = art[i];
        const overlay = cells[i].querySelector('.hc-photo');
        if (overlay) overlay.remove();
        if (cells[i]._holo) cells[i]._holo.setImage(art[i]);
      }
      if (holoIndex === i && holo) holo.setImage(art[i]);
    })());

    // ---- Click: large holographic card with the full educational background ----
    openHolo = i => {
      const f = F[i];
      clearTimeout(closing);
      lastFocus = document.activeElement;
      holoIndex = i;
      live.slice().forEach(deactivateNow); // free the grid's contexts while the popup is open
      holoInfo.innerHTML = '<span class="field">' + esc(f.prof) + '</span><span class="field lvl">' + esc(f.lvl) + '</span>' +
        '<h3>' + esc(disp(f)) + '</h3><div class="pos">Faculty, ' + esc(f.prof) + '</div>' +
        '<div class="int"><b>Educational background</b><ul class="edu">' + f.deg.map(d => '<li>' + esc(d) + '</li>').join('') + '</ul></div>' +
        (f.li ? '<a class="btn btn-primary holo-li" href="' + f.li + '" target="_blank" rel="noopener">View LinkedIn \u2192</a>' : '') +
        '<div class="holo-hint">Move your cursor over the card. Press Escape to close.</div>';
      if (holo) holo.destroy();
      holo = HoloCard(holoRoot, Object.assign({ image: art[i], alt: disp(f) + ' faculty card', idle: true }, shine));
      holoModal.classList.add('open');
      holoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => holoModal.classList.add('show'));
      holoClose.focus();
      ensureArt(i);
    };
    const closeHolo = () => {
      if (!holoModal.classList.contains('open')) return;
      holoIndex = -1;
      holoModal.classList.remove('show');
      holoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      closing = setTimeout(() => { holoModal.classList.remove('open'); if (holo) { holo.destroy(); holo = null; } }, 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    holoClose.addEventListener('click', closeHolo);
    holoModal.addEventListener('click', e => { if (e.target === holoModal) closeHolo(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeHolo(); });

    // ---- Hover: a card is a plain image until hovered, focused or tapped, so only a few WebGL contexts exist ----
    deactivateNow = cell => {
      clearTimeout(cell._t);
      if (cell._holo) { cell._holo.destroy(); cell._holo = null; }
      cell._live.textContent = '';
      cell.classList.remove('active');
      const k = live.indexOf(cell); if (k >= 0) live.splice(k, 1);
    };
    const activate = (cell, i) => {
      clearTimeout(cell._t);
      if (cell._holo) return;
      while (live.length >= MAX_LIVE) deactivateNow(live[0]);
      const root = document.createElement('div');
      cell._live.appendChild(root);
      cell._holo = HoloCard(root, Object.assign({ image: art[i], alt: '', idle: false }, shine));
      cell.classList.add('active');
      live.push(cell);
    };
    const deactivate = cell => { clearTimeout(cell._t); cell._t = setTimeout(() => deactivateNow(cell), 550); };

    F.forEach((f, i) => {
      const cell = document.createElement('div');
      cell.className = 'hc-cell';
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', disp(f) + ', ' + f.prof + ', ' + f.lvl + '. Open credentials');
      const img = document.createElement('img');
      img.className = 'hc-img'; img.src = art[i]; img.alt = ''; img.draggable = false;
      const liveEl = document.createElement('div');
      liveEl.className = 'hc-live';
      cell.append(img, liveEl);
      // Separate overlay photo only when the photo is not already inside the card art
      if (f.photo && !embedded(f)) {
        const photo = document.createElement('img');
        photo.className = 'hc-photo';
        photo.src = f.photo;
        photo.alt = f.name;
        photo.draggable = false;
        if (f.altPhoto) photo.dataset.alt = f.altPhoto;
        photo.onerror = function () {
          if (!this.dataset.t && this.dataset.alt) {
            this.dataset.t = '1';
            this.src = this.dataset.alt;
          } else {
            this.remove();
          }
        };
        cell.append(photo);
      }
      cell._live = liveEl; cell._holo = null;
      ['pointerenter', 'pointerdown', 'focus'].forEach(ev => cell.addEventListener(ev, () => activate(cell, i)));
      ['pointerleave', 'blur'].forEach(ev => cell.addEventListener(ev, () => deactivate(cell)));
      cell.addEventListener('click', () => openHolo(i));
      cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHolo(i); } });
      hcGrid.appendChild(cell);
      cells.push(cell);
    });

    // Photos not covered by photos-data.js get embedded in the background (works over http://)
    F.forEach((f, i) => { ensureArt(i); });

    document.getElementById('directory').classList.add('js-holo');
  })();

  function apply() {
    let n = 0;
    cards.forEach((c, i) => {
      const f = F[i];
      const ok = (prog === 'all' || f.prog === prog) && (lvl === 'all' || f.lvl === lvl) && (!term || (f.name + ' ' + f.deg.join(' ')).toLowerCase().includes(term));
      c.classList.toggle('hide', !ok); if (ok) n++;
      if (cells[i]) { cells[i].hidden = !ok; if (!ok) deactivateNow(cells[i]); }
    });
    count.innerHTML = `Showing <b>${n}</b> of ${F.length} faculty members`;
    empty.classList.toggle('show', n === 0);
  }
  q.addEventListener('input', () => { term = q.value.trim().toLowerCase(); apply(); });
  document.querySelectorAll('[data-prog-btn]').forEach(b => b.addEventListener('click', () => {
    prog = b.dataset.progBtn; document.querySelectorAll('[data-prog-btn]').forEach(x => x.classList.toggle('on', x === b)); apply();
  }));
  document.querySelectorAll('[data-lvl-btn]').forEach(b => b.addEventListener('click', () => {
    lvl = b.dataset.lvlBtn; document.querySelectorAll('[data-lvl-btn]').forEach(x => x.classList.toggle('on', x === b)); apply();
  }));
  apply();

  grid.addEventListener('click', e => {
    const c = e.target.closest('.fac'); if (!c) return;
    const f = F[+c.dataset.i];
    box.innerHTML = `
      <div class="modal-top"><button class="modal-x" aria-label="Close">✕</button>
        <div class="av-lg">${avatarHtml(f)}</div>
        <div><h3>${f.name}</h3><small>Faculty, ${f.prof}</small></div></div>
      <div class="modal-body">
        <h4>Educational background</h4>
        <ul>${f.deg.map(d => `<li>${d}</li>`).join('')}</ul>
        ${f.li ? `<a class="btn btn-blue" href="${f.li}" target="_blank" rel="noopener">View LinkedIn →</a>` : ''}
      </div>`;
    updateAvatars(box);
    modal.classList.add('show'); box.querySelector('.modal-x').focus();
  });
  const close = () => modal.classList.remove('show');
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (window.observeReveal) observeReveal(grid);
})();