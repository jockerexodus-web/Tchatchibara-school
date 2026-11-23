require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "db.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

// ---------- BRANDING ----------
const APP_NAME     = process.env.APP_NAME     || "Loom Gabon";
const APP_COMPANY  = process.env.APP_COMPANY  || "Tchatchibara Tech";
const APP_COPYRIGHT= process.env.APP_COPYRIGHT|| "© 2026/2027 Tchatchibara Tech";

const openai = process.env.OPENAI_API_KEY?.startsWith("sk-")
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ---------- INIT ----------
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{"products":[]}');

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const writeDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// ---------- UPLOAD ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, Date.now() + "-" + crypto.randomBytes(4).toString("hex") + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

// ---------- HELPERS ----------
const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const shell = (title, body) => `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(title)} · ${APP_NAME} by ${APP_COMPANY}</title>
<meta name="author" content="${APP_COMPANY}">
<meta name="copyright" content="${APP_COPYRIGHT}">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#f9fafb;color:#111;
       padding-bottom:80px;min-height:100vh;display:flex;flex-direction:column}
  nav{background:#fff;border-bottom:1px solid #e5e7eb;padding:14px 24px;
      display:flex;justify-content:space-between;align-items:center}
  nav a{color:#111;text-decoration:none;font-weight:700}
  nav .links a{margin-left:16px;font-weight:500;font-size:14px}
  main{max-width:760px;margin:0 auto;padding:32px 20px;flex:1;width:100%}
  h1{font-size:32px;margin-bottom:12px;line-height:1.2}
  h1.big{font-size:44px}
  p.lead{color:#4b5563;font-size:17px;margin-bottom:24px;line-height:1.5}
  .btn{display:inline-block;padding:14px 24px;border-radius:10px;font-weight:700;
       text-decoration:none;border:none;cursor:pointer;font-size:16px}
  .btn-green{background:#16a34a;color:#fff}.btn-green:hover{background:#15803d}
  .btn-red{background:#dc2626;color:#fff}.btn-red:hover{background:#b91c1c}
  .btn-dark{background:#1f2937;color:#fff}
  .btn-block{display:block;width:100%;text-align:center}
  .card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-top:16px}
  input{width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;
        font-size:15px;margin-bottom:12px;background:#fff}
  video{width:100%;border-radius:12px;background:#000;margin:16px 0}
  .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:40px}
  .grid .card{text-align:left}
  .grid .emoji{font-size:28px;margin-bottom:8px}
  .grid h3{font-size:16px;margin-bottom:4px}
  .grid p{font-size:13px;color:#6b7280}
  .price{font-size:26px;color:#16a34a;font-weight:800;margin:8px 0}
  .small{font-size:12px;color:#9ca3af;text-align:center;margin-top:20px}
  .alert{background:#dcfce7;border:1px solid #86efac;padding:14px;border-radius:10px;margin-top:16px}
  .alert a{color:#1d4ed8;word-break:break-all}
  footer{background:#111;color:#9ca3af;text-align:center;padding:20px;
         font-size:13px;margin-top:40px}
  footer strong{color:#fff}
  footer .brand{color:#22c55e;font-weight:700}
  @media(max-width:640px){.grid{grid-template-columns:1fr}h1.big{font-size:32px}}
</style></head>
<body>
<nav>
  <a href="/">🎬 ${APP_NAME}</a>
  <div class="links"><a href="/record">Enregistrer</a></div>
</nav>
${body}
<footer>
  <div><strong>${APP_NAME}</strong> — Propulsé par <span class="brand">${APP_COMPANY}</span></div>
  <div style="margin-top:6px">${APP_COPYRIGHT}</div>
</footer>
</body></html>`;

// ---------- PAGES ----------
app.get("/", (_req, res) => {
  res.send(shell("Accueil", `
    <main>
      <h1 class="big">Vends ton produit en vidéo.<br><span style="color:#16a34a">Sans écrire un mot.</span></h1>
      <p class="lead">Tu sais parler, tu sais montrer. On transforme ta vidéo en page de vente pro avec bouton WhatsApp.</p>
      <a href="/record" class="btn btn-green">🎬 Enregistrer mon produit</a>
      <div class="grid">
        <div class="card"><div class="emoji">🎥</div><h3>1. Enregistre</h3><p>Écran + voix. Un bouton, c'est tout.</p></div>
        <div class="card"><div class="emoji">🤖</div><h3>2. L'IA écrit</h3><p>Une description vendeuse générée auto.</p></div>
        <div class="card"><div class="emoji">💬</div><h3>3. Partage</h3><p>Un lien, un bouton WhatsApp direct.</p></div>
      </div>
      <p class="small" style="margin-top:40px">
        Une création <strong>${APP_COMPANY}</strong> · ${APP_COPYRIGHT}
      </p>
    </main>`));
});

