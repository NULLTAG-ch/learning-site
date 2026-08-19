#!/usr/bin/env node
// Prueft alle Songs in index.html auf Harmonik, Klaviertauglichkeit und
// Fingersatz. Die geprueften Funktionen werden wortwoertlich aus index.html
// gezogen - der Audit testet den ausgelieferten Code, keinen Nachbau.
//
//   node tools/audit-tracks.js            alle Songs
//   node tools/audit-tracks.js "Lovesong" nur dieser Song
//
// Bewertet wird gegen physische Grenzen (FMAX: was ein Fingerpaar fassen
// kann) und gegen die Tonart-Angabe in den Song-Metadaten.

const fs = require('fs');
const path = require('path');
const HTML = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(HTML, 'utf8');

// ---- Quelltext-Extraktion --------------------------------------------------
function block(startRe, name){
  const m = startRe.exec(src);
  if (!m) throw new Error('nicht gefunden: ' + name);
  let i = src.indexOf('{', m.index), depth = 0, j = i;
  for (; j < src.length; j++){
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) break; }
    else if (c === "'" || c === '"' || c === '`'){ const q = c; j++; while (j < src.length && src[j] !== q){ if (src[j] === '\\') j++; j++; } }
    else if (c === '/' && src[j+1] === '/'){ while (j < src.length && src[j] !== '\n') j++; }
  }
  return src.slice(m.index, j + 1);
}
function constBlock(name){
  const m = new RegExp('^const ' + name + '\\s*=', 'm').exec(src);
  if (!m) throw new Error('const nicht gefunden: ' + name);
  let depth = 0, j = m.index;
  for (; j < src.length; j++){
    const c = src[j];
    if ('{[('.includes(c)) depth++;
    else if ('}])'.includes(c)) depth--;
    else if (c === ';' && depth === 0) break;
    else if (c === "'" || c === '"' || c === '`'){ const q = c; j++; while (j < src.length && src[j] !== q){ if (src[j] === '\\') j++; j++; } }
    else if (c === '/' && src[j+1] === '/'){ while (j < src.length && src[j] !== '\n') j++; }
  }
  return src.slice(m.index, j + 1);
}
const CONSTS = ['FSPAN','FMAX','FREST','FSTIFF','FCOMBOS','KEYNAMES','PRO_SPAN','PRO_VOICES'];
const FUNCS  = ['isBlackKey','transCost','assignChord','dpRun','computeFingering',
                'isRHn','splitPoint','foldNear','makeEasy','makeNormal','makePro','detectKey','minor2label'];
const code = CONSTS.map(constBlock).join('\n')
  + '\nlet rolledChords = 0;\n'
  + FUNCS.map(n => block(new RegExp('^function ' + n + '\\s*\\(', 'm'), n)).join('\n')
  + '\nmodule.exports = { ' + CONSTS.concat(FUNCS).join(', ') + ', getRolled: () => rolledChords };\n';
const T = eval('(function(module){' + code + 'return module.exports;})')({ exports: {} });

const SONGS = JSON.parse(/const SONGS = (\[.*?\]);\n/s.exec(src)[1]);

// ---- Auswertung ------------------------------------------------------------
const only = process.argv[2];
let problems = 0;
const say = (lvl, msg) => { if (lvl === '!') problems++; console.log('  ' + (lvl === '!' ? '! ' : '  ') + msg); };

