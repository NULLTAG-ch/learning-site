# learn.nulltag.ch – Roadmap & Status

Stand: 2026-07-19 · 22 PRs gemerged · Gesamt-Audit gruen (36 Basis-Checks + 83 Feature-Checks)

## Erreicht (live auf learn.nulltag.ch)

**Kern**
- Single-File-Trainer (`index.html`): fallende Noten, 3 Modi (Anhoeren / Warten / Kontrolle),
  Web-MIDI (FLkey auto-erkannt, Auto-Connect, Selbstdiagnose in der MIDI-Pille),
  Spielen ohne MIDI per Klick/Touch/Computertastatur, Klaviatur beschneidet sich
  auf den Tonumfang des Songs
- Klang: Salamander Grand Piano (15 Samples, selbst gehostet, CC BY 3.0), Synth-Fallback
- Fingersatz-Berechnung (DP mit klassischen Regeln) in Noten + auf der Zieltaste
- Notenschrift-Ansicht: Grand Staff oben im Trainer (Toggle «Noten», persistiert),
  eigener leichter Renderer statt VexFlow (Single-File bleibt schlank), Vorzeichen
  tonartabhaengig (`spellPitch`), Hilfslinien, Playhead, RH/LH-Farben
- NULLTAG-Designsystem komplett (Tokens aus nulltag-cd, Claude-Design 1a umgesetzt)

**Lernen**
- Bibliothek: 30 Lektionen in 3 Stufen, Auto-Start, pulsierende Zieltaste,
  Abschluss-Menue (Naechste/Wiederholen), Fortschritt + naechste-Lektion-Markierung
- Songs: 8 Titel, je Easy/Normal/Pro (auto-abgeleitet), Sterne im Kontrolle-Modus,
  Cover, Lernschritte in 4-Takt-Bloecken, Fortschrittsbalken
  - Alle 8 Songs als echte Piano-Arrangements (Hand-Flags aus RH/LH-Tracks)
- Trainer-Presets (1 Klick, startet sofort): Anhoeren Original, Easy lernen,
  Lernschritt 1, Kontrolle 60%, Trainieren 50->100%
- Auto-Tempo-Trainer: saubere Runde stuft +10% bis Zieltempo, Fehler-Takt-Loop
- Tages-Session (Warm-up in Songtonart -> Auffrischer -> Lektion -> Song-Lernschritt)
  + Streak-Karte
- Spaced Repetition: Lektions-/Sterne-Abschluesse setzen Zeitstempel
  (`nulltag-review`), Intervalle 3/7/14 Tage, faellige Auffrischer (max. 2)
  landen vorn in der Tages-Session, Startseite zeigt Anzahl
- Gehoertraining im Analyse-Tab: 4 Levels (Intervalle I/II, Akkorde I/II),
  10 Fragen/Runde, Bestwerte (`nulltag-ear`), zaehlt als Uebezeit/Streak,
  Ergebnis mit «Auf der Klaviatur nachspielen» (Trainer-Drill)
- Verlaufs-Statistik auf der Startseite: 14-Tage-Balken aus `nulltag-practice`,
  heutiger Tag TIEFROT, Hover-Tooltips, aria-labels
- Aufnahme & Vergleich: eigene Performance anhoeren, Overlay ueber Original,
  Timing-Abweichung in ms, Export als .mid
- Analyse-Tab: MIDI hochladen -> Tonart (Krumhansl), Tonleiter, Stufenakkorde,
  Akkordfolge pro Takt – alles anhoerbar, mit Ueben-Drills
- MIDI-Import: Drum-Filter, Handtrennung aus RH/LH-Tracknamen, Easy/Normal-Ableitung

**Infra**
- GitHub Pages (branch-basiert, main, CNAME learn.nulltag.ch, .nojekyll)
- PWA: `manifest.json`, Icons (192/512/maskable, NULLTAG-Stil), `sw.js`
  (Navigation network-first, Assets cache-first, Demo-Videos ausgenommen) –
  App installierbar, laeuft offline inkl. Samples.
  WICHTIG: bei Asset-Aenderungen (z.B. neue Cover) die `CACHE`-Konstante in
  `sw.js` hochzaehlen, sonst liefern installierte Clients alte Assets.
