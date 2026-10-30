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
- Mikrofon: hoert dem echten Klavier zu (Tonerkennung im Browser); auf dem Handy
  ersetzt das Mikrofon das MIDI-Setup, Songs laufen dort als Vorschau
- Beliebige MIDI-Dateien ladbar: Drum-Filter, Handtrennung und Easy-Fassung werden client-seitig erzeugt
- Klaviatur passt ihren Tonumfang dem geladenen Song an – grosse, lesbare Tasten statt 88 Mini-Tasten

## Handy-Modus
Ein schmales Touch-Geraet (kurze Bildschirmseite unter 600 CSS-px, `body.phone`)
bekommt kein Web-MIDI-Setup. Die Pille oben rechts schaltet stattdessen das
Mikrofon, in den Werkzeugen steht *Eingabe: Vorschau | Mikrofon*:

- **Vorschau**: Songs oeffnen im Modus *Anhoeren* - der Trainer spielt vor,
  fallende Noten und Klaviatur laufen mit. Lektionen bleiben im Warte-Modus
  (Touch-Klaviatur).
- **Mikrofon**: die App hoert dem echten Klavier zu, Modus wechselt auf *Warten*.

Tablets und Desktop behalten MIDI und bekommen den Mikrofon-Knopf zusaetzlich.

## Mikrofon: Tonerkennung vom echten Klavier
Alles laeuft im Browser (`getUserMedia` -> `AnalyserNode`, 8192 Samples, alle 32 ms);
nichts wird aufgezeichnet oder gesendet. Zwei Wege speisen `onNote()` wie ein
MIDI-Keyboard:

1. **Einstimmig** per McLeod Pitch Method (normalisierte Autokorrelation ueber
   die letzten 2048 Samples, erstes Maximum >= 85 % des hoechsten, Parabel-
   Interpolation). Ein Ton gilt nach zwei Ticks gleicher Tonhoehe bei
   Klarheit >= 0.88; ein Neuanschlag derselben Taste braucht einen deutlichen
   Pegelsprung nach dem Ausklingen.
2. **Erwartete Toene** (Akkorde): fuer die Toene des aktuellen Warte-Schritts
   bzw. der Kontroll-Noten um den Playhead misst ein Goertzel-Filter mit
   Hann-Fenster die Energie am Grundton und einen Halbton daneben (mindestens
   1.3 Bins). Zaehlt, wenn der Grundton >= 4 % des RMS und >= 1.6x staerker als
   die Nachbarn ist und gegenueber dem Pegel vor dem Anschlag um 1.8x steigt.

Rueckkopplung: mit aktivem Mikrofon spielt der Trainer im Kontroll-Modus
nicht vor und im Warte-Modus nicht nach - der eigene Lautsprecher wuerde sonst
als Treffer zaehlen. Das Metronom bleibt. `handlePress` hakt zuerst die exakte
Taste ab und erst dann oktavtolerant, sonst blockiert A2+A3 im selben Schritt.

Grenzen: Toene ueber ~1800 Hz und unter 40 Hz werden ignoriert; bei Akkorden
ohne Erwartung (Modus Anhoeren) wird nur der dominante Ton erkannt.

## Nutzungsstatistik (Google Analytics 4)
`GA_ID` am Anfang des Skripts (Form `G-XXXXXXXXXX`). Leer = kein Banner, kein
Tracking. Mit ID zeigt die Seite einmalig ein Banner; erst nach *Einverstanden*
wird `gtag.js` geladen (Wahl in `localStorage nulltag-consent`, widerrufbar auf
der Datenschutz-Seite). Ohne Einwilligung geht keine Anfrage an Google.
Ereignisse ueber `track(name, params)`: `page_view` (Bereich), `song_open`
(Song, Fassung), `preset`, `lesson_done`, `session_start`/`session_done`,
`sheet_open`, `midi_connect`, `mic_start`. Keine Nutzer-IDs, keine Werbesignale
(Consent Mode: `ad_*` denied).

## Werkzeuge-Tab
Werkzeuge aus der NULLTAG-Produktion, eingebettet als iframe unter `tools/apps/`:

| Werkzeug | Was es tut |
|---|---|
| **Kick Designer** | Genre + Grundton -> gestimmte Kick-Samples (WAV 24 Bit / 48 kHz) + Kick-3-Node-Werte. Sechs Genres. Stimmung wird per Goertzel am gerenderten Sample **gemessen**, nicht geschaetzt; zweites Gate prueft Tail gegen den Kick-Slot des Tempos. |

Laeuft offline im Browser, laedt nichts hoch. Das iframe wird beim Verlassen des Tabs
**entladen** (`src` entfernt) - sonst liefe das Audio des Kick Designers im Hintergrund weiter.

Quelle der Dateien: DJIS-Vault `tools/design/kick_designer/`.
Bei Aenderungen dort die Kopie in `tools/apps/` nachziehen.

## Die vier Fassungen
Jeder Song laeuft in vier Stufen, alle aus derselben Vorlage abgeleitet:

