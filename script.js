/* Jigsaw Bunyi – DSKP Pendidikan Muzik Tahun 1, SK 3.1.1 (3 aras, 8 gambar setiap aras) */
const BG = {Haiwan: '#ffd88a', Manusia: '#ffc2dd', Kenderaan: '#b8dcff'};
const I = (e, n, s, c) => ({e, n, s, c, bg: BG[c]});
const IT = {
  kucing: I('🐱', 'Kucing', 'Meow meow', 'Haiwan'), anjing: I('🐶', 'Anjing', 'Hong hong', 'Haiwan'),
  lembu: I('🐮', 'Lembu', 'Moooo', 'Haiwan'), ayam: I('🐔', 'Ayam', 'Kok kok kok', 'Haiwan'),
  katak: I('🐸', 'Katak', 'Kuak kuak', 'Haiwan'), kambing: I('🐑', 'Kambing', 'Mbeeek', 'Haiwan'),
  gajah: I('🐘', 'Gajah', 'Toooot', 'Haiwan'), singa: I('🦁', 'Singa', 'Grrraum', 'Haiwan'),
  kuda: I('🐴', 'Kuda', 'Hihihi', 'Haiwan'), burung: I('🐦', 'Burung', 'Cip cip cip', 'Haiwan'),
  ketawa: I('😄', 'Ketawa', 'Ha ha ha', 'Manusia'), tepuk: I('👏', 'Tepuk tangan', 'Prok prok prok', 'Manusia'),
  menangis: I('😭', 'Menangis', 'Huu huu huu', 'Manusia'), bersin: I('🤧', 'Bersin', 'Atchoo', 'Manusia'),
  dengkur: I('😴', 'Berdengkur', 'Grrr zzz', 'Manusia'), menguap: I('🥱', 'Menguap', 'Haaa aam', 'Manusia'),
  kereta: I('🚗', 'Kereta', 'Pin pin', 'Kenderaan'), ambulans: I('🚑', 'Ambulans', 'Nino nino', 'Kenderaan'),
  motosikal: I('🏍️', 'Motosikal', 'Vroom vroom', 'Kenderaan'), keretapi: I('🚂', 'Kereta api', 'Tut tut', 'Kenderaan'),
  bomba: I('🚒', 'Bomba', 'Wiu wiu wiu', 'Kenderaan'), kapal: I('✈️', 'Kapal terbang', 'Wuuusshh', 'Kenderaan'),
  bas: I('🚌', 'Bas', 'Beep beep', 'Kenderaan'), basikal: I('🚲', 'Basikal', 'Kring kring', 'Kenderaan')
};
const ALL = Object.values(IT);
const LV = [
  {name: 'Aras 1', ic: '🌱', pieces: 4, cols: 2, rows: 2, ghost: .4, items: ['kucing', 'anjing', 'lembu', 'ayam', 'ketawa', 'tepuk', 'kereta', 'ambulans']},
  {name: 'Aras 2', ic: '🌟', pieces: 6, cols: 3, rows: 2, ghost: .15, items: ['katak', 'kambing', 'gajah', 'singa', 'menangis', 'bersin', 'motosikal', 'keretapi']},
  {name: 'Aras 3', ic: '🚀', pieces: 9, cols: 3, rows: 3, ghost: 0, items: ['kuda', 'burung', 'dengkur', 'menguap', 'bomba', 'kapal', 'bas', 'basikal']}
];
const $ = id => document.getElementById(id);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let lv = 0, S = {pts: 0, mis: 0}, run = 0;
const done = [new Set(), new Set(), new Set()];

/* ---------- Bunyi & kesan ---------- */
let actx;
function beep(ok) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [523, 659, 784, 1047] : [300, 250]).forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.15, actx.currentTime + i * .11); g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + i * .11 + .2);
      o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + i * .11); o.stop(actx.currentTime + i * .11 + .22);
    });
  } catch (e) {}
}
function speak(t) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return setTimeout(res, 900);
    const u = new SpeechSynthesisUtterance(t); u.lang = 'ms-MY'; u.rate = .75; u.pitch = 1.3;
    let d = false; const f = () => { if (!d) { d = true; res(); } };
    u.onend = f; u.onerror = f; setTimeout(f, 3000); speechSynthesis.speak(u);
  });
}
function confetti(n = 24) {
  const em = ['🎉', '⭐', '🎈', '🌟', '🎵', '💖'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'confetti'; s.textContent = em[i % 6];
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * .6 + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 3300);
  }
}
const flash = (el, c) => { el.classList.remove('ok', 'no'); void el.offsetWidth; el.classList.add(c); };

