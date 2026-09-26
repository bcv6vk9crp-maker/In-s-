// Recette automatisée de bout en bout (voir docs/plan-de-test.md).
//
// Prérequis : une base Supabase locale vierge (`npx supabase db reset`), le compte admin créé,
// et le site lancé (`npm run build && npm start`). Puis :
//   E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_CRON_SECRET=… npm run test:e2e
//
// Chaque vérification porte l'identifiant du cas de test du plan.

import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ines@example.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "MotDePasse-Test-1";
const CRON_SECRET = process.env.E2E_CRON_SECRET ?? "test-cron-secret";
// Accès direct à la base locale, pour préparer certaines données.
// La clé secrète locale s'affiche avec `npx supabase status` (ligne « Secret »).
const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_SECRET = process.env.E2E_SUPABASE_SECRET;
if (!SUPABASE_SECRET) {
  console.error("E2E_SUPABASE_SECRET manquante : lancez `npx supabase status` et copiez la clé « Secret ».");
  process.exit(2);
}
const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SUPABASE_SECRET, Authorization: `Bearer ${SUPABASE_SECRET}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  }).then((r) => r.json());

let failures = 0;
function check(id, label, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${id} ${label}${!ok && detail ? ` → ${detail}` : ""}`);
  if (!ok) failures++;
}
// Attend l'hydratation de la page, puis la confirmation d'ajout.
async function addToCart(page) {
  await page.waitForLoadState("networkidle");
  await page.click("button:has-text('Ajouter au panier')");
  await page.waitForSelector("text=Ajouté au panier");
}
// Remplit les champs obligatoires de la commande (hors case de consentement).
async function fillBuyer(page, first, last, email) {
  await page.fill("#firstName", first);
  await page.fill("#lastName", last);
  await page.fill("#email", email);
  await page.fill("#phone", "06 98 76 54 32");
  await page.fill("#addressLine", "3 place de Lenche");
  await page.fill("#postalCode", "13002");
  await page.fill("#city", "Marseille");
}
// Retire la validation du navigateur pour vérifier que le serveur refuse aussi.
const stripBrowserChecks = (page) => page.evaluate(() => document.querySelectorAll("#main-order-form [required], form [required]").forEach((el) => el.removeAttribute("required")));
const euros = (s) => (s ?? "").replace(/\s/g, " ").trim();

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);

// Images de test : « portraits » 3000 × 4000 px dessinés dans un canvas
async function makeImages(page) {
  await page.goto("about:blank");
  const specs = [
    { w: 3000, h: 4000, p: ["#f2b24c", "#e27d3f", "#d9a07e", "#c2493b"] },
    { w: 3000, h: 4000, p: ["#2f8a86", "#1e5a63", "#8a5a44", "#f0d7b5"] },
    { w: 4000, h: 2667, p: ["#f3c9c0", "#d98c8f", "#e3b596", "#3d5aa8"] }, // paysage
  ];
  const files = [];
  for (const [i, spec] of specs.entries()) {
    const b64 = await page.evaluate(({ w, h, p }) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, p[0]);
      g.addColorStop(1, p[1]);
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.fillStyle = p[2];
      x.beginPath();
      x.ellipse(w / 2, h * 0.37, w * 0.17, h * 0.17, 0, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = p[3];
      x.beginPath();
      x.ellipse(w / 2, h * 0.92, w * 0.43, h * 0.33, 0, 0, Math.PI * 2);
      x.fill();
      return c.toDataURL("image/jpeg", 0.92).split(",")[1];
    }, spec);
    files.push({ name: `photo${i + 1}.jpg`, mimeType: "image/jpeg", buffer: Buffer.from(b64, "base64") });
  }
  return files;
}

const admin = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const images = await makeImages(admin);

/* ---------------- Admin : accès ---------------- */
await admin.goto(`${BASE}/admin`);
check("AD-01", "l'admin redirige vers la connexion sans session", admin.url().endsWith("/admin/connexion"));

