#!/usr/bin/env node
/**
 * midi-to-song.mjs — MIDI -> SONGS-Eintrag in index.html.
 *
 * Der MIDI-Parser wird zur Laufzeit aus index.html geholt, nicht kopiert:
 * die Seite bleibt die einzige Quelle fuer das Notenformat, und ein spaeterer
 * Fix am Parser wirkt hier automatisch mit.
 *
 * Aufruf: node tools/midi-to-song.mjs <datei.mid> --title "..." [--key d-Moll]
 *         [--level 3] [--bpm 167] [--write]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf('--' + n); return i < 0 ? d : argv[i + 1]; };
const midiPath = argv.find(a => !a.startsWith('--') && /\.midi?$/i.test(a));
const WRITE = argv.includes('--write');
if (!midiPath) { console.error('Kein MIDI-Pfad angegeben.'); process.exit(1); }

const html = fs.readFileSync(INDEX, 'utf8');

/* Funktion per Klammer-Zaehlung aus der Seite schneiden — robuster als eine
   Regex, weil parseMidi selbst verschachtelte Funktionen enthaelt. */
function extract(name) {
  const start = html.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} nicht in index.html gefunden`);
  let i = html.indexOf('{', start), depth = 0;
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error(`${name}: Klammern unbalanciert`);
}

const parseMidi = eval(`(${extract('parseMidi')})`);

const buf = fs.readFileSync(midiPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const r = parseMidi(ab);
const ns = r.notes.slice().sort((a, b) => a[0] - b[0] || a[2] - b[2]);

/* Haende: Enthaelt das MIDI keine RH/LH-Tracks, wird die Trennlinie mitlaufend
   bestimmt — je Fenster die groesste Tonhoehen-Luecke nahe dem Median, danach
   zeitlich geglaettet. Ein starrer Split (die Fallback-Heuristik der Seite)
   kippt bei diesem Stueck auf 77/23 und macht die Hand-Uebephase wertlos. */
const WIN = 8;
function localSplit(t) {
  const w = ns.filter(n => n[0] >= t - WIN / 2 && n[0] <= t + WIN / 2)
              .map(n => n[2]).sort((a, b) => a - b);
  if (w.length < 4) return null;
  const med = w[Math.floor(w.length / 2)];
  let best = med, bestScore = -1;
  for (let i = 1; i < w.length; i++) {
    const gap = w[i] - w[i - 1];
    if (gap < 2) continue;
    const mid = (w[i] + w[i - 1]) / 2;
    const score = gap - Math.abs(mid - med) * 0.35;
    if (score > bestScore) { bestScore = score; best = mid; }
  }
  return best;
}

let notes;
if (ns.length && ns.every(n => n.length > 3 && n[3] !== null)) {
  notes = ns;                                    // MIDI bringt die Haende mit
  console.log('Haende: aus den MIDI-Tracks uebernommen');
} else {
  const maxT = Math.max(...ns.map(n => n[0]));
  const raw = [];
  for (let t = 0; t <= maxT; t += 4) { const v = localSplit(t); if (v !== null) raw.push([t, v]); }
  const smooth = raw.map(([t], i) => {
    const lo = Math.max(0, i - 2), hi = Math.min(raw.length - 1, i + 2);
    let s = 0, c = 0;
    for (let j = lo; j <= hi; j++) { s += raw[j][1]; c++; }
    return [t, s / c];
  });
  const splitFor = (t) => {
    let v = smooth.length ? smooth[0][1] : 60;
    for (const [tt, vv] of smooth) { if (tt <= t) v = vv; else break; }
    return v;
  };
  notes = ns.map(n => [n[0], n[1], n[2], n[2] >= splitFor(n[0]) ? 1 : 0]);
  const rh = notes.filter(n => n[3] === 1).length;
  console.log(`Haende: abgeleitet (mitlaufende Trennlinie) — RH ${rh} / LH ${notes.length - rh}`);
}

const maxEnd = Math.max(...notes.map(n => n[0] + n[1]));
const entry = {
  title: flag('title') || path.basename(midiPath, path.extname(midiPath)),
  key: flag('key', 'C-Dur'),
  level: Number(flag('level', 3)),
  bpm: Number(flag('bpm', r.bpm)),
  bars: Math.ceil(maxEnd / 4),
  notes
};
console.log(`${entry.title}: ${entry.bpm} BPM, ${entry.bars} Takte, ${notes.length} Noten, `
          + `Ambitus ${Math.min(...notes.map(n => n[2]))}-${Math.max(...notes.map(n => n[2]))}`);

if (!WRITE) { console.log('Probelauf — nichts geschrieben (--write zum Ersetzen).'); process.exit(0); }

const m = html.match(/const SONGS = (\[[\s\S]*?\]);\n/);
if (!m) throw new Error('SONGS-Array nicht gefunden');
const songs = JSON.parse(m[1]);
const idx = songs.findIndex(s => s.title === entry.title);
if (idx >= 0) { songs[idx] = entry; console.log(`ersetzt: ${entry.title} (Position ${idx + 1})`); }
else { songs.push(entry); console.log(`neu angelegt: ${entry.title}`); }
fs.writeFileSync(INDEX, html.replace(m[1], JSON.stringify(songs)));
console.log(`index.html geschrieben — ${songs.length} Songs`);
