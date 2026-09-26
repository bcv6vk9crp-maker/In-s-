# Ines. B — cas d'usage et plan de test

Ce document décrit ce que l'application doit permettre et comment le vérifier avant la mise en ligne. Il commence par les décisions prises avec Ines et par les questions encore ouvertes.

- **Tests automatiques** : `npm test` (règles de calcul, 18 tests) et `npm run test:e2e` (parcours complet dans un navigateur, 76 vérifications, voir `e2e/parcours.mjs`).
- **Tests manuels** : ceux qu'un robot ne peut pas faire (vrais emails, vrais téléphones, vraies photos d'Ines). Ils sont marqués **Manuel** ci-dessous.

---

## 1. Décisions d'Ines

| Sujet | Décision |
|---|---|
| Formats | De 2 à 4 formats, gérés par Ines dans l'admin. 4 par défaut, en proportions 2:3 : 20 × 30 (35 €), 30 × 45 (50 €), 40 × 60 (70 €), 60 × 90 (120 €) |
| Cadre | Un seul modèle. Supplément par format : 6, 8, 10, 12 € par défaut, modifiable |
| Frais de port | Forfait par format : 6, 8, 12, 18 € par défaut, modifiable. Compté une seule fois par commande, au montant du plus grand format du panier. Retrait gratuit |
| Galerie | Chaque vignette garde la forme réelle de sa photo (portrait ou paysage), et les photos sont droites |
| Éditions | Tirages illimités pour le lancement |
| Factures | Ines les fait en dehors du site. Coordonnées des acheteurs effacées au bout d'un an |
| Nom de domaine | Lancement sans domaine. La page de remerciement dit « commande transmise à la photographe », sans promettre d'email. **Condition** : le compte Resend doit être créé avec l'adresse qui reçoit les commandes |
| Mot de passe | Lien « mot de passe oublié » sur la page de connexion |
| Retrait | Lieu de retrait réglé dans l'admin, affiché à l'acheteur |
| Contenus | Ines saisit elle-même ses emails, son Instagram, ses collections et ses photos dans l'admin |

## 2. Questions en attente

En attendant une réponse, le site garde le comportement indiqué dans la colonne de droite.

| # | Question | Choix proposés (★ recommandé) | En attendant |
|---|---|---|---|
| QA-1 | La petite phrase manuscrite sous le titre d'une collection reste-t-elle penchée ? | ★ La garder penchée · La redresser · Ne plus l'afficher | Penchée |
| QA-2 | Comment afficher les infos de fabrication (papier, délai, signature) ? | ★ Texte commun modifiable dans les réglages · Texte par photo · Pas affiché | Rien n'est affiché |
| QA-3 | Qui écrit les textes À propos et Contact, et la version anglaise ? | ★ Ines écrit, Claude traduit · Ines fait tout · Claude propose un brouillon | Textes vides, saisissables dans l'admin |
| QA-4 | Création des comptes Supabase, Resend et Vercel | ★ Ensemble (environ 30 min) · Ines seule avec le guide | Rien n'est créé, **bloquant pour la mise en ligne** |
| QA-5 | Statut légal d'Ines (micro-entreprise, artiste-auteur…) | À choisir par Ines | « [à compléter] » sur les pages légales, **bloquant pour l'ouverture réelle** |

## 3. Points de vigilance

- **Alertes de commande** : sans nom de domaine, Resend n'écrit qu'à l'email de son propre compte. Cet email doit être celui réglé comme « email des alertes » dans l'admin. À vérifier lors du test EM-01.
- **Mot de passe oublié** : l'email intégré à Supabase n'écrit qu'aux membres du projet. Le compte admin doit donc avoir le même email que le compte Supabase d'Ines, sinon il faut brancher Resend en SMTP (voir README).
- **Mise en veille du service gratuit** : Supabase met en pause un projet gratuit inactif pendant une semaine. La tâche quotidienne d'anonymisation interroge la base chaque jour, ce qui devrait suffire. À surveiller la première semaine (test RP-03).
- **Hors périmètre** : pas de paiement en ligne, pas de facturation, pas de gestion de stock, pas de compte acheteur, pages légales en français uniquement.

---

## 4. Cas d'usage