await admin.fill("#email", ADMIN_EMAIL);
await admin.fill("#password", "mauvais-mot-de-passe");
await admin.click("button:has-text('Se connecter')");
await admin.waitForSelector(".alert");
check("AD-02", "mauvais mot de passe refusé avec un message", (await admin.textContent(".alert")).includes("incorrect"));
check("AD-02", "l'email saisi est conservé après l'erreur", (await admin.inputValue("#email")) === ADMIN_EMAIL);

await admin.fill("#password", ADMIN_PASSWORD);
await admin.click("button:has-text('Se connecter')");
await admin.waitForSelector("text=Bonjour Ines");
check("AD-03", "connexion avec le bon mot de passe", admin.url().endsWith("/admin"));

/* ---------------- Admin : formats et prix ---------------- */
await admin.goto(`${BASE}/admin/formats`);
const defaultFormats = await admin.locator("h2.section-title").allTextContents();
check("FM-01", "4 formats proposés par défaut", ["20 × 30 cm", "30 × 45 cm", "40 × 60 cm", "60 × 90 cm"].every((l) => defaultFormats.some((t) => t.includes(l))));
const newForm = admin.locator("form").last();
await newForm.locator("input[name=label]").fill("10 × 15 cm");
await newForm.locator("input[name=price]").fill("abc");
await newForm.locator("input[name=frame]").fill("4");
await newForm.locator("input[name=shipping]").fill("5");
await newForm.locator("button").click();
await admin.waitForSelector("text=Un des montants est invalide.");
check("FM-02", "un montant invalide est refusé, la saisie est conservée", (await newForm.locator("input[name=label]").inputValue()) === "10 × 15 cm");
await newForm.locator("input[name=price]").fill("20");
await newForm.locator("input[name=position]").fill("0");
await newForm.locator("button").click();
await admin.waitForSelector("h2:has-text('10 × 15 cm')");
check("FM-03", "ajout d'un 5ᵉ format (10 × 15 cm à 20 €)", true);

/* ---------------- Admin : réglages ---------------- */
await admin.goto(`${BASE}/admin/reglages`);
await admin.fill("#pickup_location", "Marseille, 6ᵉ arrondissement");
await admin.fill("#notification_email", "alertes@example.com");
await admin.fill("#contact_email", "contact@example.com");
await admin.fill("#instagram", "@ines.b.photo");
await admin.fill("#about_fr", "Je photographie les gens que je croise.");
await admin.fill("#about_en", "I photograph the people I meet.");
await admin.fill("#legal_name", "Ines B.");
await admin.fill("#siret", "");
await admin.click("text=Enregistrer les réglages");
await admin.waitForSelector("text=Réglages enregistrés.");
check("RG-01", "réglages enregistrés", true);

/* ---------------- Admin : collections ---------------- */
await admin.goto(`${BASE}/admin/collections`);
await admin.fill("#name_fr-new", "Visages d'été");
await admin.fill("#name_en-new", "Summer faces");
await admin.fill("#note_fr-new", "des gens croisés entre Marseille et la Corse");
await admin.click("text=Créer la collection");
await admin.waitForSelector("h2:has-text(\"Visages d'été\")");
check("CO-01", "collection créée et formulaire vidé", (await admin.inputValue("#name_fr-new")) === "");
await admin.fill("#name_fr-new", "Portraits");
await admin.click("text=Créer la collection");
await admin.waitForSelector("h2:has-text('Portraits')");
check("CO-01", "seconde collection créée", true);

/* ---------------- Admin : photos ---------------- */
await admin.goto(`${BASE}/admin/photos/nouvelle`);
await admin.fill("#title_fr", "Sans image");
await admin.click("text=Ajouter la photo");
await admin.waitForSelector(".alert");
check("PH-02", "une photo sans image est refusée", (await admin.textContent(".alert")).includes("image"));

