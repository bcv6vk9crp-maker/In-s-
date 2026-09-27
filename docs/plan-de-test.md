# Ines. B — cas d'usage et plan de test

Ce document décrit ce que l'application doit permettre et comment le vérifier avant la mise en ligne. Il commence par les décisions prises avec Ines et par les questions encore ouvertes.

- **Tests automatiques** : `npm test` (règles de calcul, 24 tests) et `npm run test:e2e` (parcours complet dans un navigateur, 93 vérifications, voir `e2e/parcours.mjs`).
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
| Protection des photos | Grande image de la fiche couverte d'un filigrane « © Ines. B » répété et incrusté dans le fichier ; galerie en vignette réduite ; clic droit « Enregistrer l'image » désactivé sur les photos. Une capture d'écran ne peut pas être empêchée, mais elle reste inutilisable |
| Galerie (N1) | Grille alignée : chaque photo entière dans un passe-partout de même taille, ordre lu ligne par ligne |
| Formats par photo (N2) | Ines coche les formats possibles pour chaque photo (tous par défaut) |
| Zone de livraison (N3) | France métropolitaine uniquement, Corse comprise ; le retrait reste possible pour tous |
| Délai de réponse (N5) | « Ines vous répond sous 48 h » sur la commande, la confirmation et l'email |
| Aperçu du cadre (N6) | Texte seulement |
| Nouvelles collections (N7) | Pas de liste d'abonnés pour l'instant |
| Fabrication (QA-2) | Un texte commun à toutes les fiches, modifiable dans les réglages |
| Libellés | « Frais de port » partout (et non « port ») |
| Style des textes | Pas d'écriture manuscrite : la petite phrase sous les titres et le « Merci ! » sont en texte sobre (italique discret) |
| Formulaire de commande | Prénom, nom, email, téléphone et adresse postale obligatoires, **y compris en retrait**. Case d'accord obligatoire. Seul le message est facultatif |
| Retrait | Lieu de retrait réglé dans l'admin, affiché à l'acheteur |
| Contenus | Ines saisit elle-même ses emails, son Instagram, ses collections et ses photos dans l'admin |

## 2. En attente (retours d'Ines sur le prototype)

| # | Sujet | Ce qu'il faut | En attendant |
|---|---|---|---|
| N4 | Moyens de paiement annoncés | Liste des moyens acceptés par Ines (virement, Wero, Lydia, espèces au retrait…) et conditions de vente associées | Rien n'est affiché |
| QA-3 | Textes À propos et Contact, version anglaise | Ce qu'Ines souhaite écrire | Textes vides, saisissables dans l'admin |
| QA-5 | Statut légal d'Ines | Ines se renseigne (micro-entreprise, artiste-auteur…) | « [à compléter] » sur les pages légales, **bloquant pour l'ouverture réelle** |
| QA-4 | Création des comptes Supabase, Resend et Vercel | Séance ensemble, environ 30 min (décidé) | **Bloquant pour la mise en ligne** |
| UC-A7 / UC-I9 | Pages À propos, Contact, légales, lieu de retrait, emails | Contenus fournis par Ines, saisis ensemble | Textes d'exemple |
| UC-I2 | Alerte email de commande | L'adresse email d'Ines, puis un test réel (EM-01) | Non testé en réel |
| UC-I1 | Connexion et mot de passe oublié sur le vrai site | À tester en dernier, après la création des comptes (MP-07) | Testé en local uniquement |

### Validation des cas d'usage par Ines (prototype)

| Statut | Cas d'usage |
|---|---|
| ✅ Validés | UC-A1 à UC-A6, UC-I3, UC-I4, UC-I5, UC-I6, UC-I8, UC-I9, UC-I10 |
| 🔧 Corrigé, à revalider | UC-I7 : page de modification d'une photo (titre et description mal placés), aperçu désormais au-dessus des champs |
| ⏳ À voir avec Ines | UC-A7 (textes et pages légales), UC-I1 (connexion, à tester en dernier), UC-I2 (alerte email) ; questions N4, QA-3, QA-5 |

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
| UC-A5 | Valider son panier : prénom, nom, email, téléphone et adresse postale **obligatoires**, retrait (lieu affiché, gratuit) ou livraison (port), message facultatif, case d'accord obligatoire |
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
| PH-03 | Galerie | Vignette de 900 px maximum, signée dans le coin | Auto | ✅ |
| PH-04 | Fiche | Grande image distincte, 1600 px maximum | Auto | ✅ |
| PH-05 | Filigrane de la grande image | Présent sur les quatre quarts de la photo (mesure des pixels) | Auto | ✅ |
| PH-08 | Vraies photos d'Ines : filigrane lisible sur zones claires (neige, ciel) et sombres, sans gâcher la photo | Validation visuelle par Ines | Manuel | 🔲 |
| PH-06 | Vraies photos d'Ines : paysage, carré, très grand fichier (plus de 30 Mo) | Filigrane lisible, envoi en quelques secondes | Manuel | 🔲 |
| PH-07 | Photo prise sur iPhone (HEIC), envoyée depuis l'iPhone | L'image est acceptée (Safari la convertit en JPEG) | Manuel | 🔲 |

### Galerie et fiche (UC-A1, A2)
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| GA-01 | Afficher la galerie | Toutes les photos visibles | Auto | ✅ |
| GA-02 | Filtrer par collection, photo présente dans deux collections | Bon sous-ensemble | Auto | ✅ |
| GA-03 | Petite phrase de collection | Affichée en italique sobre sous le titre | Auto | ✅ |
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
| CM-02 | Sans cocher la case d'accord | Commande non envoyée | Auto + Unit | ✅ |
| CM-03 | Pays de l'adresse | Prérempli (France) | Auto | ✅ |
| CM-11 | Prénom, nom, email, téléphone, adresse, code postal ou ville vide (même en retrait) | Commande non envoyée | Auto + Unit | ✅ |
| CM-12 | Téléphone de moins de 6 chiffres ou adresse vide, garde-fous du navigateur contournés | Refus par le serveur, champs signalés en rouge | Auto + Unit | ✅ |
| CM-04 | Retrait en main propre | Commande acceptée, port gratuit | Auto | ✅ |
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

### Retours d'Ines sur le prototype
| ID | Cas | Résultat attendu | Type | Statut |
|---|---|---|---|---|
| GA-07 | Galerie (N1) | Tous les passe-partout ont la même taille, photos entières | Auto | ✅ |
| FI-04 | Texte de fabrication (QA-2) | Affiché sur chaque fiche | Auto | ✅ |
| PF-01 | Format retiré pour une photo (N2) | N'est plus proposé sur sa fiche | Auto + Unit | ✅ |
| PF-02 | Même format, autre photo | Toujours proposé | Auto | ✅ |
| PF-03 | Format retiré alors qu'il est dans un panier | Ligne enlevée à la commande, avec un message | Auto | ✅ |
| ZO-01 | Livraison (N3) | Pays fixé sur France, zone annoncée | Auto | ✅ |
| ZO-02 | Code postal d'outre-mer en livraison | Refusé, champ signalé | Auto + Unit | ✅ |
| CM-13 | Délai de réponse (N5) | « Sous 48 h » sur la confirmation | Auto | ✅ |
| FA-01 | Photo verticale ouverte en grand (retour UC-A1) | Entière, jamais plus haute que l'écran, sur ordinateur et téléphone | Manuel (Ines) | 🔲 |

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