| Fassung | was drin ist |
|---|---|
| **Easy** | Melodie + ein Basston pro halbem Takt |
| **Normal** | echte Register, max. zwei Stimmen rechts, ein Basston pro Schlag |
| **Pro** | das ganze Stueck, aber **garantiert greifbar** |
| **Original** | die Vorlage, unangetastet |

Die Garantie (`makePro`) heisst: kein Anschlag greift in einer Hand weiter als
eine Oktave, keiner braucht mehr als fuenf Finger. Wo die Vorlage das
verletzt, wird zuerst umverteilt (Aussenton in die freie Hand) und erst
danach gebrochen - die unteren Toene setzen ein Sechzehntel frueher ein und
klingen bis zum urspruenglichen Ende durch, so wie ein Pianist einen zu
weiten Griff arpeggiert. Gestrichen wird nichts. Sie gilt fuer Easy, Normal
und Pro; nur Original bleibt unberuehrt, weil es die Vorlage ist und keine
Lernstufe.

Der localStorage-Schluessel der Original-Fassung heisst weiterhin `full` -
so bleiben Sterne und geteilte Links von frueher gueltig.

## Schwache Takte
Jede Kontrollrunde bucht pro Takt ein Fehlerkonto (`localStorage nulltag-weak`):
ab zwei Fehlern kommt die Fehlerzahl dazu, eine fehlerfreie Runde halbiert.
Ab Kontostand 4 holt die Tages-Session den schwaechsten Takt als eigenen
Baustein - Loop ueber den Takt und seine Nachbarn, Auto-Tempo an.

## Rekonstruierte Saetze
Ein Titel (*Euphoric Night*) liegt nur als Synth-Spur vor und
waere woertlich uebertragen kein Klavierstueck. Sein Satz ist aus der
Harmonik, der Form und dem melodischen Material des Originals rekonstruiert;
die Songdaten fuehren dazu ein `note`-Feld, das die App als Merker
«rekonstruiert» auf der Songkarte und als Satz im Trainer zeigt. Ein Song
ohne `note` ist eine direkte Uebertragung.

## Notenblaetter (PDF)
`python3 tools/song-to-sheet.py all` (oder ein Titel) setzt die Original-Fassung
jedes Songs als A4-PDF plus `.mxl` (gezipptes MusicXML, oeffnet MuseScore) nach
`assets/sheets/`, Dateiname wie Cover und Demo. Im Trainer oeffnet
*Werkzeuge > Notenblatt PDF* das Blatt des geladenen Songs.

- music21 fuer Raster, Stimmen und Haltebogen, Verovio fuer den Satz, Chromium fuer das PDF
  (`pip install music21 verovio`)
- Eingespielte MIDIs werden fuer den Satz bereinigt: Starts auf 16tel, ein Ton
  endet beim naechsten Anschlag, Liegetoene unter einer bewegten Linie werden
  zweite Stimme, Luecken bis ein Achtel werden geschlossen. 8va/8vb automatisch,
  wenn eine Stimme einen ganzen Takt ueber A5 bzw. unter D2 liegt.
- Von Hand gesetzte Songs (Listopad) laufen mit `raw` woertlich; Taktwechsel
  und Triolen-Raster stehen pro Song in `SHEET` im Skript.
- Nach jeder Aenderung an den Songdaten neu laufen lassen.

## Deploy und Cache
GitHub Pages baut aus `main` (Pages-Pipeline rund 30 Sekunden, siehe Actions
«pages build and deployment»). Was danach bremst, ist der Browser: Pages liefert
alles mit `max-age=600`. Der Service Worker holt die Shell deshalb beim
Installieren frisch (`cache: 'reload'`) und fragt bei jeder Navigation per
ETag beim Server nach (`cache: 'no-cache'`); `sw.js` selbst wird mit
`updateViaCache: 'none'` registriert. Ein Deploy ist damit beim naechsten
Laden sichtbar. Weiterhin gilt: bei geaenderten Assets `CACHE` in `sw.js`
hochzaehlen.

## Track-Audit
`node tools/audit-tracks.js` prueft alle Songs auf Tonart, Handverteilung,
Griffweiten und Fingersatz. Die geprueften Funktionen zieht das Skript
wortwoertlich aus `index.html` - es testet also den ausgelieferten Code.
Nach jeder Aenderung an Songdaten, `makeEasy`/`makeNormal` oder der
Fingersatz-Berechnung laufen lassen.

## Demo-Videos
`node tools/render-demo.js` rendert fehlende Demo- (16:9, 34s) und
Teaser-Clips (9:16, 17s) direkt aus dem Trainer - Canvas plus
Salamander-Audio, Format identisch zu den bestehenden. Braucht einen lokalen
Server auf dem Repo-Root, `playwright-core` mit Chromium und ein
vollstaendiges ffmpeg (Details im Skriptkopf). Danach: neuen Song in
`DEMO_TITLES` eintragen, `sw.js`-CACHE hochzaehlen.

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
