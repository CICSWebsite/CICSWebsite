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
    ['Mitschek, Marivic R.', 'IT', ['Bachelor of Science in Computer Science', 'Masters in Information Technology'], 'marivic-mitschek-996643a7/'],
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
  ].map(([name, prog, deg, li]) => {
    const all = deg.join(' ').toLowerCase();
    const lvl = /doctor|phd/.test(all) ? 'Doctorate' : /master/.test(all) ? "Master's" : "Bachelor's";
    const clean = name.replace(/, DIT$/, '');
    const [last, first] = clean.split(', ');
    return { name, prog, deg, lvl, li: li ? LI + li : null, ini: (first[0] + last[0]).toUpperCase(), prof: prog === 'CS' ? 'Computer Science' : 'Information Technology' };
  });

  const grid = document.querySelector('.fac-grid'), q = document.getElementById('q'), count = document.getElementById('facCount'), empty = document.querySelector('.empty');
  const modal = document.getElementById('modal'), box = modal.querySelector('.modal-box');
  let prog = 'all', lvl = 'all', term = '';

  grid.innerHTML = F.map((f, i) => `
    <button class="fac" data-i="${i}" data-prog="${f.prog}" data-lvl="${f.lvl}" aria-label="View ${f.name}">
      <div class="pic"><div class="av-lg">${f.ini}</div></div>
      <div class="info">
        <h3>${f.name}</h3>
        <div class="pos">Faculty, ${f.prof}</div>
        <span class="field">${f.prog === 'CS' ? 'Comp. Science' : 'Info. Tech'}</span><span class="field lvl">${f.lvl}</span>
        <p>${f.deg[f.deg.length - 1]}</p>
        <span class="view">View profile →</span>
      </div>
    </button>`).join('');
  const cards = [...grid.children];

  function apply() {
    let n = 0;
    cards.forEach((c, i) => {
      const f = F[i];
      const ok = (prog === 'all' || f.prog === prog) && (lvl === 'all' || f.lvl === lvl) && (!term || (f.name + ' ' + f.deg.join(' ')).toLowerCase().includes(term));
      c.classList.toggle('hide', !ok); if (ok) n++;
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
        <ul>${f.deg.map(d => `<li>🎓 ${d}</li>`).join('')}</ul>
        ${f.li ? `<a class="btn btn-blue" href="${f.li}" target="_blank" rel="noopener">View LinkedIn →</a>` : ''}
      </div>`;
    modal.classList.add('show'); box.querySelector('.modal-x').focus();
  });
  const close = () => modal.classList.remove('show');
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (window.observeReveal) observeReveal(grid);
})();
