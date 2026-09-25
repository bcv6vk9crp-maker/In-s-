# Ines. B — boutique de tirages photo

Site de vente de tirages d'art d'Ines. B, avec un espace administrateur pour gérer les photos, les collections, les prix et les commandes.

Il n'y a **aucun paiement en ligne**. L'acheteur remplit son panier et envoie ses coordonnées. Ines reçoit un email, recontacte l'acheteur, puis règle avec lui le paiement et la remise ou la livraison.

## Ce que fait le site

**Côté public** (français / anglais) :
- galerie filtrable par collection (une photo peut appartenir à plusieurs collections) ;
- fiche de chaque photo : format 20 × 30 ou 40 × 60, option cadre, quantité de 1 à 10 ;
- panier conservé dans le navigateur, sans création de compte ;
- formulaire de commande : prénom, nom, email, téléphone (facultatif), retrait ou livraison (l'adresse est alors obligatoire), message, consentement RGPD ;
- email d'alerte à Ines et email récapitulatif à l'acheteur ;
- pages À propos, Contact, Mentions légales, Conditions de vente et Confidentialité.

**Espace admin** (`/admin`, réservé à Ines) :
- tableau de bord : commandes à traiter, chiffres du mois, photos les plus demandées ;
- commandes : filtre par statut (Nouvelle → Contactée → Payée → Expédiée / remise, ou Annulée), notes internes, anonymisation, suppression, export CSV lisible dans Excel ;
- photos : ajout une par une. L'image est réduite à 1600 px et reçoit le filigrane « © Ines. B » **dans le navigateur**, donc l'original n'est jamais mis en ligne ;
- collections, avec une petite note manuscrite affichée sous le titre ;
- réglages : prix, suppléments cadre par format, email d'alerte, textes du site, informations légales.

Les coordonnées des acheteurs sont **anonymisées automatiquement un an après la commande**. Le détail et le montant de la commande sont conservés pour la comptabilité.

## Mise en ligne (≈ 30 minutes)

Les comptes sont créés au nom d'Ines, avec son email. Elle en reste propriétaire et peut inviter une autre personne pour la technique. Les trois services sont gratuits à ce niveau d'usage.

### 1. Supabase (base de données et stockage des images)

1. Créer un compte sur [supabase.com](https://supabase.com), puis un projet. **Région : Europe** (Paris ou Frankfurt), pour le RGPD.
2. Ouvrir **SQL Editor → New query**, coller le contenu de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), puis cliquer **Run**.
3. Ouvrir **Authentication → Users → Add user → Create new user** : saisir l'email et le mot de passe qu'Ines utilisera pour se connecter à l'admin, et cocher *Auto Confirm User*.
4. Dans **Authentication → Sign In / Providers**, désactiver *Allow new users to sign up*, pour que personne d'autre ne puisse créer de compte.
5. Dans **Project Settings → API Keys**, noter l'URL du projet, la *Publishable key* et la *Secret key*.

### 2. Resend (envoi des emails)

1. Créer un compte sur [resend.com](https://resend.com) **avec l'email d'Ines**.
2. **API Keys → Create API Key**, puis noter la clé.
3. Tant qu'aucun nom de domaine n'est vérifié, Resend envoie seulement vers l'email du compte. Ines reçoit donc ses alertes, mais **les acheteurs ne reçoivent pas encore leur récapitulatif**. Une fois le nom de domaine acheté (par exemple `inesb.fr`), l'ajouter dans **Domains**, puis remplacer `EMAIL_FROM` par une adresse de ce domaine, par exemple `Ines. B <commandes@inesb.fr>`.

### 3. Vercel (hébergement)

1. Créer un compte sur [vercel.com](https://vercel.com) avec GitHub, puis **Add New → Project** et importer ce dépôt.
2. Avant de cliquer sur *Deploy*, renseigner les variables d'environnement (voir [`.env.example`](.env.example)) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | *Publishable key* Supabase |
| `SUPABASE_SECRET_KEY` | *Secret key* Supabase (ne jamais la partager) |
| `ADMIN_EMAIL` | email du compte admin créé à l'étape 1.3 |
| `RESEND_API_KEY` | clé Resend |
| `EMAIL_FROM` | `Ines. B <onboarding@resend.dev>` en attendant un domaine |
| `NEXT_PUBLIC_SITE_URL` | adresse du site, par exemple `https://ines-b.vercel.app` |
| `CRON_SECRET` | une longue suite de caractères au hasard |

3. Cliquer **Deploy**. Le site est en ligne à l'adresse `…vercel.app`.
4. Le fichier `vercel.json` programme l'anonymisation quotidienne des commandes de plus d'un an. Vercel l'active tout seul.

### 4. Premiers pas dans l'admin

Se connecter sur `/admin`, puis, dans cet ordre :
1. **Réglages** : vérifier les prix et saisir le supplément cadre de chaque format, l'email qui reçoit les alertes, les textes À propos et Contact, et les informations légales (nom, statut, SIRET, mention TVA, adresse). Tant qu'une information légale est vide, le site affiche « [à compléter] ».
2. **Collections** : créer les séries.
3. **Photos** : ajouter les photos, puis passer une commande de test.

## Développement

```bash
npm install
cp .env.example .env.local   # puis compléter
npm run dev                  # http://localhost:3000
npm test                     # tests unitaires (prix, validation des commandes, export)
npm run lint && npm run typecheck
```

Pour une base locale, avec Docker : `npx supabase start` applique automatiquement la migration. Les clés locales s'affichent au démarrage.

**Technique** : Next.js 16 (App Router, Server Actions), Supabase (Postgres, Auth, Storage), Resend, Zod.

**Sécurité** :
- toutes les lectures et écritures en base passent par le serveur avec la clé secrète ;
- la sécurité au niveau des lignes est activée sans aucune règle, donc la clé publique ne donne accès à rien ;
- chaque page et action admin vérifie que la personne connectée est bien `ADMIN_EMAIL` ;
- les prix sont toujours recalculés côté serveur au moment de la commande.
