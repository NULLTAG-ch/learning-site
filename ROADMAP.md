# learn.nulltag.ch – Roadmap & Status

## Runde 2026-08-19 (3) — Eisflug aus echtem Quellmaterial

Ivan hat Klavier-MIDIs nachgeliefert - genau der Weg, der in der Notiz vom
Vortag vorgeschlagen war. Zwei Fassungen: «Eisflug (Solo Piano Version)»
(dicht, 146 BPM) und «Eisflug (Solo Piano Nocturne)» (ruhiger, 144 BPM).
Beide sind echtes Klaviermaterial: keine Gate-Artefakte, sauberes a-Moll
mit Gis-Dominante, Umfang 28-93. Sidestick-Klickspuren («drums», konstante
Tonhoehe) filtert der Import jetzt heraus; die Fortsetzungs-Spuren (Outro
in eigener Spur) werden gemerged.

- **Eisflug** ist nicht mehr rekonstruiert: die Solo Piano Version ersetzt
  meinen Satz vollstaendig (1132 Noten, 134 Takte, Level 2 -> 3, das
  `note`-Feld faellt weg). Das Cover bleibt das CT-05-Artwork.
- **Eisflug (Nocturne)** kommt als eigenes Arrangement dazu (925 Noten,
  109 Takte, Level 2, Platzhalter-Cover). 17 Songs total.
- Die Nocturne kreist stark um die Dur-Dominante E - Krumhansl tippt dann
  auf E-Dur. Das Audit kennt diesen Fall jetzt: endet der Bass auf der
  angegebenen Moll-Tonika, gilt die Angabe (dominantlastig, kein Befund).
- Beide Demos/Teaser gerendert (Eisflug neu, weil sich das Material
  aendert), DEMO_TITLES auf 17, CACHE auf v10.

Damit ist nur noch **Euphoric Night** rekonstruiert.

## Runde 2026-08-19 (2) — Burn the Void nach a-Moll, Demo-Videos

**Burn the Void transponiert**: +5 Halbtoene, von e-Moll nach a-Moll - die
Tonart, in der der Vault den Track fuehrt. Abwaerts (-7) ginge nicht, der
Bass fiele unter A0; aufwaerts passt der Umfang (29-98). Der
Tonart-Widerspruch zwischen Katalog und Lernseite ist damit aufgeloest,
das Audit bestaetigt a-Moll, und der fruehere Normal-Befund des Songs
verschwindet gleich mit (andere Schwarz/Weiss-Lage, besserer Fingersatz).

**Demo-Videos**: 16:9-Demo + 9:16-Teaser fuer die vier neuen Songs
(Ashes to Anthem, Hymn of the Void, Eisflug, Euphoric Night), gerendert wie
die bestehenden zwoelf: Trainer im Anhoeren-Modus, Canvas + Salamander-Audio
per MediaRecorder, ffmpeg-Mux (Skript: tools/render-demo.js, im Repo).
`DEMO_TITLES` fuehrt jetzt alle 16 Songs, sw.js-CACHE auf v9.

## Runde 2026-08-19 — vierte Fassung: Original

Bisher hiess die volle Fassung «Pro (Original)» - zwei Dinge unter einem Namen.
Neu sind es vier Stufen: **Easy · Normal · Pro · Original**.

- **Pro** ist neu und wird abgeleitet: das ganze Stueck, aber garantiert
  greifbar. `makePro` stellt sicher, dass kein Anschlag in einer Hand weiter
  als eine Oktave greift und keiner mehr als fuenf Finger braucht. Wo die
  Vorlage das verletzt, wird zuerst umverteilt und erst danach gebrochen: die
  unteren Toene setzen ein Sechzehntel frueher ein und klingen bis zum alten
  Ende durch - mit Pedal klingt der Akkord wie geschrieben, die Hand muss ihn
  aber nie auf einmal fassen. Gestrichen wird nichts.
- **Original** ist die Vorlage, unangetastet. Sie behaelt den Schluessel
  `full`, damit Sterne im localStorage und geteilte Links (`?v=full`) weiter
  gelten.

Die Garantie laeuft auch ueber Easy und Normal - eine Easy-Fassung, die weiter
greift als eine Hand fasst, waere ein Widerspruch in sich. Das hat prompt
einen Fehler in `makeNormal` aufgedeckt: die Fassung behaelt die obersten zwei
Stimmen der rechten Hand, und die koennen eine Dezime auseinanderliegen (Peace
Remains T6). Vorher stand das unbemerkt in einer Fassung, die als *leichter*
verkauft wird.