const titles = [
  ["Léa, Marseille", "Lea, Marseille", ["Visages d'été", "Portraits"]],
  ["Samir au port", "Samir at the harbour", ["Visages d'été"]],
  ["Les cousines", "The cousins", []],
];
for (const [i, [fr, en, cols]] of titles.entries()) {
  await admin.goto(`${BASE}/admin/photos/nouvelle`);
  await admin.setInputFiles("#source", images[i]);
  await admin.waitForSelector(".photo-preview img");
  await admin.fill("#title_fr", fr);
  await admin.fill("#title_en", en);
  await admin.fill("#year", "2025");
  await admin.fill("#position", String(i));
  for (const c of cols) await admin.check(`label.check:has-text("${c}") input`);
  await admin.click("text=Ajouter la photo");
  await admin.waitForURL(`${BASE}/admin/photos`, { waitUntil: "commit" });
  await admin.waitForSelector(`a:has-text("${fr}")`);
}
check("PH-01", "trois photos ajoutées", (await admin.locator("table a").count()) === 3);

/* ---------------- Public : galerie et fiche ---------------- */
const buyerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const b = await buyerCtx.newPage();
await b.goto(BASE);
await b.waitForSelector(".gallery img");
check("GA-01", "la galerie affiche les 3 photos", (await b.locator(".gallery .print").count()) === 3);
const natural = await b.evaluate(() => {
  const i = document.querySelector(".gallery img");
  return Math.max(i.naturalWidth, i.naturalHeight);
});
check("PH-03", "l'image en ligne est réduite à 1600 px maximum", natural <= 1600, `${natural} px`);
const transforms = await b.evaluate(() =>
  [...document.querySelectorAll(".print-frame")].map((e) => getComputedStyle(e).transform),
);
check("GA-04", "les photos sont droites (aucune rotation)", transforms.every((t) => t === "none"), transforms.join(","));
const landscape = await b.locator(".print:has-text('Les cousines') img").boundingBox();
check("GA-06", "une photo en paysage garde sa forme réelle dans la galerie", landscape.width > landscape.height * 1.3, `${landscape.width}×${landscape.height}`);

await b.click(".chips a:has-text('Portraits')");
await b.waitForURL(/collection=portraits/, { waitUntil: "commit" });
await b.waitForSelector("h1:has-text('Portraits')");
check("GA-02", "le filtre par collection n'affiche que ses photos", (await b.locator(".gallery .print").count()) === 1);
await b.goto(`${BASE}/?collection=visages-d-ete`);
check("GA-02", "une photo peut appartenir à plusieurs collections", (await b.locator(".gallery .print").count()) === 2);
check("GA-03", "la note manuscrite de la collection s'affiche", (await b.textContent(".hand")).includes("Marseille"));

await b.goto(`${BASE}/photos/lea-marseille`);
await b.waitForSelector(".purchase");
check("FI-01", "5 formats proposés, du plus petit au plus grand", (await b.locator(".option-group").first().locator("button").allTextContents()).map((t) => t.split(" · ")[0]).join("|") === "10 × 15 cm|20 × 30 cm|30 × 45 cm|40 × 60 cm|60 × 90 cm");
check("FI-01", "format sélectionné par défaut : le premier (10 × 15 cm, 20 €)", euros(await b.textContent(".total-row")).endsWith("20 €"));
await b.click("button:has-text('20 × 30 cm')");
check("FI-02", "20 × 30 sans cadre = 35 €", euros(await b.textContent(".total-row")).endsWith("35 €"));
await b.click("button:has-text('Avec cadre')");
check("FI-02", "20 × 30 avec cadre = 41 € (+6)", euros(await b.textContent(".total-row")).endsWith("41 €"));
await b.click("button:has-text('60 × 90 cm')");
check("FI-02", "60 × 90 avec cadre = 132 € (+12)", euros(await b.textContent(".total-row")).endsWith("132 €"));
await b.click("button:has-text('40 × 60 cm')");
check("FI-02", "40 × 60 avec cadre = 80 € (+10)", euros(await b.textContent(".total-row")).endsWith("80 €"));
for (let i = 0; i < 12; i++) {
  const plus = b.locator(".qty button[aria-label='+1']");
  if (await plus.isDisabled()) break;
  await plus.click();
}
check("FI-03", "la quantité est plafonnée à 10", (await b.textContent(".qty output")) === "10");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await b.click(".qty button[aria-label='−1']");
await addToCart(b);
await addToCart(b);
check("PA-01", "ajouter deux fois la même configuration additionne les quantités", (await b.textContent(".cart-count")) === "4");

