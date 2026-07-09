# Guide de mise en ligne — "N'oublie pas 🌙"

Coche au fur et à mesure. Compte 20-25 min la première fois.

---

## Ce que tu dois avoir sous la main
- Tous les fichiers de l'appli (index.html, manifest.json, sw.js, package.json, les icônes, les 2 photos, et le dossier `api/`)
- Un compte GitHub (gratuit)
- Un compte Vercel (gratuit, tu en as déjà un pour GroPonpon)
- Le téléphone de ta copine, ce soir

---

## Étape 1 — Mettre les fichiers sur GitHub

**Si tu as déjà un repo GroPonpon et que tu veux réutiliser le même workflow, crée quand même un NOUVEAU repo pour cette appli — pas dans le même dossier que GroPonpon.**

1. Va sur **github.com**, connecte-toi
2. En haut à droite, clique sur le **+** → **New repository**
3. Donne un nom, par exemple `noublie-pas` (pas d'espace, pas d'accent)
4. Laisse en **Public** ou **Private**, peu importe (Private si tu préfères garder ça discret)
5. Ne coche AUCUNE case (pas de README, pas de .gitignore) — laisse tout vide
6. Clique **Create repository**

7. Sur la page qui s'affiche, cherche le lien **"uploading an existing file"** (en bleu, dans le paragraphe sous le nom du repo) et clique dessus
   - Si tu ne le vois pas : en haut de la page du repo, il y a un bouton **Add file → Upload files**