- Demo-Videos: 16:9 (Startseite verlinkt) + 9:16 Social-Teaser (assets/demo/)
- Testbarkeit: Playwright-Audits (audit-final 36 Checks; Feature-Suites
  test-ear 23, test-sr 15, test-stats 12, test-pwa 17, test-staff 16 – alle gruen)

## Offen / Todos

1. ~~HTTPS-Zertifikat learn.nulltag.ch~~ ERLEDIGT 2026-07-19: Zertifikat aktiv,
   «Enforce HTTPS» ist gesetzt – http leitet auf https um, Web-MIDI laeuft ueberall.
2. ~~4 Piano-Arrangements~~ ERLEDIGT 2026-07-19: Burn the Void, Fifteen Years,
   Pilze Plaene und Panik, Paper Kings aus RH/LH-MIDIs eingebaut – alle 8 Songs
   sind jetzt echte Piano-Arrangements mit Hand-Flags. Tonart-Meta bleibt die
   Kuenstler-Angabe (Erkennung sieht bei Burn the Void die Parallele e-Moll,
   bei Paper Kings f-Moll – funktional irrelevant, da live erkannt wird).
3. **Echte Cover**: 6 von 8 erledigt 2026-07-19 (Quelle: NULLTAG-ch/music-site
   covers/, auf 480px verkleinert; sw.js-CACHE auf v2 gebumpt). Noch Platzhalter:
   - Burn the Void: Artwork existiert auf SoundCloud
     (i1.sndcdn.com/artworks-LzjXnqBvZG8Akna6-kcttKw-t500x500.jpg), CDN ist aus
     der Sandbox geblockt -> Datei hochladen oder in music-site/covers/ ablegen.
   - Pilze, Plaene und Panik: nirgends ein Release-Artwork gefunden
     (weder music-site noch nulltag-cd) -> Artwork bereitstellen.
4. **Higher Ground Meta pruefen**: Level 2 und c-Moll sind geschaetzt.

## Naechste Features (Ideen)

1. **Video-Pipeline pro Song**: Render-Skripte (scratchpad: render-video.js /
   render-teaser.js) fuer alle Songs ausrollen, z.B. als Release-Begleitmaterial.
2. **Gehoertraining ausbauen**: melodische Diktate (Tonfolge nachspielen),
   Akkordfolgen hoeren und bestimmen, Levels an Streak koppeln.
3. **Notenschrift vertiefen**: Notenhals/Balken, Pausen, Taktart-Anzeige;
   optional VexFlow als getrennt geladenes Asset, falls volle Notation gewuenscht.
4. **Statistik ausbauen**: Genauigkeit pro Song ueber Zeit, beste Streaks,
   Wochenziel mit Fortschrittsring.
5. **Lehrer-/Share-Modus**: Uebe-Stand als Link teilen (URL-Parameter, kein Backend).

## Architektur-Notizen fuer Weiterarbeit

- Alles in `index.html` (kein Build). Notenformat: `[beat, dur, pitch, hand?]`,
  hand 1=RH/0=LH; ohne Flag entscheidet `SONG.split` (isRHn()).
- Songs: `const SONGS = [...]`-Zeile (JSON, per Skript ersetzbar wie in PR #8/#11/#12).
- Lektionen: LIBRARY-Array mit Generatoren (mkLine/updown/scaleLesson), optional `split`.
- localStorage-Keys: nulltag-trainer-done, nulltag-trainer-stars,
  nulltag-trainer-last, nulltag-practice, nulltag-review, nulltag-ear, nulltag-staff.
- Tests: Playwright gegen lokalen http.server (Samples brauchen HTTP, nicht file://).
  Fuer SW-/Offline-Tests frisches Browser-Profil verwenden (Cache haengt sonst nach).