await b.goto(`${BASE}/photos/samir-au-port`);
await b.waitForLoadState("networkidle");
await b.click("button:has-text('20 × 30 cm')");
await addToCart(b);
await b.goto(`${BASE}/photos/les-cousines`);
await b.waitForLoadState("networkidle");
await b.click("button:has-text('20 × 30 cm')");
await addToCart(b);

await b.goto(`${BASE}/panier`);
await b.waitForSelector(".cart-line");
check("PA-02", "le panier contient 3 lignes", (await b.locator(".cart-line").count()) === 3);
check("PA-02", "tirages = 4 × 80 + 35 + 35 = 390 €", euros(await b.textContent(".summary .total-row")).endsWith("390 €"));
check("PO-01", "le panier annonce le port du plus grand format (12 €) et la gratuité en retrait", euros(await b.textContent(".summary")).includes("12 €") && (await b.textContent(".summary")).includes("Retrait en main propre gratuit"));
await b.locator(".cart-line").nth(0).locator(".qty button[aria-label='−1']").click();
check("PA-03", "diminuer une quantité met à jour le total (310 €)", euros(await b.textContent(".summary .total-row")).endsWith("310 €"));
await b.locator(".cart-line").nth(2).locator("button:has-text('Retirer')").click();
check("PA-04", "retirer une ligne", (await b.locator(".cart-line").count()) === 2);
await b.reload();
await b.waitForSelector(".cart-line");
check("PA-05", "le panier est conservé après rechargement", (await b.locator(".cart-line").count()) === 2);

await b.click(".lang-switch button:has-text('EN')");
await b.waitForSelector("h1:has-text('Your cart')");
check("LG-01", "passage en anglais", true);
check("LG-02", "titre anglais de la photo utilisé", (await b.textContent(".cart-lines")).includes("Samir at the harbour"));
await b.goto(`${BASE}/a-propos`);
check("LG-03", "texte À propos en anglais", (await b.textContent(".prose")).includes("I photograph"));
await b.click(".lang-switch button:has-text('FR')");
await b.waitForSelector("h1:has-text('À propos')");