### Acheteur
| ID | Cas d'usage |
|---|---|
| UC-A1 | Parcourir la galerie (vignettes dans leur forme réelle) et filtrer par collection |
| UC-A2 | Ouvrir la fiche d'une photo, choisir un format parmi ceux proposés, le cadre et la quantité, voir le prix |
| UC-A3 | Gérer son panier : même photo ou photos différentes, quantités, retrait d'une ligne, port annoncé |
| UC-A4 | Passer le site en anglais |
| UC-A5 | Valider son panier : coordonnées, retrait (lieu affiché, gratuit) ou livraison (adresse, port), message, consentement |
| UC-A6 | Voir la confirmation « commande transmise à la photographe », puis être recontacté par Ines |
| UC-A7 | Consulter À propos, Contact et les pages légales |
| UC-A8 | Demander la suppression de ses données (par email à Ines) |

### Ines (administratrice)
| ID | Cas d'usage |
|---|---|
| UC-I1 | Se connecter, se déconnecter, réinitialiser un mot de passe oublié |
| UC-I2 | Recevoir une alerte email pour chaque commande et répondre directement à l'acheteur |
| UC-I3 | Voir son tableau de bord : commandes à traiter, chiffres du mois, photos les plus demandées |
| UC-I4 | Suivre une commande : statut, notes internes, coordonnées, port et total |
| UC-I5 | Exporter les commandes dans Excel |
| UC-I6 | Ajouter, modifier, masquer ou supprimer une photo (réduction et filigrane automatiques) |
| UC-I7 | Créer et organiser des collections |
| UC-I8 | Gérer ses formats : ajouter, modifier (prix, cadre, port), désactiver, supprimer |
| UC-I9 | Modifier le lieu de retrait, les textes du site et les informations légales |
| UC-I10 | Anonymiser ou supprimer une commande |

### Automatique (système)
| ID | Cas d'usage |
|---|---|
| UC-S1 | Anonymiser chaque jour les commandes de plus d'un an |
| UC-S2 | Bloquer les envois répétés (plus de 3 commandes en 15 min avec le même email) et les robots (champ piège) |
| UC-S3 | Recalculer les prix et le port côté serveur, sans jamais faire confiance au navigateur |

---

## 5. Plan de test

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

### Mot de passe oublié (UC-I1)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| MP-01 | Demande avec une adresse inconnue, puis avec celle de l'admin | Même message dans les deux cas (on ne révèle pas l'adresse admin) | Auto | ✅ |
| MP-02 | Email envoyé | Un seul email, vers l'admin | Auto | ✅ |
| MP-03 | Clic sur le lien reçu | Page « nouveau mot de passe » | Auto | ✅ |
| MP-04 | Mot de passe de moins de 10 caractères | Refus avec message | Auto | ✅ |
| MP-05 | Nouveau mot de passe, déconnexion, reconnexion | Connexion avec le nouveau mot de passe | Auto | ✅ |
| MP-06 | Lien invalide ou expiré | Retour à la connexion avec un message clair | Auto | ✅ |
| MP-07 | Sur le vrai site : email reçu dans la boîte d'Ines, lien fonctionnel | Réinitialisation réussie | Manuel | 🔲 |

### Formats et prix (UC-I8)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| FM-01 | Page Formats après installation | Les 4 formats par défaut | Auto | ✅ |
| FM-02 | Montant invalide | Refus, saisie conservée | Auto | ✅ |
| FM-03 | Ajouter un 5ᵉ format | Ajouté et proposé sur les fiches | Auto | ✅ |
| FM-04 | Désactiver un format présent dans un panier | Ligne retirée du panier avec un message | Auto | ✅ |
| FM-05 | Format désactivé | N'est plus proposé sur les fiches | Auto | ✅ |