for (const song of SONGS){
  if (only && song.title !== only) continue;
  const split = T.splitPoint(song.notes);
  console.log('\n=== ' + song.title + ' · ' + song.key + ' · ' + song.bpm + ' BPM · ' + song.bars + ' Takte ===');

  // 1) Tonart: stimmt die Angabe mit dem Tonvorrat ueberein? Zwei bekannte
  // Faelle sind kein Widerspruch: die Parallele (Dur/Moll-Verwechslung) und
  // die Dominante - kreist ein Moll-Stueck stark um seine Dur-Dominante
  // (a-Moll um E), tippt Krumhansl auf die Dominante. Entscheidend ist dann
  // der Schluss: endet der Bass auf der angegebenen Tonika, gilt die Angabe.
  const det = T.detectKey(song.notes);
  if (det.label !== song.key) {
    const lastT = Math.max(...song.notes.map(n => n[0]));
    const finBass = Math.min(...song.notes.filter(n => n[0] >= lastT - 4).map(n => n[2])) % 12;
    const m = /^([A-Za-z]+)-(Dur|Moll)$/.exec(song.key) || [];
    const declRoot = T.KEYNAMES.findIndex(k => k.toLowerCase() === (m[1] || '').toLowerCase());
    const dominant = !det.minor && m[2] === 'Moll' && declRoot >= 0 &&
      det.root === (declRoot + 7) % 12 && finBass === declRoot;
    say(det.parallel === song.key || dominant ? ' ' : '!',
      'Tonart: Metadaten sagen ' + song.key + ', erkannt wird ' + det.label +
      (det.parallel === song.key ? ' (Parallele - Kuenstler-Angabe gilt)'
       : dominant ? ' (dominantlastig, Schlussbass ist die Tonika - Angabe gilt)'
       : ' - PRUEFEN'));
  } else say(' ', 'Tonart bestaetigt: ' + song.key);

  // 2) Klaviertauglichkeit je Fassung
  for (const [vn, ns] of Object.entries({
    Easy: T.makePro(T.makeEasy(song.notes, split), split),
    Normal: T.makePro(T.makeNormal(song.notes, split), split),
    Pro: T.makePro(song.notes, split), Original: song.notes })){
    const map = T.computeFingering(ns, split);
    const rolled = T.getRolled();
    let wide = 0, over5 = 0, wrongHand = 0, chords = 0, chordBad = 0, legato = 0, badSpan = 0, leaps = 0;
    for (const rh of [true, false]){
      const hand = ns.filter(n => T.isRHn(n, split) === rh).sort((a,b) => a[0]-b[0] || a[2]-b[2]);
      const evs = [];
      for (const n of hand){ const L = evs[evs.length-1];
        if (L && Math.abs(L.t - n[0]) < 0.01) L.notes.push(n); else evs.push({ t: n[0], notes: [n] }); }
      let prev = null;
      for (const ev of evs){
        const ps = ev.notes.map(n => n[2]).sort((a,b) => a-b);
        if (ps.length > 1 && ps[ps.length-1] - ps[0] > 12) wide++;
        if (ps.length > 5) over5++;
        if (ev.notes.length > 1){
          chords++;
          const srt = [...ev.notes].sort((a,b) => a[2]-b[2]), fs = srt.map(n => map.get(n));
          for (let i = 1; i < srt.length; i++){
            const a = fs[i-1], b = fs[i];
            if (a == null || b == null || a === b) continue;
            if (srt[i][2] - srt[i-1][2] > T.FMAX[Math.min(a,b) + ',' + Math.max(a,b)]) chordBad++;
          }
          prev = null; continue;
        }
        const n = ev.notes[0], f = map.get(n);
        if (prev){
          const [pn, pf] = prev, iv = Math.abs(n[2] - pn[2]);
          if (n[0] - (pn[0] + pn[1]) <= 0.26 && iv <= 12){
            legato++;
            const key = Math.min(f,pf) + ',' + Math.max(f,pf);
            if (f !== pf && T.FMAX[key] != null && iv > T.FMAX[key]) badSpan++;
          }
          if (vn === 'Easy' && iv > 12 && n[3] === 1 && pn[3] === 1) leaps++;
        }
        prev = [n, f];
      }
    }
    for (const n of ns) if (n[3] != null && T.isRHn(n, split) !== (n[3] === 1)) wrongHand++;
    // Die Original-Fassung ist die Vorlage: ein zu weiter Griff darin ist
    // kein Fehler, sondern die Stelle, die Pro gebrochen notiert. Gemeldet
    // wird er trotzdem - aber nur die Pro-Fassung muss sauber sein.
    const bad = (vn === 'Original' ? 0 : wide || over5 || chordBad) || badSpan || leaps;
    say(bad ? '!' : ' ', vn.padEnd(6) + ns.length + ' Noten · ' +
      'Spanne>Oktave ' + wide + ' · >5 Stimmen ' + over5 + ' · Akkordgriff unspielbar ' + chordBad + '/' + chords +
      ' · Legato-Spanne unspielbar ' + badSpan + '/' + legato +
      (vn === 'Easy' ? ' · Melodiespruenge>Oktave ' + leaps : '') +
      (rolled ? ' · gebrochen zu spielen ' + rolled : ''));
    if (wrongHand) say('!', vn + ': ' + wrongHand + ' Noten mit Hand-Flag gegen die Tonhoehen-Grenze');
  }
}
console.log('\n' + (problems ? problems + ' Punkt(e) mit Befund' : 'ohne Befund') + '.');
process.exit(0);