/* ---------------- Commande ---------------- */
await b.goto(`${BASE}/commande`);
await b.waitForSelector("#firstName");
check("RT-01", "en retrait, le lieu de retrait est affiché", (await b.textContent("form")).includes("Marseille, 6ᵉ arrondissement"));
check("PO-02", "en retrait, port gratuit : total = 275 €", (await b.textContent(".summary")).includes("Gratuit") && euros(await b.textContent(".summary .total-row")).endsWith("275 €"));
await b.fill("#firstName", "Léa");
await b.fill("#lastName", "Martin");
await b.fill("#email", "lea@example.com");
check("CM-03", "le pays est prérempli (France)", (await b.inputValue("#country")) === "France");
const sent = () => b.url().includes("/merci");
await b.fill("#phone", "+33 6 12 34 56 78");
await b.fill("#addressLine", "12 rue du Panier");
await b.fill("#postalCode", "13002");
await b.fill("#city", "Marseille");
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForTimeout(500);
check("CM-02", "sans la case d'accord, la commande n'est pas envoyée", !sent());
await b.check("#consent");
for (const [id, label] of [["#firstName", "prénom"], ["#lastName", "nom"], ["#email", "email"], ["#phone", "téléphone"], ["#addressLine", "adresse"], ["#postalCode", "code postal"], ["#city", "ville"]]) {
  const kept = await b.inputValue(id);
  await b.fill(id, "");
  await b.click("button:has-text('Envoyer ma commande')");
  await b.waitForTimeout(300);
  check("CM-11", `sans ${label}, la commande n'est pas envoyée (même en retrait)`, !sent());
  await b.fill(id, kept);
}
// Contrôle côté serveur : sans les garde-fous du navigateur, un téléphone trop court et une adresse vide sont refusés
await stripBrowserChecks(b);
await b.fill("#phone", "12345");
await b.fill("#addressLine", "");
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForSelector(".alert");
const flagged = await b.evaluate(() => [...document.querySelectorAll("[data-invalid=true] input")].map((i) => i.id).sort().join(","));
check("CM-12", "le serveur refuse un téléphone de moins de 6 chiffres et une adresse vide, champs signalés", !sent() && flagged === "addressLine,phone", flagged);
await b.fill("#phone", "+33 6 12 34 56 78");
await b.fill("#addressLine", "12 rue du Panier");
await b.click("button:has-text('Livraison à domicile')");
check("PO-03", "en livraison, port de 12 € ajouté : total = 287 €", euros(await b.textContent(".summary .total-row")).endsWith("287 €"));
await b.fill("#message", "=Cadre noir si possible");
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForURL(/\/commande\/merci\?n=IB-/, { waitUntil: "commit" });
await b.waitForSelector("text=Merci");
check("CM-01", "commande en livraison envoyée, numéro affiché", (await b.textContent("main")).includes("IB-0001"));
check("CM-09", "la page de remerciement dit « transmise à la photographe » sans promettre d'email", (await b.textContent("main")).includes("transmise à la photographe") && !(await b.textContent("main")).includes("récapitulatif"));
check("CM-06", "le panier est vidé après envoi", (await b.locator(".cart-count").count()) === 0);

// Retrait en main propre
await b.goto(`${BASE}/photos/samir-au-port`);
await b.waitForLoadState("networkidle");
await b.click("button:has-text('20 × 30 cm')");
await addToCart(b);
await b.goto(`${BASE}/commande`);
await fillBuyer(b, "Tom", "Durand", "tom@example.com");
await b.check("#consent");
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForURL(/IB-0002/, { waitUntil: "commit" });
check("CM-04", "commande en retrait acceptée (port gratuit)", true);

// Photo retirée du site pendant qu'elle est dans un panier
await b.goto(`${BASE}/photos/les-cousines`);
await addToCart(b);
await admin.goto(`${BASE}/admin/photos`);
await admin.click("a:has-text('Les cousines')");
await admin.waitForSelector("#visible");
await admin.uncheck("#visible");
await admin.click("button:has-text('Enregistrer')");
await admin.waitForURL(`${BASE}/admin/photos`, { waitUntil: "commit" });
await admin.waitForSelector("text=Masquée");
await b.goto(`${BASE}/commande`);
await fillBuyer(b, "Tom", "Durand", "tom@example.com");
await b.check("#consent");
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForSelector(".alert");
check("CM-05", "une photo masquée est retirée du panier avec un message", (await b.textContent(".alert")).includes("plus disponible"));
const r404 = await b.goto(`${BASE}/photos/les-cousines`);
check("GA-05", "une photo masquée n'est plus accessible (404)", r404.status() === 404);

// Limite anti-abus : 3 commandes par email et par quart d'heure
for (let n = 0; n < 3; n++) {
  await b.goto(`${BASE}/photos/samir-au-port`);
  await addToCart(b);
  await b.goto(`${BASE}/commande`);
  await fillBuyer(b, "Tom", "Durand", "TOM@example.com");
  await b.check("#consent");
  await b.click("button:has-text('Envoyer ma commande')");
  await b.waitForTimeout(800);
}
check("CM-07", "la 4ᵉ commande en 15 min avec le même email est bloquée", (await b.textContent(".alert")).includes("Plusieurs commandes"));

