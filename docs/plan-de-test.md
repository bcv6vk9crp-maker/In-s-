# Ines. B — cas d'usage et plan de test

Ce document décrit ce que l'application doit permettre et comment le vérifier avant la mise en ligne. Il commence par les points du besoin qui restent à confirmer avec Ines.

- **Tests automatiques** : `npm test` (règles de calcul) et `npm run test:e2e` (parcours complet dans un navigateur, 54 vérifications, voir `e2e/parcours.mjs`).
- **Tests manuels** : ceux qu'un robot ne peut pas faire (vrais emails, vrais téléphones, vraies photos d'Ines). Ils sont marqués **Manuel** ci-dessous.

---

## 1. Points du besoin à confirmer avec Ines

Le besoin initial est couvert. Les points ci-dessous ne bloquent pas la mise en ligne, mais chacun peut créer un malentendu avec un acheteur. Pour chaque point, trois choix sont proposés et ★ marque la recommandation.

### 1.1 Format des photos et format des tirages ⚠️ le plus important
Le 20 × 30 et le 40 × 60 ont tous deux des proportions **2:3**. Une photo carrée, en 4:5 ou en paysage ne remplit pas ces formats sans être recadrée ou entourée de marges blanches. La galerie, elle, affiche toutes les vignettes en portrait 4:5.
- ★ A. Les vignettes adoptent les proportions réelles de chaque photo (portrait ou paysage), et la fiche précise « tirage au format 2:3, marges blanches si nécessaire ».
- B. Ines ne publie que des photos en 2:3 et les vignettes passent en 2:3.
- C. On garde l'affichage actuel et Ines gère le recadrage au cas par cas avec l'acheteur.

### 1.2 Frais de port inconnus au moment de la commande
Aujourd'hui, l'acheteur voit « frais de port à définir ». Il peut hésiter, ou contester le prix final.
- ★ A. Un forfait par format, affiché et modifiable dans l'admin (par exemple 8 € et 15 €).
- B. Rester « à définir » pour le lancement, puis décider après les premières commandes.
- C. Livraison offerte, avec le coût intégré au prix.

### 1.3 Tirages illimités ou éditions limitées
Sur le marché de la photo d'art, un tirage numéroté et signé se vend mieux et plus cher.
- ★ A. Garder l'illimité pour le lancement, et proposer plus tard une option « édition limitée » photo par photo.
- B. Éditions limitées dès maintenant, avec un stock par photo et par format.
- C. Illimité, avec une mention « tirage signé au dos ».

### 1.4 Délai de fabrication et type de papier
Ces informations ne figurent nulle part, alors que les acheteurs les demanderont.
- ★ A. Un texte commun à toutes les fiches, modifiable dans les réglages (par exemple « papier Hahnemühle mat, expédié sous 10 jours »).
- B. Un texte par photo.
- C. Ces informations sont données lors de l'échange avec Ines.

