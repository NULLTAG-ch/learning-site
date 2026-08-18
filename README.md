# learn.nulltag.ch – NULLTAG Piano Trainer

Interaktiver Piano-Trainer als statische Single-File-Webapp, gestaltet nach dem
NULLTAG-Designsystem ([`nulltag-cd`](https://github.com/NULLTAG-ch/nulltag-cd)).

## Features
- Alle NULLTAG-Songs eingebettet (Easy- und Voll-Fassung, Lernschritte in 4-Takt-Bloecken)
- Sechs Klangfarben zur Wahl (Fluegel, Filzfluegel, Fluegel hell, E-Piano,
  Vibraphon, Orgel) - die Wahl gilt fuer Trainer, Klaviatur, Gehoertraining
  und Analyse gleichermassen und wird im Browser gemerkt
- Bibliothek mit 30 interaktiven Lektionen in drei Stufen (Einstieg / Fortgeschritten / Pro):
  Lagen, Tonleitern, Akkorde, Kadenzen, Arpeggien, Quintenzirkel, Moll-Varianten,
  Septakkorde, II-V-I, Walking Bass - alles laeuft direkt im Trainer (Warte-Modus),
  Fortschritt wird im Browser gespeichert, Lektionen verketten sich per Weiter-Link
- Drei Modi: Anhoeren, Warten (Taste schaltet weiter), Kontrolle (Trefferquote)
- Spielbar ohne Zusatzgeraet: Klaviatur anklicken/antippen oder Computertastatur
  (Reihe A–Ö ab C4, layout-unabhaengig; Leertaste = Start/Stopp)
- Web-MIDI: erkennt MIDI-Keyboards (z.B. Novation FLkey 49) automatisch
- Beliebige MIDI-Dateien ladbar: Drum-Filter, Handtrennung und Easy-Fassung werden client-seitig erzeugt
- Klaviatur passt ihren Tonumfang dem geladenen Song an – grosse, lesbare Tasten statt 88 Mini-Tasten

## Rekonstruierte Saetze
Zwei Titel (*Eisflug*, *Euphoric Night*) liegen nur als Synth-Spur vor und
waeren woertlich uebertragen kein Klavierstueck. Ihr Satz ist aus der
Harmonik, der Form und dem melodischen Material des Originals rekonstruiert;
die Songdaten fuehren dazu ein `note`-Feld, das die App als Merker
«rekonstruiert» auf der Songkarte und als Satz im Trainer zeigt. Ein Song
ohne `note` ist eine direkte Uebertragung.

## Track-Audit
`node tools/audit-tracks.js` prueft alle Songs auf Tonart, Handverteilung,
Griffweiten und Fingersatz. Die geprueften Funktionen zieht das Skript
wortwoertlich aus `index.html` - es testet also den ausgelieferten Code.
Nach jeder Aenderung an Songdaten, `makeEasy`/`makeNormal` oder der
Fingersatz-Berechnung laufen lassen.

## Deployment
GitHub Pages, Branch `main`, Root (`.nojekyll`, kein Build-Schritt). Custom Domain
`learn.nulltag.ch` via `CNAME`. HTTPS ist Pflicht, sonst blockiert der Browser
Web-MIDI. Web-MIDI funktioniert in Chrome und Edge.

## Entwicklung
Alles liegt in `index.html` (HTML + CSS + JS, keine Dependencies). Designtokens
(Void/Bone/TIEFROT, JetBrains Mono, Space Grotesk) stammen aus
`nulltag-cd/colors_and_type.css`.

## Credits
Klavierklang: [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3)
von Alexander Holm, CC BY 3.0 - 15 Samples (Tritonus-Raster) via
[tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments),
selbst gehostet unter `assets/piano/`. Die uebrigen Klangfarben sind entweder
gefilterte Varianten derselben Samples (Filzfluegel, Fluegel hell) oder
synthetisch (E-Piano, Vibraphon, Orgel) - es kommen keine weiteren Assets dazu.

Fingersatz-Hinweise werden client-seitig berechnet: Laufwerk-Passagen per
dynamischer Programmierung aus klassischen Regeln (Daumenuntersatz,
Spannweiten, keine Kreuzung ohne Daumen, Daumen meidet schwarze Tasten in
Schrittbewegung), Akkordgriffe per vollstaendiger Suche ueber alle
aufsteigenden Fingerfolgen gegen die Ruhelage der Hand. Griffe, die keine
Hand fassen kann, werden als solche gemeldet statt mit einem Fingersatz
kaschiert.