// Robot qui remplit le champ piège : faux succès, rien n'est enregistré
await b.goto(`${BASE}/photos/samir-au-port`);
await addToCart(b);
await b.goto(`${BASE}/commande`);
await fillBuyer(b, "Robot", "Spam", "robot@example.com");
await b.check("#consent");
await b.evaluate(() => { document.querySelector("input[name=website]").value = "http://spam.example"; });
await b.click("button:has-text('Envoyer ma commande')");
await b.waitForURL(/\/commande\/merci/, { waitUntil: "commit" });
const robotOrders = await rest("orders?email=eq.robot@example.com&select=id");
check("CM-10", "le champ piège anti-robot : page de merci affichée mais aucune commande créée", robotOrders.length === 0);

// Format retiré par Ines pendant qu'il est dans un panier
await b.goto(`${BASE}/photos/lea-marseille`);
await b.waitForLoadState("networkidle");
await b.click("button:has-text('10 × 15 cm')");
await addToCart(b);
await admin.goto(`${BASE}/admin/formats`);
const smallForm = admin.locator("section:has(h2:has-text('10 × 15 cm')) form");
await smallForm.locator("input[name=active]").uncheck();
await smallForm.locator("button:has-text('Enregistrer')").click();
await admin.waitForSelector("text=Format enregistré.");
await b.goto(`${BASE}/panier`);
await b.waitForSelector(".alert");
check("FM-04", "un format désactivé est retiré du panier avec un message", (await b.textContent(".alert")).includes("n'est plus proposé"));
await b.goto(`${BASE}/photos/lea-marseille`);
await b.waitForSelector(".purchase");
check("FM-05", "un format désactivé n'est plus proposé sur les fiches", !(await b.textContent(".purchase")).includes("10 × 15 cm"));

/* ---------------- Admin : suivi des commandes ---------------- */
await admin.goto(`${BASE}/admin`);
check("TB-01", "le tableau de bord compte les nouvelles commandes", (await admin.textContent(".stat b")) === "4");
check("TB-02", "les photos les plus demandées apparaissent", (await admin.textContent("main")).includes("Léa, Marseille"));

await admin.goto(`${BASE}/admin/commandes`);
await admin.click("a:has-text('IB-0001')");
await admin.waitForSelector("text=Tirages demandés");
const detail = await admin.textContent("main");
check("CD-01", "le détail montre adresse, téléphone et message", detail.includes("12 rue du Panier") && detail.includes("+33 6") && detail.includes("Cadre noir"));
check("PO-04", "le détail montre le format, le port (12 €) et le total (287 €)", detail.includes("40 × 60 cm") && euros(detail).includes("12 €") && euros(detail).includes("287 €"));
await admin.selectOption("#status", "payee");
await admin.fill("#internal_notes", "Port : 8 € convenus. Payé par virement.");
await admin.click("button:has-text('Enregistrer')");
await admin.waitForSelector("text=Commande mise à jour.");
await admin.reload();
check("CD-02", "statut et notes conservés après rechargement", (await admin.inputValue("#status")) === "payee" && (await admin.inputValue("#internal_notes")).includes("virement"));

// Un changement de prix ne modifie pas les commandes déjà reçues
await admin.goto(`${BASE}/admin/formats`);
const f40 = admin.locator("section:has(h2:has-text('40 × 60 cm')) form");
await f40.locator("input[name=price]").fill("75");
await f40.locator("button:has-text('Enregistrer')").click();
await admin.waitForSelector("text=Format enregistré.");
await admin.goto(`${BASE}/admin/commandes`);
await admin.click("a:has-text('IB-0001')");
await admin.waitForSelector("text=Tirages demandés");
check("CD-05", "après une hausse de prix, la commande garde ses montants (287 €)", euros(await admin.textContent("main")).includes("287 €"));
await admin.goto(`${BASE}/admin/formats`);
await admin.locator("section:has(h2:has-text('40 × 60 cm')) form input[name=price]").fill("70");
await admin.locator("section:has(h2:has-text('40 × 60 cm')) form button:has-text('Enregistrer')").click();
await admin.waitForSelector("text=Format enregistré.");