Damit sind die letzten offenen Audit-Befunde erledigt: in Easy, Normal und Pro
steht ueber alle 16 Songs **kein einziger Griff mehr, den eine Hand nicht
fassen kann**. Was bleibt, steht nur noch in der Original-Fassung - und dort
gehoert es hin.

Der Trainer sagt in der Original-Fassung dazu, wieviele Akkorde gebrochen
gehoeren und dass die Pro-Fassung sie schon so notiert.

## Runde 2026-08-18 (2) — Eisflug, Euphoric Night, Verlinkung von der Musikseite

**Zwei rekonstruierte Klaviersaetze** (16 Songs statt 14). Beide Quell-MIDIs sind
Synth-Spuren und als Klaviersatz nicht brauchbar:

- *Eisflug* (CT-05, a-Moll, 152 BPM): 573 Noten, davon 362 kuerzer als 1/64 -
  Gate-Artefakte eines Riser-Clusters. Uebrig bleiben 160 Anschlaege auf 522
  Schlaegen: ein Flaechenklang mit Bass-Puls, auf dem Klavier schlicht leer.
- *Euphoric Night* (c-Moll, 158 BPM): Offbeat-Bass plus Sechzehntel-Arpeggio.
  Woertlich gespielt waere das mechanisch, keine Linie mit Atem.

Rekonstruiert wurde aus dem, was am Original belegbar ist: Tonart, Tempo,
Akkordfolge Takt fuer Takt, die Formkurve aus der Notendichte und das
melodische Material. Bei *Eisflug* liegt sogar ein ausgeschriebenes Thema in
der Quelle (T115-T122: C5 E5 C5 H4 | H4 D5 H4 C5) und die Wechselnote C-H aus
T99-T111 - beides ist woertlich uebernommen. Erfunden ist die Klaviertextur,
also die Frage, wie diese Harmonik unter zwei Haende kommt. Beide Saetze
tragen deshalb in den Songdaten ein `note`-Feld, das auf der Songkarte als
Merker «rekonstruiert» und im Trainer als Satz erscheint.

Beide laufen ohne Befund durch `tools/audit-tracks.js` - in allen drei
Fassungen keine Spanne ueber eine Oktave, keine Handkreuzung, kein
unspielbarer Griff.

*Eisflug* bekommt das echte Release-Artwork aus nulltag-cd
(`cinetekk_05_eisflug.jpg`, auf 480px verkleinert), *Euphoric Night* ein
Platzhalter-Cover im Designsystem.

**Verlinkung von music.nulltag.ch** (siehe music-site-PR): die Musikseite hatte
bis dahin ueberhaupt keinen Weg hierher - weder die Konzern-Leiste des
Designsystems noch einen einzelnen Link. Neu traegt sie beides: die `.nt-bar`
wie hier, und im Tools-Abschnitt ein Feld «Am Klavier» mit Deep-Links
(`?track=…`) auf die zehn Katalog-Tracks, die eine Lernfassung haben.

## Runde 2026-08-18 — UI, Klangwahl, Track-Audit, zwei neue Songs

**Zwei neue Tracks** (14 statt 12): *Ashes to Anthem* (NULLTAG-26, c-Moll,
95 BPM, 64 Takte) und *Hymn of the Void* (c-Moll, 150 BPM, 106 Takte), beide
aus einspurigen Klavier-MIDIs importiert: 1/16-Quantisierung (Medianabweichung
9 bzw. 19 Ticks bei 480 PPQ), kostenbasierte Handtrennung, anschliessend ein
Spielbarkeits-Durchgang, der zu weit gegriffene Anschlaege umverteilt oder
Oktav-Dubletten streicht. Beide haben noch keine Demo-Videos - `DEMO_TITLES`
haelt fest, welche Songs im Split-View auftauchen.

**Track-Audit** (`tools/audit-tracks.js`, neu): prueft alle Songs gegen
Tonart-Metadaten und physische Griffgrenzen. Befunde dieser Runde:
- *Paper Kings* stand als b-Moll in den Metadaten, ist aber f-Moll (kein Ges
  im ganzen Stueck, G durchgehend) - korrigiert.
- *Burn the Void* stand als G-Dur im Trainer. Der Vault fuehrt den Track als
  a-Moll - G-Dur war also nie die Kuenstler-Angabe, wie frueher notiert. Die
  Klavierfassung enthaelt durchgehend Fis und schliesst auf Em, steht also in
  e-Moll (gegenueber dem Original offenbar transponiert). Auf e-Moll gesetzt;
  in der Runde 2026-08-19 (2) dann nach a-Moll transponiert - siehe oben.