/* ---------- Soalan selepas siap ---------- */
function ask(it, cb) {
  const id = run, o = shuffle(ALL.filter(x => x !== it && x.c !== it.c))[0], kind = Math.random() < .5 ? 0 : 1;
  let wrong = 0, fin = false; const opts = shuffle([it, o]), box = $('qBox');
  box.innerHTML = `<span class="tag">❓ Soalan</span>` + (kind === 0
    ? `<p class="q">Bunyi apa ini?</p><div class="qe">${it.e}</div>`
    : `<p class="q">Siapa buat bunyi ini?</p><div class="say">${it.s}</div><button class="spk" aria-label="Dengar">🔊</button>`) + `<div class="fb"></div><div class="opts"></div>`;
  const fb = box.querySelector('.fb');
  if (kind === 1) { box.querySelector('.spk').onclick = () => speak(it.s); speak(it.s); } else speak('Bunyi apa ini?');
  opts.forEach(x => {
    const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = kind === 0 ? x.s : `<span class="e">${x.e}</span>`;
    b.onclick = async () => {
      if (fin) return;
      if (x === it) { fin = true; flash(b, 'ok'); beep(true); fb.style.color = ''; fb.textContent = 'Hebat! 🎉'; await speak(it.s + '! Hebat!'); $('qModal').classList.remove('show'); id === run && cb(); }
      else { wrong++; S.mis++; flash(b, 'no'); beep(false); fb.style.color = '#e0457b'; fb.textContent = 'Cuba lagi ya! 💪';
        if (wrong >= 2) { fin = true; flash([...box.querySelectorAll('.opt')][opts.indexOf(it)], 'ok'); fb.textContent = 'Ini jawapannya!'; await speak(it.s); await sleep(600); $('qModal').classList.remove('show'); id === run && cb(); } }
    };
    box.querySelector('.opts').appendChild(b);
  });
  $('qModal').classList.add('show');
}

/* ---------- Navigasi ---------- */
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); window.scrollTo(0, 0); }
function buildLevels() {
  $('levels').innerHTML = '';
  LV.forEach((l, i) => {
    const b = document.createElement('button'); b.className = 'card l' + i;
    b.innerHTML = `<span class="ic">${l.ic}</span>${l.name}<small>${l.pieces} keping • 8 gambar</small><span class="st">${done[i].size}/8 siap</span>`;
    b.onclick = () => { lv = i; buildGallery(); show('s-gal'); beep(true); }; $('levels').appendChild(b);
  });
}
function buildGallery() {
  const l = LV[lv]; $('galTitle').textContent = `${l.ic} ${l.name} (${l.pieces} keping)`; $('galCount').textContent = `✅ ${done[lv].size}/8`;
  $('gal').innerHTML = '';
  l.items.forEach(k => {
    const it = IT[k], b = document.createElement('button'); b.className = 'thumb' + (done[lv].has(k) ? ' done' : ''); b.style.setProperty('--bg', it.bg);
    b.innerHTML = `<span class="e">${it.e}</span>${it.n}`; b.onclick = () => puzzle(k); $('gal').appendChild(b);
  });
}