await admin.goto(`${BASE}/admin/commandes?statut=payee`);
check("CD-03", "le filtre par statut fonctionne", (await admin.locator("tbody tr").count()) === 1);

const csv = await admin.request.get(`${BASE}/admin/export`);
const csvText = await csv.text();
check("EX-01", "export CSV téléchargé, avec le port", csv.status() === 200 && csvText.includes("IB-0001") && csvText.includes("Port (€)") && csvText.includes(";12,00;287,00;"));
check("EX-02", "les formules Excel sont neutralisées", csvText.includes("'=Cadre noir") && csvText.includes("'+33 6"));
const anonCsv = await b.request.get(`${BASE}/admin/export`);
check("SE-01", "export refusé sans session admin", anonCsv.status() === 401);

await admin.goto(`${BASE}/admin/commandes`);
await admin.click("a:has-text('IB-0002')");
await admin.waitForSelector("text=Tirages demandés");
await admin.click("button:has-text('Anonymiser maintenant')");
await admin.click("button:has-text(\"Confirmer l'anonymisation\")");
await admin.waitForSelector("text=Coordonnées anonymisées");
check("RP-01", "anonymisation manuelle : coordonnées effacées", !(await admin.textContent("main")).includes("tom@example.com"));
await admin.click("button:has-text('Supprimer la commande')");
await admin.click("button:has-text('Supprimer définitivement')");
await admin.waitForURL(`${BASE}/admin/commandes`, { waitUntil: "commit" });
await admin.waitForSelector("h1:has-text('Commandes')");
check("CD-04", "suppression d'une commande", !(await admin.textContent("main")).includes("IB-0002"));

const cronNo = await b.request.get(`${BASE}/api/cron/anonymize`);
const cronYes = await b.request.get(`${BASE}/api/cron/anonymize`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
check("RP-02", "tâche d'anonymisation protégée par secret", cronNo.status() === 401 && cronYes.status() === 200);

// Une commande de plus d'un an est anonymisée par la tâche quotidienne, une récente non
const longAgo = new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString();
const [old] = await rest("orders", {
  method: "POST",
  body: JSON.stringify({ first_name: "Ancien", last_name: "Client", email: "ancien@example.com", phone: "0600000000", delivery_method: "retrait", consent_at: longAgo, created_at: longAgo, total_cents: 3500 }),
});
await b.request.get(`${BASE}/api/cron/anonymize`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
const [oldAfter] = await rest(`orders?id=eq.${old.id}&select=first_name,email,phone,total_cents,anonymized_at`);
const [recent] = await rest("orders?number=eq.1&select=email");
check("RP-05", "commande de plus d'un an anonymisée (montant conservé), commande récente intacte", oldAfter.first_name === "Anonyme" && oldAfter.phone === null && oldAfter.total_cents === 3500 && !!oldAfter.anonymized_at && recent.email === "lea@example.com");

/* ---------------- Pages légales, 404, mobile ---------------- */
await b.goto(`${BASE}/mentions-legales`);
const legal = await b.textContent("main");
check("LE-01", "mentions légales : valeur saisie et champ manquant signalé", legal.includes("Ines B.") && legal.includes("[à compléter]"));
const notFound = await b.goto(`${BASE}/page-inexistante`);
check("NF-01", "page inexistante : 404 lisible", notFound.status() === 404 && (await b.textContent("body")).includes("Page introuvable"));

const mob = await (await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true })).newPage();
let overflow = [];
for (const path of ["/", "/photos/lea-marseille", "/panier", "/commande", "/contact"]) {
  await mob.goto(`${BASE}${path}`);
  await mob.waitForLoadState("networkidle");
  if (await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) overflow.push(path);
}
check("MO-01", "aucun débordement horizontal sur mobile", overflow.length === 0, overflow.join(", "));

