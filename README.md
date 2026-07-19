# learning.site

Piano Learning App für NULLTAG Tracks

Eine statische Single-Page-App zum Lernen von Tracks am Klavier — direkt im Browser, ohne Build-Schritt.

## Features

- **Lernmodus:** Die nächste Taste leuchtet auf; gespielt wird per Maus/Touch oder Computertastatur (Belegung wird auf den Tasten angezeigt). Richtig/Fehler-Statistik und Fortschrittsanzeige inklusive.
- **Anhören-Modus:** Autoplay des Tracks mit hervorgehobenen Tasten.
- **Tempo-Regler** (40–160 BPM) und Klaviatur über drei Oktaven (C3–B5) mit Web-Audio-Synthesizer.

## Eigene Tracks hinzufügen

Die Tracks stehen als Daten am Anfang des `<script>`-Blocks in [`index.html`](index.html) im Array `TRACKS`:

```js
{
  id: "mein-track",
  name: "NULLTAG — Mein Track",
  notes: [ ["E4", 1], ["G4", 0.5], ... ]  // [Note, Dauer in Beats]
}
```

Noten in wissenschaftlicher Notation (`C4` = mittleres C, `#` für Halbtöne).

## Deployment

Bei jedem Push auf `main` deployt der Workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) die Seite automatisch auf GitHub Pages.