8. Fais glisser **tous** les fichiers d'un coup dans la zone (index.html, manifest.json, sw.js, package.json, les 4 icônes, les 2 photos)
9. **Important** : pour le dossier `api/`, glisse le dossier entier tel quel (GitHub garde l'arborescence si tu glisses le dossier, pas juste les fichiers un par un)
10. En bas de la page, dans "Commit changes", laisse le message par défaut et clique **Commit changes**

11. Vérifie sur la page principale du repo que tu vois bien : `index.html`, `manifest.json`, `sw.js`, `package.json`, un dossier `api` (clique dessus pour voir les 5 fichiers dedans), les icônes et les 2 photos

☐ Fait

---

## Étape 2 — Connecter à Vercel

1. Va sur **vercel.com**, connecte-toi (avec ton compte GitHub si possible, c'est plus simple)
2. Clique **Add New...** (en haut à droite) → **Project**
3. Dans la liste de tes repos GitHub, trouve `noublie-pas` (ou le nom que tu as choisi) → clique **Import**
4. Vercel affiche un écran de configuration — **ne touche à rien**, laisse tout par défaut
5. Clique **Deploy**
6. Attends 30-60 secondes, tu arrives sur une page avec un gros bouton et l'URL de ton site (du genre `noublie-pas.vercel.app` ou avec des chiffres ajoutés)
7. **Note cette URL quelque part**, tu en auras besoin à l'étape 5

☐ Fait

---

## Étape 3 — Ajouter la base de données (Upstash Redis)

1. Sur la page de ton projet dans Vercel, en haut, clique l'onglet **Storage**
2. Clique **Create Database** (ou **Browse Marketplace** selon ce qui s'affiche)
3. Cherche **Upstash**, clique dessus
4. Choisis **Redis** comme type de produit
5. Suis les écrans (nom par défaut ok, région par défaut ok) jusqu'à **Create** / **Continue**
6. À la fin, il te propose de connecter la base à un projet → sélectionne ton projet `noublie-pas` → **Connect**

Vercel ajoute automatiquement les codes d'accès nécessaires à ton projet, tu n'as rien à copier toi-même pour cette partie.

☐ Fait

---

## Étape 4 — Ajouter les 4 variables secrètes

1. Sur la page de ton projet Vercel → onglet **Settings** → **Environment Variables** (dans le menu de gauche)
2. Ajoute une par une ces 4 lignes (nom à gauche, valeur à droite, coche les 3 environnements proposés — Production/Preview/Development — puis **Save** à chaque fois) :

| Nom | Valeur |
|---|---|
| `VAPID_PUBLIC_KEY` | `BBcIqmq1_FZfFm1cJuzkbPFu9G4j1XL9QFM647fhkn3pwQizMJAmLs5PJTmilaOReLOUuvduzRPAm4AAqH6G4BQ` |
| `VAPID_PRIVATE_KEY` | `UuJpY2YJYF6g5Qftu-u3ehZyQscBkUXnhLN2TLpUpb8` |
| `VAPID_SUBJECT` | `mailto:TON-EMAIL@exemple.com` (mets ta vraie adresse email) |
| `CRON_KEY` | `227592f566b9f2af5aad47f2a0faf6e9bdd7512f6e3ff8c1` |

3. Une fois les 4 ajoutées : onglet **Deployments** (menu du haut) → clique les **3 petits points** à côté du déploiement le plus récent → **Redeploy** → confirme
   - C'est indispensable : sans ce redéploiement, les nouvelles variables ne sont pas prises en compte

☐ Fait

---

## Étape 5 — Programmer le vérificateur automatique (cron-job.org)

1. Va sur **cron-job.org**, clique **Sign up** (gratuit), crée ton compte, valide ton email
2. Une fois connecté, clique **Create cronjob**
3. **Title** : `pilule reminder` (ou ce que tu veux)
4. **Address / URL** : colle ceci, en remplaçant `TON-DOMAINE` par l'URL notée à l'étape 2 :
   ```
   https://TON-DOMAINE.vercel.app/api/check-and-notify?key=227592f566b9f2af5aad47f2a0faf6e9bdd7512f6e3ff8c1
   ```
5. **Schedule / Execution schedule** : choisis **"Every 15 minutes"** (ou 30 min)
6. Clique **Create** / **Save**
7. Sur la liste de tes cronjobs, il y a un bouton **▶ Run now** ou **Execute now** — tu t'en serviras au test final

☐ Fait

---

## Étape 6 — Installer sur son iPhone

1. Sur l'iPhone, ouvre **Safari** (pas Chrome, pas Messenger, pas un navigateur intégré à une autre appli)
2. Va sur l'URL Vercel notée à l'étape 2
3. Appuie sur l'icône **Partager** (le carré avec la flèche vers le haut, en bas de l'écran)
4. Fais défiler et appuie sur **"Sur l'écran d'accueil"**
5. Confirme avec **Ajouter** en haut à droite
6. **Ferme Safari**, puis ouvre l'appli depuis sa nouvelle icône sur l'écran d'accueil (pas depuis Safari)
7. Dans l'appli, appuie sur **"Activer les notifications"**
8. iOS affiche une popup de permission → **Autoriser**

☐ Fait

---

## Étape 7 — Le test avant de lui faire confiance ce soir

Ne saute pas cette étape : mieux vaut découvrir un souci maintenant que ce soir à 20h30.

1. Dans l'appli, ouvre les réglages (⚙️) et mets **l'heure du rappel à 2-3 minutes dans le futur** par rapport à maintenant → **Enregistrer**
2. Va sur cron-job.org, clique **Run now** sur ton cronjob (ne pas attendre les 15 min)
3. Une notification doit apparaître sur l'iPhone dans les secondes qui suivent, même si l'appli est fermée
4. Sur l'iPhone, appuie sur **"J'ai pris ma pilule"** dans l'appli
5. Clique encore une fois **Run now** sur cron-job.org → vérifie qu'**aucune** nouvelle notif n'arrive (preuve que ça s'arrête bien quand elle coche)
6. Remets l'heure du rappel sur **20:30** et l'intervalle sur **1h** dans les réglages → **Enregistrer**

☐ Testé et validé

---

## Si l'étape 7 ne marche pas

- **Aucune notif du tout** → vérifie dans Réglages iPhone → Notifications → cherche l'appli, les notifs doivent être autorisées. Sinon, vérifie que les 4 variables d'environnement sont bien orthographiées dans Vercel (copier-coller plutôt que retaper) et que tu as bien fait **Redeploy** après les avoir ajoutées.
- **"Notifications refusées" affiché dans l'appli** → Réglages iPhone → Notifications → l'appli → réactiver, puis rouvrir l'appli et refaire l'étape 6.7-6.8.
- **Le bouton "Run now" de cron-job.org affiche une erreur** → clique dessus pour voir le détail de la réponse ; s'il dit "Unauthorized", la clé dans l'URL ne correspond pas à `CRON_KEY` dans Vercel, revérifie les deux.

Si ça bloque encore après ça, dis-moi exactement à quelle étape et ce qui s'affiche, je regarde avec toi.