await admin.click("button:has-text('Se déconnecter')");
await admin.waitForURL(`${BASE}/admin/connexion`, { waitUntil: "commit" });
await admin.goto(`${BASE}/admin/commandes`);
check("AD-04", "après déconnexion, l'admin est de nouveau protégé", admin.url().endsWith("/admin/connexion"));

/* ---------------- Mot de passe oublié ---------------- */
const MAILPIT = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";
await admin.request.delete(`${MAILPIT}/api/v1/messages`);
await admin.click("text=Mot de passe oublié ?");
await admin.waitForSelector("text=Recevoir un lien");
await admin.fill("#email", "inconnu@example.com");
await admin.click("button:has-text('Recevoir un lien')");
await admin.waitForSelector(".alert-ok");
const neutral = await admin.textContent(".alert-ok");
await admin.fill("#email", ADMIN_EMAIL);
await admin.click("button:has-text('Recevoir un lien')");
await admin.waitForTimeout(1500);
check("MP-01", "même message pour une adresse inconnue et pour l'admin", neutral === (await admin.textContent(".alert-ok")));
let resetLink = null;
for (let i = 0; i < 10 && !resetLink; i++) {
  const list = await (await admin.request.get(`${MAILPIT}/api/v1/messages`)).json();
  const msg = list.messages?.find((m) => m.To?.some((t) => t.Address === ADMIN_EMAIL));
  if (msg) {
    const full = await (await admin.request.get(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
    resetLink = (full.Text.match(/https?:\/\/\S+verify\S+/) ?? [])[0] ?? null;
  }
  if (!resetLink) await admin.waitForTimeout(500);
}
const others = await (await admin.request.get(`${MAILPIT}/api/v1/messages`)).json();
check("MP-02", "l'email de réinitialisation part vers l'admin, et vers personne d'autre", !!resetLink && others.messages.length === 1);
if (resetLink) {
  await admin.goto(resetLink.replace(/&amp;/g, "&"));
  await admin.waitForSelector("text=Choisissez votre nouveau mot de passe");
  check("MP-03", "le lien mène au choix du nouveau mot de passe", admin.url().endsWith("/admin/nouveau-mot-de-passe"));
  await admin.fill("#password", "court");
  await admin.fill("#confirm", "court");
  await admin.evaluate(() => document.querySelectorAll("input").forEach((i) => i.removeAttribute("minlength")));
  await admin.click("button:has-text('Enregistrer le mot de passe')");
  await admin.waitForSelector(".alert");
  check("MP-04", "un mot de passe trop court est refusé", (await admin.textContent(".alert")).includes("10 caractères"));
  const NEW_PASSWORD = "Nouveau-Mot-De-Passe-2";
  await admin.fill("#password", NEW_PASSWORD);
  await admin.fill("#confirm", NEW_PASSWORD);
  await admin.click("button:has-text('Enregistrer le mot de passe')");
  await admin.waitForSelector("text=Votre mot de passe a été modifié.");
  await admin.click("button:has-text('Se déconnecter')");
  await admin.waitForURL(`${BASE}/admin/connexion`, { waitUntil: "commit" });
  await admin.fill("#email", ADMIN_EMAIL);
  await admin.fill("#password", NEW_PASSWORD);
  await admin.click("button:has-text('Se connecter')");
  await admin.waitForSelector("text=Bonjour Ines");
  check("MP-05", "connexion avec le nouveau mot de passe", true);
}
const expired = await (await browser.newContext()).newPage();
await expired.goto(`${BASE}/admin/auth/callback?code=faux`);
await expired.waitForSelector("text=Ce lien a expiré");
check("MP-06", "un lien invalide ou expiré mène à un message clair", expired.url().includes("lien=expire"));

await browser.close();
console.log(failures === 0 ? "\nRecette OK" : `\n${failures} vérification(s) en échec`);
process.exit(failures === 0 ? 0 : 1);
