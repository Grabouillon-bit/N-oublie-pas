# N'oublie pas 🌙

Petite PWA de rappel pour la prise de pilule, avec suivi en constellation, et **vraies notifications push serveur** — ça fonctionne maintenant même sur iPhone, appli fermée.

## Ta photo (optionnel)

Dépose une photo carrée (ou presque) nommée exactement **`photo-couple.jpg`** dans le même dossier que `index.html` avant de déployer. Elle s'affiche en médaillon rond en haut de l'appli. Si le fichier est absent, ce médaillon disparaît tout seul, pas d'erreur.

## Comment ça marche maintenant (important)

Avant, l'appli devait être ouverte pour vérifier l'heure et notifier — ça ne marchait pas bien sur iPhone en arrière-plan. Maintenant, c'est un **serveur** qui vérifie l'heure et envoie la notification directement au téléphone via Apple/Google, même appli complètement fermée. C'est le même mécanisme que WhatsApp ou Gmail utilisent pour notifier sans être ouverts.

Ça demande 3 briques en plus d'un simple site statique :
1. Une **petite base de données** (pour stocker l'heure du rappel et si elle a coché aujourd'hui)
2. Des **clés de notification** (VAPID — l'équivalent d'une signature qui autorise ton serveur à notifier son téléphone)
3. Un **déclencheur régulier** qui demande au serveur "est-ce qu'il faut notifier maintenant ?" toutes les 15-30 minutes

## Mise en ligne — étape par étape

### 1. GitHub → Vercel (comme d'habitude)
Mets **tous** les fichiers (y compris le dossier `api/` et `package.json`) dans le même repo GitHub, connecté à Vercel. Vercel détecte automatiquement les fichiers dans `api/` comme des fonctions serveur, aucune config particulière à faire.

### 2. Ajouter la base de données (gratuite)
Dans le dashboard Vercel → onglet **Storage** → **Marketplace** → cherche **Upstash** → installe l'intégration **Redis**, connecte-la à ce projet. Vercel injecte automatiquement les identifiants nécessaires. Le tier gratuit (500 000 requêtes/mois) est très largement suffisant ici.

### 3. Ajouter les variables d'environnement
Dans **Project Settings → Environment Variables**, ajoute :

```
VAPID_PUBLIC_KEY  = BBcIqmq1_FZfFm1cJuzkbPFu9G4j1XL9QFM647fhkn3pwQizMJAmLs5PJTmilaOReLOUuvduzRPAm4AAqH6G4BQ
VAPID_PRIVATE_KEY = UuJpY2YJYF6g5Qftu-u3ehZyQscBkUXnhLN2TLpUpb8
VAPID_SUBJECT     = mailto:ton-email@exemple.com
CRON_KEY          = 227592f566b9f2af5aad47f2a0faf6e9bdd7512f6e3ff8c1
```

⚠️ Ce sont de vraies clés déjà générées pour ton appli, utilisables telles quelles, mais ne les poste nulle part publiquement (pas de commit dans le code, uniquement dans les variables d'environnement Vercel). `VAPID_PRIVATE_KEY` et `CRON_KEY` sont des secrets ; `VAPID_PUBLIC_KEY` est déjà dans `index.html`, c'est normal, elle est faite pour être publique.

Redéploie une fois les variables ajoutées (Vercel te le proposera automatiquement).

### 4. Programmer le vérificateur (gratuit, sans code)
Vercel Cron ne permet qu'une vérification par jour sur le plan gratuit, trop peu pour des relances toutes les heures. Utilise plutôt **cron-job.org** (gratuit, sans installation) :
1. Crée un compte, "Create cronjob"
2. URL à appeler : `https://TON-DOMAINE.vercel.app/api/check-and-notify?key=227592f566b9f2af5aad47f2a0faf6e9bdd7512f6e3ff8c1`
3. Fréquence : toutes les 15 ou 30 minutes
4. Enregistre

C'est ce déclencheur qui va, à chaque appel, vérifier "est-on après l'heure du rappel, et est-ce qu'elle a déjà coché ?" et n'envoyer une notif que si nécessaire.

### 5. Sur son téléphone
1. Ouvre l'URL Vercel dans Safari (iPhone) ou Chrome (Android)
2. **Ajouter à l'écran d'accueil**, important : sur iPhone, les notifications push ne fonctionnent QUE depuis l'appli installée sur l'écran d'accueil, pas depuis un onglet Safari classique
3. Ouvre l'appli installée (icône sur l'écran d'accueil, pas Safari)
4. Appuie sur **"Activer les notifications"** et accepte la permission, une seule fois suffit

## Ce que ça fait

- Bouton "J'ai pris ma pilule" → coche le jour, allume une étoile dans la constellation des 7 derniers jours, calcule la série en cours, prévient le serveur.
- Réglages (icône ⚙️) : heure du rappel (20:30 par défaut), fréquence de relance (30 min / 1h / 2h), prénom optionnel, synchronisés avec le serveur.
- À partir de l'heure réglée, tant que ce n'est pas coché : le serveur envoie une notification qui **reste affichée** (elle ne disparaît pas toute seule), jusqu'à ce qu'elle coche ou qu'elle l'efface elle-même, sur Android et sur iPhone.

## Limites qui restent, honnêtement

- **iOS 16.4 minimum** pour le push web (quasiment tous les iPhone en usage aujourd'hui l'ont).
- Si elle désinstalle l'appli ou désactive les notifications dans les réglages iPhone, il faudra réactiver une fois depuis l'appli.
- La précision du déclencheur dépend de cron-job.org (généralement à quelques minutes près), pas un vrai réveil à la seconde près, mais largement suffisant pour l'usage.
- Si tu préfères ne pas gérer d'infrastructure du tout, une version 100% locale sans serveur reste possible, juste moins fiable en arrière-plan sur iPhone, dis-le moi si tu veux revenir à cette version plus simple.
