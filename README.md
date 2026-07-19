# learn.nulltag.ch – NULLTAG Piano Trainer

Interaktiver Piano-Trainer als statische Single-File-Webapp, gestaltet nach dem
NULLTAG-Designsystem ([`nulltag-cd`](https://github.com/NULLTAG-ch/nulltag-cd)).

## Features
- Alle NULLTAG-Songs eingebettet (Easy- und Voll-Fassung, Lernschritte in 4-Takt-Bloecken)
- Basis-Grundkurs mit 5 interaktiven Uebungen
- Drei Modi: Anhoeren, Warten (Taste schaltet weiter), Kontrolle (Trefferquote)
- Spielbar ohne Zusatzgeraet: Klaviatur anklicken/antippen oder Computertastatur
  (Reihe A–Ö ab C4, layout-unabhaengig; Leertaste = Start/Stopp)
- Web-MIDI: erkennt MIDI-Keyboards (z.B. Novation FLkey 49) automatisch
- Beliebige MIDI-Dateien ladbar: Drum-Filter, Handtrennung und Easy-Fassung werden client-seitig erzeugt
- Klaviatur passt ihren Tonumfang dem geladenen Song an – grosse, lesbare Tasten statt 88 Mini-Tasten

## Deployment
GitHub Pages, Branch `main`, Root (`.nojekyll`, kein Build-Schritt). Custom Domain
`learn.nulltag.ch` via `CNAME`. HTTPS ist Pflicht, sonst blockiert der Browser
Web-MIDI. Web-MIDI funktioniert in Chrome und Edge.

## Entwicklung
Alles liegt in `index.html` (HTML + CSS + JS, keine Dependencies). Designtokens
(Void/Bone/TIEFROT, JetBrains Mono, Space Grotesk) stammen aus
`nulltag-cd/colors_and_type.css`.
