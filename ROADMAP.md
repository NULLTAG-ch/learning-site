# learn.nulltag.ch – Roadmap & Status

Stand: 2026-07-19 · 16 PRs gemerged · Gesamt-Audit 36/36 gruen

## Erreicht (live auf learn.nulltag.ch)

**Kern**
- Single-File-Trainer (`index.html`): fallende Noten, 3 Modi (Anhoeren / Warten / Kontrolle),
  Web-MIDI (FLkey auto-erkannt, Auto-Connect, Selbstdiagnose in der MIDI-Pille),
  Spielen ohne MIDI per Klick/Touch/Computertastatur, Klaviatur beschneidet sich
  auf den Tonumfang des Songs
- Klang: Salamander Grand Piano (15 Samples, selbst gehostet, CC BY 3.0), Synth-Fallback
- Fingersatz-Berechnung (DP mit klassischen Regeln) in Noten + auf der Zieltaste
- NULLTAG-Designsystem komplett (Tokens aus nulltag-cd, Claude-Design 1a umgesetzt)

**Lernen**
- Bibliothek: 30 Lektionen in 3 Stufen, Auto-Start, pulsierende Zieltaste,
  Abschluss-Menue (Naechste/Wiederholen), Fortschritt + naechste-Lektion-Markierung
- Songs: 8 Titel, je Easy/Normal/Pro (auto-abgeleitet), Sterne im Kontrolle-Modus,
  Cover, Lernschritte in 4-Takt-Bloecken, Fortschrittsbalken
  - Echte Piano-Arrangements (Hand-Flags aus RH/LH-Tracks): Heat Death,
    Peace Remains, Lovesong, Higher Ground
- Trainer-Presets (1 Klick, startet sofort): Anhoeren Original, Easy lernen,
  Lernschritt 1, Kontrolle 60%, Trainieren 50->100%
- Auto-Tempo-Trainer: saubere Runde stuft +10% bis Zieltempo, Fehler-Takt-Loop
- Tages-Session (Warm-up in Songtonart -> Lektion -> Song-Lernschritt) + Streak-Karte
- Aufnahme & Vergleich: eigene Performance anhoeren, Overlay ueber Original,
  Timing-Abweichung in ms, Export als .mid
- Analyse-Tab: MIDI hochladen -> Tonart (Krumhansl), Tonleiter, Stufenakkorde,
  Akkordfolge pro Takt – alles anhoerbar, mit Ueben-Drills
- MIDI-Import: Drum-Filter, Handtrennung aus RH/LH-Tracknamen, Easy/Normal-Ableitung

**Infra**
- GitHub Pages (branch-basiert, main, CNAME learn.nulltag.ch, .nojekyll)
- Demo-Videos: 16:9 (Startseite verlinkt) + 9:16 Social-Teaser (assets/demo/)
- Testbarkeit: Playwright-Audits (zuletzt audit-final: 36 Checks)

## Offen / Todos

1. **HTTPS-Zertifikat learn.nulltag.ch**: Provisionierung wurde neu angestossen
   (CNAME neu gesetzt). Sobald aktiv: in Settings -> Pages «Enforce HTTPS» anhaken.
   DNS ist verifiziert korrekt (CNAME -> nulltag-ch.github.io).
2. **4 Piano-Arrangements ausstehend**: Burn the Void, Fifteen Years,
   Pilze Plaene und Panik, Paper Kings (Export mit «Piano RH»/«Piano LH»-Tracks,
   Einbau je ein Durchlauf ueber die bestehende Pipeline).
3. **Echte Cover** fuer 6 Songs (aktuell generierte Platzhalter im CINETEKK-Stil):
   Dateien nach assets/covers/ + COVERS-Map in index.html.
4. **Higher Ground Meta pruefen**: Level 2 und c-Moll sind geschaetzt.

## Naechste Features (priorisiert, recherchiert)

1. **Gehoertraining** (Ausbau Analyse-Tab): Intervalle/Akkorde hoeren und auf der
   Klaviatur nachspielen, mit Levels und Streak-Anbindung.
2. **Spaced Repetition fuer Lektionen/Songs**: Abgeschlossenes nach 3/7/14 Tagen
   als «Auffrischen»-Baustein in die Tages-Session mischen (practiceDays +
   doneSet sind vorhanden, nur Scheduling-Logik noetig).
3. **Notenschrift-Ansicht** (VexFlow, groesserer Brocken): klassische Notation
   parallel zu den fallenden Noten, umschaltbar.
4. **PWA/Offline**: Manifest + Service Worker, App installierbar, Samples gecacht.
5. **Verlaufs-Statistik**: Uebezeit/Genauigkeit ueber Zeit als Chart auf der
   Startseite (Daten in localStorage bereits vorhanden).
6. **Video-Pipeline pro Song**: Render-Skripte (scratchpad: render-video.js /
   render-teaser.js) fuer alle Songs ausrollen, z.B. als Release-Begleitmaterial.

## Architektur-Notizen fuer Weiterarbeit

- Alles in `index.html` (kein Build). Notenformat: `[beat, dur, pitch, hand?]`,
  hand 1=RH/0=LH; ohne Flag entscheidet `SONG.split` (isRHn()).
- Songs: `const SONGS = [...]`-Zeile (JSON, per Skript ersetzbar wie in PR #8/#11/#12).
- Lektionen: LIBRARY-Array mit Generatoren (mkLine/updown/scaleLesson), optional `split`.
- localStorage-Keys: nulltag-trainer-done, nulltag-trainer-stars,
  nulltag-trainer-last, nulltag-practice.
- Tests: Playwright gegen lokalen http.server (Samples brauchen HTTP, nicht file://).