### Réglages, collections, photos (UC-I6, I7, I9)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| RG-01 | Enregistrer email d'alerte, lieu de retrait, textes, légal | Message « Réglages enregistrés », valeurs visibles sur le site | Auto | ✅ |
| CO-01 | Créer deux collections | Collections créées, formulaire vidé | Auto | ✅ |
| PH-01 | Ajouter trois photos (dont une en paysage) avec collections | Photos listées dans l'admin | Auto | ✅ |
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
| GA-04 | Photos droites | Aucune rotation | Auto | ✅ |
| GA-05 | Photo masquée | Absente de la galerie, page en 404 | Auto | ✅ |
| GA-06 | Photo en paysage | Vignette en paysage, non rognée | Auto | ✅ |
| FI-01 | Formats sur la fiche | Tous les formats actifs, du plus petit au plus grand | Auto | ✅ |
| FI-02 | Prix format + cadre | 20 × 30 : 35 € puis 41 € avec cadre · 40 × 60 avec cadre : 80 € · 60 × 90 avec cadre : 132 € | Auto + Unit | ✅ |
| FI-03 | Quantité | Plafonnée entre 1 et 10 | Auto | ✅ |

### Panier, port et langue (UC-A3, A4)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| PA-01 | Ajouter deux fois la même configuration | Quantités additionnées sur une seule ligne | Auto | ✅ |
| PA-02 | Plusieurs photos et formats | Sous-total juste (390 €) | Auto | ✅ |
| PA-03 | Modifier une quantité | Total mis à jour | Auto | ✅ |
| PA-04 | Retirer une ligne | Ligne supprimée | Auto | ✅ |
| PA-05 | Recharger la page | Panier conservé | Auto | ✅ |
| PO-01 | Panier | Port annoncé au montant du plus grand format (12 €), retrait gratuit | Auto + Unit | ✅ |
| PO-02 | Commande en retrait | Port gratuit, total = tirages seuls | Auto | ✅ |
| PO-03 | Commande en livraison | Port ajouté une seule fois (12 €), total 287 € | Auto + Unit | ✅ |
| PO-04 | Détail admin de la commande | Format, port et total affichés | Auto | ✅ |
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
| CM-08 | Prix modifié dans le navigateur (outil de développement) | Le serveur recalcule, le prix enregistré reste juste | Unit + revue | ✅ |
| CM-09 | Page de remerciement | « Transmise à la photographe », aucune promesse d'email | Auto | ✅ |
| CM-10 | Robot qui remplit le champ piège | Faux message de succès, aucune commande enregistrée | Auto | ✅ |
| RT-01 | Choix du retrait | Lieu de retrait réglé dans l'admin affiché | Auto | ✅ |
| EM-01 | Alerte reçue par Ines (vraie clé Resend, compte Resend = email des alertes) | Email reçu, « Répondre » écrit à l'acheteur | Manuel | 🔲 |
| EM-02 | Récapitulatif acheteur (après achat et vérification d'un domaine) | Email en FR ou en EN selon la langue du site | Manuel | 🔲 |
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
| CD-05 | Ines augmente un prix après une commande | La commande garde ses montants | Auto | ✅ |
| EX-01 | Export CSV | Fichier avec les commandes, colonne Port | Auto | ✅ |
| EX-02 | Texte commençant par `=` ou `+` | Neutralisé (pas de formule exécutée dans Excel) | Auto + Unit | ✅ |
| EX-03 | Ouvrir l'export dans Excel sur le PC ou le Mac d'Ines | Accents et colonnes corrects | Manuel | 🔲 |

### Données personnelles (UC-S1, A8)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| RP-01 | Anonymisation manuelle | Coordonnées effacées, montant conservé | Auto | ✅ |
| RP-02 | Tâche quotidienne appelée sans secret, puis avec | Refus (401), puis exécution (200) | Auto | ✅ |
| RP-05 | Commande de plus d'un an, puis tâche quotidienne | Coordonnées effacées, montant conservé ; commande récente intacte | Auto | ✅ |
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

## 6. Lancer la recette automatique

```bash
npx supabase start                     # base locale (Docker), avec le serveur d'emails de test
npx supabase db reset                  # base vierge, migrations appliquées
# créer le compte admin de test (voir README), renseigner .env.local, puis :
npm run build && npm start &
E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_CRON_SECRET=… E2E_SUPABASE_SECRET=… npm run test:e2e
```

Le script affiche une ligne ✓ ou ✗ par vérification, puis « Recette OK ». Il doit être lancé sur une base vierge : il vérifie par exemple que la première commande porte le numéro IB-0001, et il change le mot de passe admin pendant le test du mot de passe oublié.