app.get("/record", (_req, res) => {
  res.send(shell("Enregistrer", `
  <main>
    <h1>🎬 Enregistre ta vente</h1>
    <p class="lead">Montre ton produit en vidéo, on génère ta page automatiquement.</p>

    <div>
      <button id="startBtn" class="btn btn-red">🔴 Démarrer l'enregistrement</button>
      <button id="stopBtn" class="btn btn-dark" style="display:none">⏹ Arrêter</button>
    </div>

    <p style="font-size:12px;color:#6b7280;margin-top:8px">
      💡 Astuce : présente-toi, montre le produit sous tous les angles, puis donne ton prix.
    </p>

    <video id="preview" controls style="display:none"></video>

    <form id="form" class="card">
      <input id="title" placeholder="Titre (ex: Terrain 500m² à Akanda)" required>
      <input id="price" type="number" placeholder="Prix en FCFA" required>
      <input id="phone" placeholder="Numéro WhatsApp (ex: 241077000000)" required>
      <button id="saveBtn" class="btn btn-green btn-block">✨ Générer ma page de vente</button>
    </form>

    <div id="result"></div>

    <script>
      let blob = null, recorder = null, chunks = [];
      const startBtn = document.getElementById('startBtn');
      const stopBtn  = document.getElementById('stopBtn');
      const preview  = document.getElementById('preview');
      const form     = document.getElementById('form');
      const result   = document.getElementById('result');

      startBtn.onclick = async () => {
        try {
          const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          const mic    = await navigator.mediaDevices.getUserMedia({ audio: true });
          const stream = new MediaStream([
            ...screen.getVideoTracks(),
            ...mic.getAudioTracks(),
          ]);
          recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
          chunks = [];
          recorder.ondataavailable = e => chunks.push(e.data);
          recorder.onstop = () => {
            blob = new Blob(chunks, { type: 'video/webm' });
            preview.src = URL.createObjectURL(blob);
            preview.style.display = 'block';
            screen.getTracks().forEach(t => t.stop());
            mic.getTracks().forEach(t => t.stop());
          };
          recorder.start();
          startBtn.style.display = 'none';
          stopBtn.style.display = 'inline-block';
        } catch (e) { alert('Erreur : ' + e.message); }
      };

      stopBtn.onclick = () => {
        recorder.stop();
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
      };

      form.onsubmit = async (e) => {
        e.preventDefault();
        if (!blob) return alert("Enregistre la vidéo d'abord !");
        const fd = new FormData();
        fd.append('video', blob, 'product.webm');
        fd.append('title', document.getElementById('title').value);
        fd.append('price', document.getElementById('price').value);
        fd.append('phone', document.getElementById('phone').value);

        const btn = document.getElementById('saveBtn');
        btn.disabled = true; btn.textContent = 'Génération...';

        const r = await fetch('/api/generate', { method: 'POST', body: fd });
        const data = await r.json();
        btn.disabled = false; btn.textContent = '✨ Générer ma page de vente';

        if (data.slug) {
          const url = window.location.origin + '/preview/' + data.slug;
          result.innerHTML =
            '<div class="alert">✅ Ta page est prête !<br>' +
            '<a href="' + url + '" target="_blank">' + url + '</a></div>';
        } else {
          alert('Erreur : ' + (data.error || 'inconnue'));
        }
      };
    </script>
  </main>`));
});

app.get("/preview/:slug", (req, res) => {
  const db = readDB();
  const p = db.products.find(x => x.slug === req.params.slug);
  if (!p) return res.status(404).send(shell("Introuvable", "<main><h1>Page introuvable</h1></main>"));

  p.views = (p.views || 0) + 1;
  writeDB(db);

  const wa = "https://wa.me/" + p.phone + "?text=" +
    encodeURIComponent('Bonjour, je suis intéressé par "' + p.title + '" vu sur votre page.');

  res.send(shell(p.title, `
  <main>
    <video src="${p.videoUrl}" controls playsinline></video>
    <h1>${escapeHTML(p.title)}</h1>
    <div class="price">${p.price.toLocaleString("fr-FR")} FCFA</div>
    <p class="lead">${escapeHTML(p.description)}</p>
    <a href="${wa}" target="_blank" class="btn btn-green btn-block">💬 Contacter sur WhatsApp</a>
    <p class="small">👁 ${p.views} vues · ${APP_NAME} · ${APP_COMPANY}</p>
  </main>`));
});

// ---------- API ----------
app.post("/api/generate", upload.single("video"), async (req, res) => {
  try {
    const { title, price, phone } = req.body;
    if (!req.file || !title || !price || !phone) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    let description = "";
    if (openai) {
      try {
        const prompt = `Tu es un copywriter gabonais. Écris une description vendeuse et courte ` +
          `(3-4 phrases) pour ce produit : "${title}", prix ${price} FCFA. ` +
          `Ton chaleureux, direct, adapté au marché gabonais. Pas de titres, juste le paragraphe.`;
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        description = completion.choices[0].message.content?.trim() || "";
      } catch (e) {
        console.error("OpenAI error:", e.message);
      }
    }

    if (!description) {
      description =
        `${title} — disponible immédiatement au prix de ${parseInt(price).toLocaleString("fr-FR")} FCFA. ` +
        `Produit vérifié, vendeur sérieux. Contactez-nous directement sur WhatsApp ` +
        `pour plus d'informations ou pour organiser une visite.`;
    }

    const db = readDB();
    let slug = slugify(title);
    if (db.products.find(p => p.slug === slug)) {
      slug += "-" + crypto.randomBytes(2).toString("hex");
    }

    db.products.push({
      id: crypto.randomUUID(),
      slug,
      title,
      description,
      price: parseInt(price),
      videoUrl: "/uploads/" + req.file.filename,
      phone,
      views: 0,
      createdAt: new Date().toISOString(),
    });
    writeDB(db);

    res.json({ slug });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GO ----------
app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   🎬  LOOM GABON                           ║");
  console.log("║   by Tchatchibara Tech                     ║");
  console.log("║   © 2026/2027 — Tous droits réservés       ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`\n🌐 http://localhost:${PORT}`);
  console.log(openai ? "🤖 IA activée (OpenAI)\n" : "⚠️  Pas de clé OpenAI → descriptions statiques\n");
});