/* ---------- Jigsaw ---------- */
function puzzle(key) {
  const l = LV[lv], it = IT[key], P = $('play'), st = $('stage'); run++; S = {pts: 0, mis: 0};
  window.speechSynthesis && speechSynthesis.cancel(); $('playScore').textContent = '⭐ 0'; $('playTitle').textContent = `${l.ic} ${it.n}`;
  P.style.setProperty('--cols', l.cols); P.style.setProperty('--rows', l.rows);
  const pic = i => `<div class="pic" style="--c:${i % l.cols};--r:${(i / l.cols) | 0};--bg:${it.bg}">${it.e}</div>`;
  st.innerHTML = `<p class="q">Susun jigsaw ${it.e}!</p><div class="board" style="--ghost:${l.ghost}"></div>
    <p class="hint">Seret keping ke tempatnya, atau sentuh keping lalu sentuh tempatnya</p><div class="tray"></div>`;
  const board = st.querySelector('.board'), tray = st.querySelector('.tray'); let left = l.pieces, sel = null;
  for (let i = 0; i < l.pieces; i++) { const s = document.createElement('div'); s.className = 'slot'; s.dataset.i = i; s.innerHTML = pic(i); board.appendChild(s); }
  const place = (pc, slot) => {
    if (!slot) return;
    if (slot.dataset.i === pc.dataset.i && !slot.classList.contains('filled')) {
      slot.classList.add('filled'); pc.remove(); sel = null; beep(true); S.pts++; $('playScore').textContent = '⭐ ' + S.pts;
      if (!--left) win();
    } else { S.mis++; beep(false); flash(slot, 'no'); slot.classList.remove('ok'); pc.classList.remove('no'); void pc.offsetWidth; pc.classList.add('no'); }
  };
  board.querySelectorAll('.slot').forEach(s => s.onclick = () => { if (sel) place(sel, s); });
  shuffle([...Array(l.pieces).keys()]).forEach(i => {
    const pc = document.createElement('button'); pc.className = 'piece'; pc.dataset.i = i; pc.innerHTML = pic(i);
    let g = null, sx, sy, moved;
    pc.onpointerdown = e => {
      pc.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; moved = false;
      const r = pc.getBoundingClientRect(); g = pc.cloneNode(true); g.classList.add('drag'); g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
      P.appendChild(g); mv(e); pc.style.opacity = .35;
    };
    const mv = e => { const r = g.getBoundingClientRect(); g.style.left = e.clientX - r.width / 2 + 'px'; g.style.top = e.clientY - r.height / 2 + 'px'; };
    pc.onpointermove = e => {
      if (!g) return; mv(e); if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) moved = true;
      board.querySelectorAll('.slot').forEach(s => s.classList.remove('hot')); document.elementFromPoint(e.clientX, e.clientY)?.closest('.slot')?.classList.add('hot');
    };
    pc.onpointerup = e => {
      if (!g) return; g.remove(); g = null; pc.style.opacity = 1; board.querySelectorAll('.slot').forEach(s => s.classList.remove('hot'));
      if (!moved) { tray.querySelectorAll('.piece').forEach(x => x.classList.remove('sel')); sel = pc; pc.classList.add('sel'); return; }
      place(pc, document.elementFromPoint(e.clientX, e.clientY)?.closest('.slot'));
    };
    pc.onpointercancel = () => { g && g.remove(); g = null; pc.style.opacity = 1; };
    tray.appendChild(pc);
  });
  function win() {
    board.classList.add('win'); confetti(); const id = run; speak(`${it.n}! ${it.s}`);
    setTimeout(() => { if (id !== run) return; ask(it, () => {
      done[lv].add(key);
      if (done[lv].size === 8) {
        st.innerHTML = `<div class="final"><div class="big">🏆</div><p class="q">Hebat! ${l.name} siap!</p>
          <div class="center"><button class="btn teal huge" id="nx">${lv < 2 ? '➡ Aras Seterusnya' : '🏠 Aras'}</button></div></div>`;
        confetti(40); speak('Hebat! Semua siap!'); $('nx').onclick = () => { if (lv < 2) { lv++; buildGallery(); show('s-gal'); } else { buildLevels(); show('s-level'); } };
      } else { buildGallery(); show('s-gal'); }
    }); }, 2200);
  }
  show('play');
}

/* ---------- Mula ---------- */
$('galBack').onclick = () => { buildLevels(); show('s-level'); };
$('playBack').onclick = () => { run++; window.speechSynthesis && speechSynthesis.cancel(); $('qModal').classList.remove('show'); buildGallery(); show('s-gal'); };
$('btnInfo').onclick = () => $('iModal').classList.add('show');
$('iClose').onclick = () => $('iModal').classList.remove('show');
$('iModal').onclick = e => { if (e.target.id === 'iModal') $('iModal').classList.remove('show'); };
(function bg() {
  ['🐱', '🐶', '🚗', '🎵', '👏', '🚑', '🐸', '🎶', '🚂', '🐮', '😄', '✈️'].forEach((e, k) => {
    const s = document.createElement('span'); s.textContent = e; s.style.left = (k * 8.5 + Math.random() * 4) + 'vw';
    s.style.animationDuration = 14 + Math.random() * 14 + 's'; s.style.animationDelay = -Math.random() * 20 + 's'; $('bg').appendChild(s);
  });
})();
buildLevels();
