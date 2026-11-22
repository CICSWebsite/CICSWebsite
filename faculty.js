/* Faculty directory: search, filters, and profile modal */
(() => {
  const LI = 'https://www.linkedin.com/in/';
  const F = [
    // Computer Science
    ['Barrameda, Rolando B.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology', 'PhD in Computer Science']],
    ['Eduardo, Josephine T.', 'CS', ['Bachelor of Science in Computer Science', 'Master of Science in Computer Science']],
    ['Erquita, Marnelli B.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology']],
    ['Herradura, Tita R.', 'CS', ['Bachelor of Science in Computer Engineering', 'Master of Computer Science, De La Salle University-Manila']],
    ['Kamantigue, Sheryl D.', 'CS', ['Bachelor of Science in Computer Science', 'Master in Information Technology']],
    ['Manaois, Jennylinde R.', 'CS', ['Bachelor of Science in Computer Science, De La Salle University-Dasmariñas', 'Master in Information Technology, Adamson University']],
    ['Bancud, Jan Daenell', 'CS', ['Bachelor of Science in Computer Science']],
    ['Cabalsa, Elsie G.', 'CS', ['Bachelor of Science in Computer Science']],
    ['Colocado, Erika Kyle D.', 'CS', ['Bachelor of Science in Computer Science']],
    ['De Ocampo, Gerson T.', 'CS', ['Bachelor of Science in Computer Science']],
    ['Lodronio, Ranielle', 'CS', ['Bachelor of Science in Computer Science']],
    ['Ong, Allen Joseph O.', 'CS', ['Bachelor of Science in Computer Science']],
    ['Rollan, Joynalyn P.', 'CS', ['Bachelor of Science in Computer Science']],
    ['Zapanta, Orlando A.', 'CS', ['Bachelor of Science in Computer Science']],
    // Information Technology
    ['Del Rosario, Maria Gloria A.', 'IT', ['Bachelor of Science in Secretarial Administration Major in Computer Education', 'Masters in Information Technology'], 'maria-gloria-del-rosario-9528b3106/'],
    ['Doctor, Juanito C.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'juanito-doctor-695757360/'],
    ['Gatpandan, Paulino H., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Master in Business Administration', 'Master of Science in Computer Science', 'Doctor in Information Technology'], 'paulino-gatpandan-9b6a17259/'],
    ['Mayuga, Emelyn D.', 'IT', ['Bachelor of Science in Secretarial Administration Major in Computer Education', 'Master of Arts in Education Major in Computer Aided Information'], 'emelyn-mayuga-aa7ab466/'],
    ['Mitschek, Marivic R.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'marivic-mitschek-996643a7/', 'photos/faculty/mitschek.png'],
    ['Mojica, Azenith R.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'azenith-mojica-130bb4147/'],
    ['Naz, Sherry B.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'sherry-naz-47140b208/'],
    ['Pamintuan, Evangeline G.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'evangeline-pamintuan-861ba258/'],
    ['Rosas, Maryli F., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology', 'Doctor in Information Technology'], 'maryli-rosas-33b467123/'],
    ['Sanares, Roda N., DIT', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology', 'Doctor in Information Technology']],
    ['Sermaña, Rochelle D.', 'IT', ['Bachelor of Science in Computer Science', 'Master of Information Technology'], 'sermana-rochelle-3b60593b0/'],
    ['Baculod, Joneil M.', 'IT', ['Bachelor of Science in Information Technology'], 'joneil-baculod-b52399276/'],
    ['Balleras, Randolph M.', 'IT', ['Bachelor of Science in Information Technology', 'Bachelor of Science in Civil Engineering', 'Master of Information Technology'], 'randolph-balleras-27251ba/'],
    ['Galingana, Cesar D.', 'IT', ['Bachelor of Science in Computer Science', 'Diploma in Information Communication Technology (Level 7)'], 'cesar-galingana-042857171/'],
    ['Galo, Michael C.', 'IT', ['Bachelor of Science in Information Technology'], 'michael-galo-350a9558/'],
    ['Galve, Arnold B.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'arnold-galve-184b71143/'],
    ['Lina, Maria Patricia B.', 'IT', ['Bachelor of Science in Computer Science']]
  ].map(([name, prog, deg, li, photo]) => {
    const all = deg.join(' ').toLowerCase();
    const lvl = /doctor|phd/.test(all) ? 'Doctorate' : /master/.test(all) ? "Master's" : "Bachelor's";
    const clean = name.replace(/, DIT$/, '');
    const [last, first] = clean.split(', ');
    return { name, prog, deg, lvl, li: li ? LI + li : null, photo: photo || null, ini: (first[0] + last[0]).toUpperCase(), prof: prog === 'CS' ? 'Computer Science' : 'Information Technology' };
  });

  const grid = document.querySelector('.fac-grid'), q = document.getElementById('q'), count = document.getElementById('facCount'), empty = document.querySelector('.empty');
  const modal = document.getElementById('modal'), box = modal.querySelector('.modal-box');
  let prog = 'all', lvl = 'all', term = '';

  grid.innerHTML = F.map((f, i) => `
    <button class="fac" data-i="${i}" data-prog="${f.prog}" data-lvl="${f.lvl}" aria-label="View ${f.name}">
      <div class="pic"><div class="av-lg">${f.photo ? `<img src="${f.photo}" alt="${f.name}">` : f.ini}</div></div>
      <div class="info">
        <h3>${f.name}</h3>
        <div class="pos">Faculty, ${f.prof}</div>
        <span class="field">${f.prog === 'CS' ? 'Comp. Science' : 'Info. Tech'}</span><span class="field lvl">${f.lvl}</span>
        <p>${f.deg[f.deg.length - 1]}</p>
        <span class="view">View profile →</span>
      </div>
    </button>`).join('');
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
    const cardArt = f => {
      const name = disp(f);
      const c = f.prog === 'IT' ? ['#12b86a', '#06361f'] : ['#0c8a4c', '#04170f'];
      const size = Math.max(24, Math.min(42, Math.floor(520 / (name.length * 0.56))));
      const font = 'font-family="Arial, Helvetica, sans-serif"';
      const top = f.deg[f.deg.length - 1];
      const lines = wrapText(top, 38, 2).map((t, i) =>
        '<text x="86" y="' + (748 + i * 28) + '" ' + font + ' font-size="19" fill="#ffffff" fill-opacity=".88">' + esc(t) + '</text>').join('');
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="630" height="880" viewBox="0 0 630 880">' +
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
        '<linearGradient id="art" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7a4d"/><stop offset="1" stop-color="#06361f"/></linearGradient></defs>' +
        '<rect width="630" height="880" fill="#d4dae0"/>' +
        '<rect x="26" y="26" width="578" height="828" rx="14" fill="url(#bg)"/>' +
        '<text x="315" y="100" text-anchor="middle" ' + font + ' font-size="' + size + '" font-weight="700" fill="#ffffff">' + esc(name) + '</text>' +
        '<text x="315" y="138" text-anchor="middle" ' + font + ' font-size="20" font-weight="700" letter-spacing="4" fill="#ffc233">' + esc(f.prof.toUpperCase()) + '</text>' +
        '<rect x="56" y="168" width="518" height="400" rx="18" fill="url(#art)" stroke="#ffc233" stroke-width="3"/>' +
        '<circle cx="315" cy="318" r="86" fill="#ffffff" fill-opacity=".9"/>' +
        '<path d="M140 568c0-96 76-152 175-152s175 56 175 152z" fill="#ffffff" fill-opacity=".9"/>' +
        '<rect x="56" y="598" width="518" height="226" rx="16" fill="#000000" fill-opacity=".34"/>' +
        '<text x="86" y="640" ' + font + ' font-size="16" font-weight="700" letter-spacing="3" fill="#ffc233">HIGHEST DEGREE</text>' +
        '<text x="86" y="690" ' + font + ' font-size="32" font-weight="700" fill="#ffffff">' + esc(f.lvl) + '</text>' +
        lines +
        '<text x="86" y="806" ' + font + ' font-size="15" fill="#ffffff" fill-opacity=".6" letter-spacing="2">CICS  \u00b7  DLSU-D</text>' +
        '</svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };

    // ---- Click: large holographic card with the full educational background ----
    const holoRoot = document.getElementById('holoCard'), holoInfo = document.getElementById('holoInfo'), holoClose = document.getElementById('holoClose');
    let holo = null, lastFocus = null, closing = 0;
    const live = []; // cells that currently own a WebGL context, oldest first
    const MAX_LIVE = 4;
    const art = F.map(cardArt);
    const shine = { preset: 'gold', foilColor: '#e2e6ec', intensity: 0.48, scale: 1, edgeSparkle: 0.45, frame: 4, glare: 0.28, tiltMax: 14, hoverScale: 1.04, radius: 14, width: 320, shadow: true };

    openHolo = i => {
      const f = F[i];
      clearTimeout(closing);
      lastFocus = document.activeElement;
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
    };
    const closeHolo = () => {
      if (!holoModal.classList.contains('open')) return;
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
      cell._live = liveEl; cell._holo = null;
      ['pointerenter', 'pointerdown', 'focus'].forEach(ev => cell.addEventListener(ev, () => activate(cell, i)));
      ['pointerleave', 'blur'].forEach(ev => cell.addEventListener(ev, () => deactivate(cell)));
      cell.addEventListener('click', () => openHolo(i));
      cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHolo(i); } });
      hcGrid.appendChild(cell);
      cells.push(cell);
    });
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
        <div class="av-lg">${f.ini}</div>
        <div><h3>${f.name}</h3><small>Faculty, ${f.prof}</small></div></div>
      <div class="modal-body">
        <h4>Educational background</h4>
        <ul>${f.deg.map(d => `<li>${d}</li>`).join('')}</ul>
        ${f.li ? `<a class="btn btn-blue" href="${f.li}" target="_blank" rel="noopener">View LinkedIn →</a>` : ''}
      </div>`;
    modal.classList.add('show'); box.querySelector('.modal-x').focus();
  });
  const close = () => modal.classList.remove('show');
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (window.observeReveal) observeReveal(grid);
})();
