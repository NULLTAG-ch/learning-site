#!/usr/bin/env node
// Rendert Demo-Videos im Format der bestehenden Clips: Trainer im
// Anhoeren-Modus (Original-Fassung, 100% Tempo), nur der Canvas - Titel,
// fallende Noten, Klaviatur - plus Salamander-Audio.
//
//   Demo   2560x1440 (16:9) · 24 fps · ~34 s · H.264 + AAC
//   Teaser  720x1280 (9:16) · 24 fps · ~17 s · H.264 + AAC
//
// Aufnahme in Echtzeit per MediaRecorder (Canvas-Stream + WebAudio-
// MediaStreamDestination am Master-Bus), danach ffmpeg-Transcode mit
// Video-/Audio-Fade am Ende.
//
// Voraussetzungen:
//   - lokaler Server auf dem Repo-Root:  python3 -m http.server 8899
//   - npm i playwright-core  +  ein Chromium (CHROME=Pfad)
//   - ein VOLLSTAENDIGES ffmpeg (FFMPEG=Pfad) - das Playwright-eigene kann
//     kein H.264/AAC; z.B. pip install imageio-ffmpeg
//
//   CHROME=… FFMPEG=… node tools/render-demo.js <slug> [<slug>…]
//   ohne Argumente: alle Songs aus DEMO_TITLES, deren mp4 fehlt
//
// WICHTIG: der Canvas hat keine CSS-Breite. Ohne die harte Verdrahtung
// unten treibt sein width-Attribut (2x devicePixelRatio) die Layout-Breite
// und schaukelt sich mit jedem draw() auf - die erste Fassung dieses
// Skripts nahm so 4332px auf, und der zentrierte Crop schnitt Titel und
// linke Tasten ab.

const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const BASE = process.env.BASE || 'http://localhost:8899';
const OUT = path.join(__dirname, '..', 'assets', 'demo');
const TMP = fs.mkdtempSync('/tmp/nulltag-demo-');

const FORMATS = [
  { kind: 'demo',   vw: 1280, vh: 720, dsf: 2, outW: 2560, outH: 1440, secs: 34, fadeAt: 32 },
  { kind: 'teaser', vw: 360,  vh: 640, dsf: 2, outW: 720,  outH: 1280, secs: 17, fadeAt: 15 },
];

// Slug -> Dateibasis, identisch zur COVERS-Ableitung in index.html
function fileOf(slug){ return slug.replace(/-/g, '_'); }

(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

  // Slugs aus der App holen, wenn keine angegeben sind
  let slugs = want;
  if (!slugs.length) {
    const p0 = await b.newPage();
    await p0.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
    slugs = await p0.evaluate(() => DEMO_TITLES.map(t => trackSlug(t)));
    await p0.close();
    slugs = slugs.filter(sl => !fs.existsSync(path.join(OUT, fileOf(sl) + '-demo.mp4')));
    if (!slugs.length) { console.log('nichts zu tun - alle Demos vorhanden'); await b.close(); return; }
  }

  for (const slug of slugs){
    const file = fileOf(slug);
    for (const F of FORMATS){
      const p = await b.newPage({ viewport: { width: F.vw, height: F.vh }, deviceScaleFactor: F.dsf });
      p.on('pageerror', e => console.log('  PAGEERROR', e.message));
      await p.goto(BASE + '/index.html?track=' + slug + '&v=full', { waitUntil: 'networkidle' });
      await p.addStyleTag({ content:
        '.nt-bar,nav,#tabbar,#tpresets,#tcontrols,#ttools,#tstatus,#steppanel{display:none!important}' +
        'main{overflow:hidden!important}#view-trainer{height:100vh}#tmain{display:block;height:100vh}' +
        '#cv{display:block;width:100vw!important;height:100vh!important}' });
      await p.evaluate(() => {
        updateRotGate = () => {};
        document.getElementById('rotgate').style.display = 'none';
        version = 'full'; document.getElementById('version').value = 'full';
        mode = 'listen'; document.getElementById('mode').value = 'listen';
        tempoPct = 100; document.getElementById('tempo').value = 100; updTempo();
        looping = false;
        secStart = 0; secEnd = SONG.bars;
        rebuild(); ensureAC(); draw();
      });
      await p.waitForFunction(() => pianoReady === true, null, { timeout: 30000 });
      const b64 = await p.evaluate(secs => new Promise((res, rej) => {
        const dest = ac.createMediaStreamDestination();
        master(); masterBus.connect(dest);
        const stream = cv.captureStream(24);
        for (const t of dest.stream.getAudioTracks()) stream.addTrack(t);
        const chunks = [];
        const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: 10e6 });
        rec.ondataavailable = e => chunks.push(e.data);
        rec.onstop = () => {
          const r = new FileReader();
          r.onload = () => res(r.result.split(',')[1]);
          r.onerror = rej;
          r.readAsDataURL(new Blob(chunks, { type: 'video/webm' }));
        };
        rec.start(1000);
        setPlaying(true);
        setTimeout(() => { setPlaying(false); rec.stop(); }, secs * 1000);
      }), F.secs + 0.5);
      await p.close();
      const tmp = path.join(TMP, file + '-' + F.kind + '.webm');
      fs.writeFileSync(tmp, Buffer.from(b64, 'base64'));
      const out = path.join(OUT, file + '-' + F.kind + '.mp4');
      execFileSync(FFMPEG, ['-y', '-i', tmp, '-t', String(F.secs),
        '-vf', 'scale=' + F.outW + ':' + F.outH + ':force_original_aspect_ratio=increase,crop=' + F.outW + ':' + F.outH + ',fps=24,fade=t=out:st=' + F.fadeAt + ':d=2',
        '-af', 'afade=t=out:st=' + F.fadeAt + ':d=2',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '148k', '-ar', '44100', '-movflags', '+faststart', out],
        { stdio: ['ignore', 'ignore', 'pipe'] });
      console.log(path.basename(out) + '  ' + Math.round(fs.statSync(out).size / 1024) + ' KB');
    }
  }
  await b.close();
  console.log('Nicht vergessen: neuen Song in DEMO_TITLES eintragen und sw.js-CACHE hochzaehlen.');
})();