- *Higher Ground* c-Moll bestaetigt (offener Punkt 4 damit erledigt); bei
  *Ashes to Anthem* zeigt die Erkennung die Parallele Es-Dur - dort gilt die
  Vault-Angabe c-Moll.
- Alle vierzehn Songs gegen `nulltag-cd/vault-export/tracks.json` abgeglichen:
  vier stimmen ueberein, fuenf haben keinen Vault-Eintrag (learn_only), drei
  fuehren im Vault keine Tonart. Tabelle in der Vault-Inbox-Notiz.
- Die Easy-Fassung faltete die Melodie hart ins Fenster 60–84 zurueck und riss
  dabei 241 Spruenge ueber eine Oktave in Linien, die im Original schrittweise
  laufen. `foldNear` waehlt jetzt die Oktavlage nach der Kontur: 0 Spruenge
  ueber eine Oktave, groesster Sprung 11 Halbtoene.
- `makeEasy` setzte keine Hand-Flags; bei *Erster Schritt* (Splitpunkt 50)
  landeten dadurch 9 Bassnoten in der rechten Hand. Flags werden jetzt gesetzt.

**Fingersatz** — gemessen ueber alle Songs und Fassungen (19'500 Toene,
3'500 Akkorde):
- Akkordgriffe: `assignChord` schaetzte Finger aus dem halben Intervall und
  lieferte 151 physisch unmoegliche Griffe (4.3%). Neu wird vollstaendig ueber
  alle aufsteigenden Fingerfolgen gesucht, bewertet gegen die Ruhelage der
  Hand -> 1 Griff (0.03%), und der ist ein echter Fall fuers Brechen.
  Lehrbuch-Gegenprobe stimmt: Dreiklaenge 1-3-5, C7 1-2-3-5, LH C-G-C 5-2-1.
- Laufwerk: ueberdehnte Fingerpaare innerhalb der Handweite werden gesperrt
  statt nur verteuert -> unspielbare Legato-Spannen von 186 auf 8 (0.05%).
  Die Tonleiter-Fingersaetze bleiben unveraendert korrekt (C-Dur, G-Dur,
  F-Dur mit 1-2-3-4).
- Nicht greifbare Akkorde werden im Trainer benannt («gebrochen spielen»)
  statt mit einem Fingersatz kaschiert.

**Klangwahl**: sechs Klangfarben (Fluegel, Filzfluegel, Fluegel hell, E-Piano,
Vibraphon, Orgel), Wahl in `nulltag-sound` gemerkt. Alle Wiedergabewege laufen
weiterhin ueber `tone()`, die Auswahl gilt also auch fuer Klaviatur,
Gehoertraining, Analyse und Aufnahme-Wiedergabe. Neu wartet der Start, bis die
Samples da sind - vorher begannen die ersten Sekunden mit dem Synth-Fallback
und kippten mitten im Stueck auf den Fluegel um.

**UI nach Designsystem**: die Trainer-Leiste ist zweigeteilt (Transport und
Stueck oben, Werkzeuge einklappbar darunter, `nulltag-tools`) statt zwanzig
gleichrangiger Knoepfe; aktive Schalter tragen den ruhigen Zustand des
Designsystems (Bone auf `--surface-2`) statt Gruen/Tuerkis - Farbe bleibt den
beiden Handfarben und der einen TIEFROT-Marke vorbehalten. Statuszeile in zwei
Zeilen (Zustand / Legende), Schrittpanel mit klebender Kopfzeile. Die vier
Platzhalter-Cover benutzten Farben ausserhalb der Palette (`#0b0b0f`,
`#7c5cff`, `#4da6ff`) - alle sechs SVG-Cover folgen jetzt der Cover-Anatomie
aus nulltag-cd. Im Querformat auf dem Handy schrumpfen Statusleiste und
Konzern-Leiste, damit die Klaviatur Hoehe bekommt.


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
3. **Echte Cover**: 7 von 8 erledigt (Quellen: NULLTAG-ch/music-site covers/ und
   DJIS releases/NULLTAG-20_burn_the_void/covers/, auf 480px verkleinert;
   sw.js-CACHE inzwischen auf v3). Einzig offener Platzhalter:
   - Pilze, Plaene und Panik: hat laut Ivan noch kein Cover (nirgends ein
     Release-Artwork: weder music-site noch nulltag-cd noch DJIS). Sobald eines
     existiert: nach assets/covers/pilze_plaene_panik.jpg (480px) + CACHE bumpen.
4. ~~Higher Ground Meta pruefen~~ ERLEDIGT 2026-08-18: c-Moll ist bestaetigt
   (Tonvorrat c-natuerlich-Moll, Bassschleife C–As–Es–B, Schlusston C).
   Level 2 bleibt eine Einschaetzung.
5. ~~Demo-Videos fuer die vier neuen Songs~~ ERLEDIGT 2026-08-19: alle 16
   Songs haben Demo (16:9, 34s) und Teaser (9:16, 17s), `DEMO_TITLES`
   entsprechend, CACHE auf v9.
   Nach dem Rendern dort eintragen und `sw.js`-CACHE hochzaehlen.
6. **Vault-Abgleich**: *Ashes to Anthem* steht im Vault mit `learn: false` -
   das stimmt seit dieser Runde nicht mehr. *Hymn of the Void* fehlt im Vault
   ganz und gehoert zu `learn_only`. Notiz liegt in
   `nulltag-cd/vault-inbox/2026-08-18_learn-tracks-und-tonart.md`.

## Naechste Features (Ideen)

Erledigt am 2026-07-20 (Video- und Theorie-Runde):
- Video-Pipeline ausgerollt: 16 Clips in assets/demo/ (8x 16:9-Demo ~35s,
  8x 9:16-Teaser ~17s, Salamander-Audio synchron; Skripte: scratchpad
  render-song.js/render-all.sh)
- Harmonielehre nach Ivans Folien: Akkordfunktionen T/S/D an allen Akkord-Chips,
  Funktionen-Karte (Schuessel-Metaphern), Funktionsfolge, Reharmonisierung per
  Funktionstausch (anhoerbar + Drill), E7-Tipp bei Moll (chordFunction/reharmonize)
- Groove-Check im Analyse-Tab: Quantisierungs-Abweichung, Betonungsprofil je
  16tel-Position vs. Groove-DNA-Gewichte, Empfehlungs-Chips, optimierter
  .mid-Export (Quantisierung + Velocity nach Gewichtung)
- Gehoertraining Level 8 'Rhythmik': Betonung hoeren und zuordnen (schwer/leicht/Offbeat)

Erledigt in der Improve-Runde vom 2026-07-20 (PR #28-#30):
- Gehoertraining v2: Melodie-Diktate (3/5 Toene) + Kadenzen-Level (7 Levels total)
- Wochenziel (30/60/120 Min., nulltag-goal) + beste Serie auf der Verlaufs-Karte
- Teilen-Links: ?song=…&v=…&m=…&t=a-b und ?lesson=id, «Link kopieren» im Trainer

Offen:
1. **Video-Pipeline pro Song**: Render-Skripte (scratchpad: render-video.js /
   render-teaser.js) fuer alle Songs ausrollen, z.B. als Release-Begleitmaterial.
2. **Notenschrift vertiefen**: Notenhals/Balken, Pausen, Taktart-Anzeige;
   optional VexFlow als getrennt geladenes Asset, falls volle Notation gewuenscht.
3. **Statistik vertiefen**: Genauigkeit pro Song ueber Zeit (braucht Log der
   Kontrolle-Runden in localStorage).
4. **Gehoertraining**: Levels an Streak/Tages-Session koppeln (z.B. 1 Runde als
   Session-Baustein).
5. **NACHHALL-Cover-Option**: DJIS production/nachhall/ hat eigene Piano-EP-Cover
   fuer 7 Songs – auf Wunsch statt der Single-Artworks zeigen.

## Architektur-Notizen fuer Weiterarbeit

- Alles in `index.html` (kein Build). Notenformat: `[beat, dur, pitch, hand?]`,
  hand 1=RH/0=LH; ohne Flag entscheidet `SONG.split` (isRHn()).
- Songs: `const SONGS = [...]`-Zeile (JSON, per Skript ersetzbar wie in PR #8/#11/#12).
- Lektionen: LIBRARY-Array mit Generatoren (mkLine/updown/scaleLesson), optional `split`.
- localStorage-Keys: nulltag-trainer-done, nulltag-trainer-stars,
  nulltag-trainer-last, nulltag-practice, nulltag-review, nulltag-ear, nulltag-staff.
- Tests: Playwright gegen lokalen http.server (Samples brauchen HTTP, nicht file://).
  Fuer SW-/Offline-Tests frisches Browser-Profil verwenden (Cache haengt sonst nach).
