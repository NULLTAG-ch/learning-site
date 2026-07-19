# learn.nulltag.ch – NULLTAG Piano Trainer

Interaktiver Piano-Trainer als statische Single-File-Webapp.

## Features
- Alle NULLTAG-Songs eingebettet (Easy- und Voll-Fassung, Lernschritte in 4-Takt-Bloecken)
- Basis-Grundkurs mit 5 interaktiven Uebungen
- Drei Modi: Anhoeren, Warten (Taste schaltet weiter), Kontrolle (Trefferquote)
- Web-MIDI: erkennt MIDI-Keyboards (z.B. Novation FLkey 49) automatisch
- Beliebige MIDI-Dateien ladbar: Drum-Filter, Handtrennung und Easy-Fassung werden client-seitig erzeugt

## Deployment
Statisches Hosting genuegt (eine Datei, kein Backend). HTTPS ist Pflicht,
sonst blockiert der Browser Web-MIDI. Web-MIDI funktioniert in Chrome und Edge.

## Entwicklung
Alles liegt in `index.html` (HTML + CSS + JS, keine Dependencies).
