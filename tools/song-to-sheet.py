#!/usr/bin/env python3
"""song-to-sheet.py — SONGS-Eintrag aus index.html -> MusicXML + PDF-Notenblatt.

Die Songdaten bleiben die einzige Quelle: das Skript liest den SONGS-Array
direkt aus index.html, setzt die Noten auf ein Raster (16tel und
Sechzehntel-Triolen), trennt je Hand in Stimmen, bindet ueber Taktstriche
und laesst Verovio den Satz setzen. Das PDF druckt Chromium (Playwright).

Aufruf: python3 tools/song-to-sheet.py "Listopad" [--meter 45:2/4,46:4/4]
        [--composer Fux] [--tempo Grave] [--out assets/sheets]
Abhaengigkeiten: pip install music21 verovio  (Chromium/Playwright vorhanden)
"""
import argparse, json, re, subprocess, tempfile
from fractions import Fraction as F
from pathlib import Path

import music21 as m21
import verovio

ROOT = Path(__file__).resolve().parent.parent
GRID = F(1, 12)                      # 16tel (3/12) und 16tel-Triolen (2/12)

KEYS = {  # deutsche Tonartnamen -> Vorzeichenzahl
    'C-Dur': 0, 'a-Moll': 0, 'G-Dur': 1, 'e-Moll': 1, 'D-Dur': 2, 'h-Moll': 2,
    'A-Dur': 3, 'fis-Moll': 3, 'E-Dur': 4, 'cis-Moll': 4, 'H-Dur': 5, 'gis-Moll': 5,
    'F-Dur': -1, 'd-Moll': -1, 'B-Dur': -2, 'g-Moll': -2, 'Es-Dur': -3, 'c-Moll': -3,
    'As-Dur': -4, 'f-Moll': -4, 'Des-Dur': -5, 'b-Moll': -5,
}

def q(x):
    return (F(x).limit_denominator(48) / GRID).__round__() * GRID

def load_song(title):
    html = (ROOT / 'index.html').read_text(encoding='utf8')
    m = re.search(r'const SONGS = (\[[\s\S]*?\]);\n', html)
    for s in json.loads(m.group(1)):
        if s['title'] == title:
            return s
    raise SystemExit(f'Song nicht gefunden: {title}')

def bar_grid(total, meter):
    """Liste (start, laenge) aller Takte; meter: {taktnr: Fraction-Laenge}."""
    bars, t, n, length = [], F(0), 1, F(4)
    while t < total:
        length = meter.get(n, length)
        bars.append((t, length))
        t += length; n += 1
    return bars

def events_for_hand(notes, hand):
    """Gleiche Anschlaege (Start, Dauer) zu Akkorden buendeln."""
    ev = {}
    for s, d, p, h in notes:
        if h != hand:
            continue
        s, d = q(s), max(q(d), GRID)
        ev.setdefault((s, d), []).append(p)
    return sorted(((s, d, sorted(set(ps))) for (s, d), ps in ev.items()),
                  key=lambda e: (e[0], -max(e[2])))

def assign_voices(events):
    """Liegestimmen (unter einer bewegten Oberstimme gehalten) nach unten,
    alles andere nach oben; besetzte Stimme -> naechste freie."""
    sustain = set()
    for i, (s, d, ps) in enumerate(events):
        for s2, d2, ps2 in events:
            if s < s2 < s + d and min(ps2) > max(ps):
                sustain.add(i); break
    voices = [[F(0), []]]                         # [ende, events]; 0 = Oberstimme
    for i, e in enumerate(events):
        s, d, _ = e
        cand = range(1, len(voices)) if i in sustain else range(len(voices))
        for v in cand:
            if voices[v][0] <= s:
                break
        else:
            voices.append([F(0), []]); v = len(voices) - 1
        voices[v][0] = s + d; voices[v][1].append(e)
    return [v[1] for v in voices if v[1]]

def spell(midi, flats):
    """Pitch ohne explizites Auflösungszeichen; in b-Tonarten mit b statt #."""
    p = m21.pitch.Pitch(midi)
    if p.accidental and p.accidental.name == ('sharp' if flats else 'flat'):
        p = p.getEnharmonic()
    if p.accidental and p.accidental.name == 'natural':
        p.accidental = None
    return p

def rest_values(t, end):
    """Luecke [t, end) in lesbare Pausen zerlegen, ausgerichtet am Schlag."""
    out = []
    while t < end:
        for v in (F(4), F(2), F(1), F(1, 2), F(1, 4), F(1, 6), F(1, 12)):
            if t + v <= end and (t % v == 0 or v < 1 and (t * 12) % (v * 12) == 0):
                break
        out.append((t, v)); t += v
    return out

def element(ps, dur, tie=None, flats=False):
    pit = [spell(x, flats) for x in ps]
    el = m21.note.Note(pit[0]) if len(pit) == 1 else m21.chord.Chord(pit)
    el.duration = m21.duration.Duration(dur)
    if tie:
        el.tie = m21.tie.Tie(tie)
    return el