### 1.5 Conservation des données : 1 an, et la comptabilité ?
Les coordonnées des acheteurs sont effacées au bout d'un an. Or les **factures doivent être conservées 10 ans**. L'application n'émet pas de factures : Ines doit les faire à part (logiciel de facturation ou modèle), sinon elle perdra le nom des acheteurs.
- ★ A. Garder 1 an et documenter qu'Ines émet ses factures en dehors de l'application.
- B. Ne jamais anonymiser les commandes payées (la base légale est alors l'obligation comptable) et anonymiser seulement les commandes non abouties.
- C. Passer à 3 ans pour toutes les commandes.

### 1.6 Emails aux acheteurs
Sans nom de domaine, le service d'emails (Resend) refuse d'écrire aux acheteurs : ils ne reçoivent pas leur récapitulatif. Ines, elle, reçoit bien ses alertes.
- ★ A. Acheter un nom de domaine (environ 10 €/an) avant d'annoncer le site.
- B. Lancer quand même, la page de remerciement faisant office de confirmation.
- C. Utiliser une adresse Gmail comme expéditeur (moins fiable, risque de spam).

### 1.7 Mot de passe oublié
L'admin n'a pas de lien « mot de passe oublié ». Aujourd'hui, la réinitialisation se fait depuis le tableau de bord Supabase.
- ★ A. Ajouter un lien « mot de passe oublié » qui envoie un email à Ines (environ une demi-journée).
- B. Garder la procédure Supabase, décrite dans le README.
- C. Connexion par lien magique envoyé par email, sans mot de passe.

### 1.8 Mise en veille du service gratuit
Supabase met en pause un projet gratuit resté inactif une semaine. La tâche quotidienne d'anonymisation interroge la base chaque jour, ce qui devrait suffire à le garder actif. **À surveiller la première semaine** (test RP-03).

### 1.9 Choses volontairement hors périmètre
Pas de paiement en ligne, pas de facturation, pas de gestion de stock, pas de compte acheteur, pages légales en français uniquement. À rediscuter si le volume de commandes augmente.

---

## 2. Cas d'usage

### Acheteur
| ID | Cas d'usage |
|---|---|
| UC-A1 | Parcourir la galerie et filtrer par collection |
| UC-A2 | Ouvrir la fiche d'une photo, choisir format, cadre et quantité, voir le prix |
| UC-A3 | Ajouter au panier la même photo ou des photos différentes, modifier les quantités, retirer une ligne |
| UC-A4 | Passer le site en anglais |
| UC-A5 | Valider son panier : coordonnées, retrait ou livraison, message, consentement |
| UC-A6 | Recevoir le récapitulatif par email et répondre à Ines |
| UC-A7 | Consulter À propos, Contact et les pages légales |
| UC-A8 | Demander la suppression de ses données (par email à Ines) |

### Ines (administratrice)
| ID | Cas d'usage |
|---|---|
| UC-I1 | Se connecter à l'espace admin et se déconnecter |
| UC-I2 | Recevoir une alerte email pour chaque commande et répondre directement à l'acheteur |
| UC-I3 | Voir son tableau de bord : commandes à traiter, chiffres du mois, photos les plus demandées |
| UC-I4 | Suivre une commande : statut, notes internes, coordonnées de l'acheteur |
| UC-I5 | Exporter les commandes dans Excel |
| UC-I6 | Ajouter, modifier, masquer ou supprimer une photo (réduction et filigrane automatiques) |
| UC-I7 | Créer et organiser des collections |
| UC-I8 | Modifier les prix et les suppléments cadre |
| UC-I9 | Modifier les textes du site et les informations légales |
| UC-I10 | Anonymiser ou supprimer une commande |

### Automatique (système)
| ID | Cas d'usage |
|---|---|
| UC-S1 | Anonymiser chaque jour les commandes de plus d'un an |
| UC-S2 | Bloquer les envois répétés (plus de 3 commandes en 15 min avec le même email) et les robots (champ piège) |
| UC-S3 | Recalculer les prix côté serveur, sans jamais faire confiance au navigateur |

---

## 3. Plan de test

Statut : ✅ vérifié automatiquement · 🔲 à faire à la main avant la mise en ligne

### Accès admin et sécurité
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| AD-01 | Ouvrir `/admin` sans être connecté | Redirection vers la page de connexion | Auto | ✅ |
| AD-02 | Mauvais mot de passe | Message d'erreur, email conservé dans le champ | Auto | ✅ |
| AD-03 | Bon mot de passe | Arrivée sur le tableau de bord | Auto | ✅ |
| AD-04 | Déconnexion puis retour sur une page admin | Redirection vers la connexion | Auto | ✅ |
| SE-01 | Télécharger l'export sans être connecté | Refus (401) | Auto | ✅ |
| SE-02 | Un compte Supabase autre que `ADMIN_EMAIL` tente de se connecter | Refus | Manuel | 🔲 |

### Réglages, collections, photos (UC-I6 à I9)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| RG-01 | Enregistrer prix, cadre, emails, textes | Message « Réglages enregistrés », valeurs visibles sur le site | Auto | ✅ |
| RG-02 | Saisir un prix invalide | Message d'erreur, saisie conservée | Auto | ✅ |
| CO-01 | Créer deux collections | Collections créées, formulaire vidé | Auto | ✅ |
| PH-01 | Ajouter trois photos avec collections | Photos listées dans l'admin | Auto | ✅ |
| PH-02 | Enregistrer une photo sans image | Refus avec message | Auto | ✅ |
| PH-03 | Image de 3000 × 4000 px | En ligne en 1600 px maximum, avec filigrane « © Ines. B » | Auto | ✅ |
| PH-04 | Vraies photos d'Ines : paysage, carré, très grand fichier (plus de 30 Mo) | Filigrane lisible, envoi en quelques secondes | Manuel | 🔲 |
| PH-05 | Photo prise sur iPhone (HEIC), envoyée depuis l'iPhone | L'image est acceptée (Safari la convertit en JPEG) | Manuel | 🔲 |

### Galerie et fiche (UC-A1, A2)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| GA-01 | Afficher la galerie | Toutes les photos visibles | Auto | ✅ |
| GA-02 | Filtrer par collection, photo présente dans deux collections | Bon sous-ensemble | Auto | ✅ |
| GA-03 | Note manuscrite de collection | Affichée sous le titre | Auto | ✅ |
| GA-04 | Photos droites (demande d'Ines) | Aucune rotation | Auto | ✅ |
| GA-05 | Photo masquée | Absente de la galerie, page en 404 | Auto | ✅ |
| FI-01 | Prix par défaut | 20 × 30 sans cadre = 35 € | Auto | ✅ |
| FI-02 | Options de format et de cadre | 85 € (20 × 30 avec cadre) et 150 € (40 × 60 avec cadre à 80 €) | Auto + Unit | ✅ |
| FI-03 | Quantité | Plafonnée entre 1 et 10 | Auto | ✅ |

### Panier et langue (UC-A3, A4)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| PA-01 | Ajouter deux fois la même configuration | Quantités additionnées sur une seule ligne | Auto | ✅ |
| PA-02 | Plusieurs photos différentes | Total estimé juste (670 €) | Auto | ✅ |
| PA-03 | Modifier une quantité | Total mis à jour | Auto | ✅ |
| PA-04 | Retirer une ligne | Ligne supprimée | Auto | ✅ |
| PA-05 | Recharger la page | Panier conservé | Auto | ✅ |
| LG-01 à 03 | Passer en anglais | Interface, titres et textes en anglais | Auto | ✅ |

### Commande (UC-A5, A6, S2, S3)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| CM-01 | Commande avec livraison | Page de remerciement avec numéro IB-0001 | Auto | ✅ |
| CM-02 | Sans cocher le consentement | Commande non envoyée | Auto + Unit | ✅ |
| CM-03 | Livraison sans adresse | Commande non envoyée, pays prérempli | Auto + Unit | ✅ |
| CM-04 | Retrait en main propre sans adresse | Commande acceptée | Auto | ✅ |
| CM-05 | Photo masquée entre l'ajout au panier et la validation | Photo retirée du panier, message explicite | Auto | ✅ |
| CM-06 | Après l'envoi | Panier vidé | Auto | ✅ |
| CM-07 | 4ᵉ commande en 15 min avec le même email (majuscules ou minuscules) | Commande bloquée avec un message | Auto | ✅ |
| CM-08 | Prix modifié dans le navigateur (outil de développement) | Le serveur recalcule, le prix enregistré reste juste | Unit (schéma) + revue | ✅ |
| EM-01 | Alerte reçue par Ines (vraie clé Resend) | Email reçu, « Répondre » écrit à l'acheteur | Manuel | 🔲 |
| EM-02 | Récapitulatif reçu par l'acheteur (après vérification du domaine) | Email en FR ou en EN selon la langue du site | Manuel | 🔲 |
| EM-03 | Affichage des emails dans Gmail, Outlook et Mail sur iPhone | Mise en page correcte | Manuel | 🔲 |

### Suivi des commandes (UC-I2 à I5, I10)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| TB-01 | Tableau de bord | Nombre de nouvelles commandes juste | Auto | ✅ |
| TB-02 | Photos les plus demandées | Liste alimentée | Auto | ✅ |
| CD-01 | Détail d'une commande | Adresse, téléphone et message visibles | Auto | ✅ |
| CD-02 | Changer le statut et ajouter des notes | Conservés après rechargement | Auto | ✅ |
| CD-03 | Filtre par statut | Bonne liste | Auto | ✅ |
| CD-04 | Supprimer une commande (double confirmation) | Commande disparue | Auto | ✅ |
| EX-01 | Export CSV | Fichier avec les commandes | Auto | ✅ |
| EX-02 | Texte commençant par `=` ou `+` | Neutralisé (pas de formule exécutée dans Excel) | Auto + Unit | ✅ |
| EX-03 | Ouvrir l'export dans Excel sur le PC ou le Mac d'Ines | Accents et colonnes corrects | Manuel | 🔲 |

### Données personnelles (UC-S1, A8)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| RP-01 | Anonymisation manuelle | Coordonnées effacées, montant conservé | Auto | ✅ |
| RP-02 | Tâche quotidienne appelée sans secret, puis avec | Refus (401), puis exécution (200) | Auto | ✅ |
| RP-03 | Sur Vercel : la tâche apparaît dans *Settings → Cron Jobs* et s'exécute | Exécution quotidienne visible dans les journaux | Manuel | 🔲 |
| RP-04 | Date limite de conservation | Exactement un an | Unit | ✅ |
| LE-01 | Mentions légales | Valeurs saisies affichées, « [à compléter] » sinon | Auto | ✅ |

### Affichage et appareils
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| MO-01 | Largeur de téléphone (375 px) sur 5 pages | Aucun défilement horizontal | Auto | ✅ |
| MO-02 | Parcours complet sur un vrai iPhone (Safari) et un Android (Chrome) | Commande envoyée sans gêne | Manuel | 🔲 |
| NF-01 | Page inexistante | Page 404 aux couleurs du site | Auto | ✅ |
| AC-01 | Navigation au clavier seul (Tab, Entrée) jusqu'à l'envoi de la commande | Possible, focus visible | Manuel | 🔲 |

---

## 4. Lancer la recette automatique

```bash
npx supabase start                     # base locale (Docker)
npx supabase db reset                  # base vierge
# créer le compte admin de test (voir README), renseigner .env.local, puis :
npm run build && npm start &
E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_CRON_SECRET=… npm run test:e2e
```

Le script affiche une ligne ✓ ou ✗ par vérification, puis « Recette OK ». Il doit être lancé sur une base vierge, car il vérifie par exemple que la première commande porte le numéro IB-0001.