def build_part(notes, hand, bars, ks, ts_changes, clef):
    part = m21.stream.Part()
    voices = assign_voices(events_for_hand(notes, hand))
    for bi, (b0, blen) in enumerate(bars):
        meas = m21.stream.Measure(number=bi + 1)
        if bi == 0:
            meas.insert(0, clef); meas.insert(0, m21.key.KeySignature(ks))
        if bi + 1 in ts_changes:
            meas.insert(0, m21.meter.TimeSignature(ts_changes[bi + 1]))
        used = 0
        for vi, evs in enumerate(voices):
            segs = []
            for s, d, ps in evs:
                a, e = max(s, b0), min(s + d, b0 + blen)
                if a >= e:
                    continue
                tie = None
                if s < b0 and s + d > b0 + blen: tie = 'continue'
                elif s < b0: tie = 'stop'
                elif s + d > b0 + blen: tie = 'start'
                segs.append((a - b0, e - a, ps, tie))
            if not segs and vi > 0:
                continue
            voice = m21.stream.Voice(id=str(vi + 1))
            t = F(0)
            for a, d, ps, tie in segs:
                for rt, rv in rest_values(t, a):
                    r = m21.note.Rest(quarterLength=rv)
                    if vi > 0: r.style.hideObjectOnPrint = True
                    voice.insert(rt, r)
                voice.insert(a, element(ps, d, tie, ks < 0)); t = a + d
            if t == 0 and blen == 4:              # ganzer Takt leer: Ganztaktpause
                voice.insert(0, m21.note.Rest(quarterLength=4))
            else:
                for rt, rv in rest_values(t, blen):
                    r = m21.note.Rest(quarterLength=rv)
                    if vi > 0: r.style.hideObjectOnPrint = True
                    voice.insert(rt, r)
            meas.insert(0, voice); used += 1
        part.append(meas)
    # Vorzeichen je Takt gegen die Tonart setzen (gilt bis zum Taktstrich)
    keysig = m21.key.KeySignature(ks)
    for meas in part.getElementsByClass('Measure'):
        meas.makeAccidentals(useKeySignature=keysig, inPlace=True,
                             cautionaryNotImmediateRepeat=False)
    return part

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('title')
    ap.add_argument('--meter', default='')
    ap.add_argument('--composer', default='')
    ap.add_argument('--tempo', default='')
    ap.add_argument('--out', default='assets/sheets')
    a = ap.parse_args()

    song = load_song(a.title)
    notes = song['notes']
    total = max(F(s).limit_denominator(48) + F(d).limit_denominator(48) for s, d, *_ in notes)
    ts_changes = {1: '4/4'}
    meter = {}
    for item in filter(None, a.meter.split(',')):
        n, ts = item.split(':'); ts_changes[int(n)] = ts
        num, den = map(int, ts.split('/')); meter[int(n)] = F(num * 4, den)
    bars = bar_grid(total, meter)
    ks = KEYS.get(song['key'], 0)
    split = 60
    notes = [[s, d, p, h if h is not None else int(p >= split)] for s, d, p, *rest in notes
             for h in [rest[0] if rest else None]]

    score = m21.stream.Score()
    md = m21.metadata.Metadata(); md.title = song['title']
    if a.composer: md.composer = a.composer
    score.insert(0, md)
    rh = build_part(notes, 1, bars, ks, ts_changes, m21.clef.TrebleClef())
    lh = build_part(notes, 0, bars, ks, ts_changes, m21.clef.BassClef())
    mm = m21.tempo.MetronomeMark(text=a.tempo or None, number=song['bpm'],
                                 referent=m21.note.Note(type='quarter'))
    rh.measure(1).insert(0, mm)
    score.insert(0, rh); score.insert(0, lh)
    score.insert(0, m21.layout.StaffGroup([rh, lh], symbol='brace', barTogether=True))
    for p in (rh, lh):
        p.makeBeams(inPlace=True)

    out = ROOT / a.out; out.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r'[^a-z0-9]+', '_', song['title'].lower()).strip('_')
    xml = out / f'{slug}.musicxml'
    score.write('musicxml', fp=str(xml))
    txt = xml.read_text(encoding='utf8')
    credits = ('<credit page="1"><credit-type>title</credit-type><credit-words default-x="1050" '
               'default-y="2870" justify="center" valign="top" font-size="22">' + song['title']
               + '</credit-words></credit>')
    if a.composer:
        credits += ('<credit page="1"><credit-type>composer</credit-type><credit-words default-x="2000" '
                    'default-y="2780" justify="right" valign="top" font-size="11">' + a.composer
                    + '</credit-words></credit>')
    txt = txt.replace('<part-list>', credits + '<part-list>', 1)
    xml.write_text(txt, encoding='utf8')

    tk = verovio.toolkit()
    tk.setOptions({'pageWidth': 2100, 'pageHeight': 2970, 'scale': 40,
                   'pageMarginTop': 100, 'pageMarginBottom': 100,
                   'pageMarginLeft': 100, 'pageMarginRight': 100,
                   'footer': 'none', 'breaks': 'auto', 'adjustPageHeight': False})
    tk.loadFile(str(xml))
    pages = [tk.renderToSVG(i) for i in range(1, tk.getPageCount() + 1)]
    html = ('<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:0}'
            'body{margin:0}.p{width:210mm;height:297mm;page-break-after:always;overflow:hidden}'
            '.p svg{width:100%;height:100%}</style>'
            + ''.join(f'<div class="p">{svg}</div>' for svg in pages))
    with tempfile.TemporaryDirectory() as td:
        hp = Path(td) / 'sheet.html'; hp.write_text(html, encoding='utf8')
        pdf = out / f'{slug}.pdf'
        js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
              "const p=await b.newPage();await p.goto('file://'+process.argv[1]);"
              "await p.pdf({path:process.argv[2],format:'A4',printBackground:true});await b.close();})();")
        subprocess.run(['node', '-e', js, str(hp), str(pdf)], check=True)
    print(f'{xml.relative_to(ROOT)} · {pdf.relative_to(ROOT)} · {len(pages)} Seiten · {len(bars)} Takte')

if __name__ == '__main__':
    main()
