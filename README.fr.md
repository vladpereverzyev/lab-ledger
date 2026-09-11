# Lab Ledger

[![Version](https://img.shields.io/github/v/release/vladpereverzyev/lab-ledger)](https://github.com/vladpereverzyev/lab-ledger/releases/latest)
[![Téléchargements](https://img.shields.io/github/downloads/vladpereverzyev/lab-ledger/total)](https://github.com/vladpereverzyev/lab-ledger/releases)
[![Licence](https://img.shields.io/badge/licence-BUSL--1.1-blue)](LICENSE)
![Plateforme](https://img.shields.io/badge/plateforme-Windows%20%7C%20macOS%20%7C%20Linux-0078D6)
[![GitHub REST API](https://img.shields.io/badge/GitHub%20REST%20API-2022--11--28-181717?logo=github&logoColor=white)](#github-api)

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![it](https://img.shields.io/badge/lang-it-green.svg)](./README.it.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.fr.md)
[![de](https://img.shields.io/badge/lang-de-lightgrey.svg)](./README.de.md)

**Application de bureau gratuite et hors ligne pour les laboratoires
dentaires** : enregistrez ce qui sort de l'établi et voyez ce qu'il reste
vraiment en fin d'année.

<p align="center">
  <img src="src/assets/icon-256.png" alt="Lab Ledger" width="160" height="160">
</p>

### [**Essayer la démo en ligne**](https://vladpereverzyev.github.io/lab-ledger/)

Données d'exemple, rien à installer : tout reste dans votre navigateur. Vous
préférez la vraie application ? Téléchargez-la depuis la
[dernière version](https://github.com/vladpereverzyev/lab-ledger/releases/latest).

## Pourquoi Lab Ledger ?

- **Gratuite et hors ligne** : pas de compte, pas de serveur, pas d'abonnement.
  Elle s'empaquette en vraie application de bureau et s'utilise comme un
  programme normal.
- **Privée par conception** : les données restent sur votre ordinateur. Aucune
  donnée de patient ou de client n'est livrée dans le code : vous saisissez les
  vôtres en local et les sauvegardez dans des fichiers quand vous le voulez.
- **Des coûts réels** : un matériau s'achète par lot et ce lot donne un certain
  nombre d'unités utilisables. La division donne le coût d'une unité. Chaque
  type de travail déclare ce qu'il consomme : changez le prix d'un lot et tous
  les travaux qui l'utilisent suivent.
- **La vue complète** : pas seulement la marge brute. Loyer, énergie, assurance,
  comptable, personnel et impôts entrent aussi, pour que l'application réponde à
  la seule question qui compte : que reste-t-il, par an, par mois, par jour
  travaillé.

## Captures

Travaux : chaque travail avec patient, expedition, cout materiau, prix et marge.

![Vue Travaux](docs/screenshot-works.png)

Le meme ecran en clair, qui est le mode par defaut :

![Vue Travaux, clair](docs/screenshot-works-light.png)

Resume : l'annee en cartes, en graphiques et en compte de resultat.

![Vue Resume](docs/screenshot-summary.png)

![Vue Resume, clair](docs/screenshot-summary-light.png)

Catalogue : chaque type de travail relie aux materiaux qu'il consomme.

![Vue Catalogue](docs/screenshot-catalog.png)

![Vue Catalogue, clair](docs/screenshot-catalog-light.png)

## Fonctionnalités

### Travaux
- Enregistrez chaque travail : date, client, **patient** (nom complet ou une référence), type de
  travail, unités, qui l'a réalisé, et s'il est facturable ou en **reprise**.
- **Une reprise est une perte, et elle est comptée comme telle.** Elle n'est
  jamais facturée : elle consomme le matériau et ne rapporte rien, donc la
  colonne du prix affiche le coût matériau en négatif et la marge baisse
  exactement d'autant.
- **Expédition** : marquez un travail expédié avec sa date, son transporteur et
  son numéro de suivi. Filtrez par expédiés / à expédier.
- Recherchez sur client, patient, travail, opérateur, transporteur et suivi ;
  filtrez par année, mois, opérateur, expédition et reprise.

### Qui s'en sert
- **Au premier démarrage**, le programme demande les données du laboratoire et
  crée l'administrateur. Ensuite l'application s'ouvre sur un écran de connexion.
- **Les opérateurs** sont ajoutés par l'administrateur, qui coche ce que chacun
  a le droit de faire : voir les prix et les bénéfices, ajouter et modifier des
  travaux, les supprimer, modifier le catalogue, exporter et sauvegarder. Qui ne
  peut pas voir l'argent n'a ni l'onglet Résumé, ni les colonnes prix et marge,
  ni les prix du catalogue.
- **Les mots de passe ne sont jamais enregistrés** : seulement PBKDF2-SHA256 sur
  un sel aléatoire par utilisateur, 150000 tours. Un mot de passe oublié se
  réinitialise, il ne se récupère pas.
- **Un mot de passe d'administrateur oublié ne ferme pas l'archive.** La
  configuration produit un **code de récupération**, affiché une fois pour être
  noté, qui réinitialise le mot de passe de l'administrateur depuis l'écran de
  connexion. Une copie reste dans le dossier de données de l'application sur cet
  ordinateur, pour pouvoir être lue au téléphone, et l'administrateur la
  retrouve dans **Catalogue > Réglages** quand il veut. Le fichier de données à
  côté est du JSON en clair : le code n'est pas plus exposé que l'archive où il
  vous ramène, et tous deux sont protégés par qui a le droit d'utiliser cet
  ordinateur.
- **L'historique** enregistre chaque modification avec qui et quand.
  L'administrateur le lit dans Catalogue > Historique.

### Résumé
- Cartes d'activité : travaux, unités, recettes, coût matériaux, marge brute,
  reprises et ce qu'elles ont coûté.
- Des graphiques, tous construits sur vos vraies lignes : recettes et coût
  matériaux par mois (aire), marge par mois (barres, rouges quand le mois perd),
  bénéfice cumulé face à la ligne des charges fixes, travaux les plus rentables
  (barres horizontales), part des recettes par client (anneau), travaux par
  opérateur répartis facturables / reprises (barres empilées) et où vont les
  recettes (barre empilée : matériaux, charges fixes, impôts, ce qui reste).
- Cartes de rentabilité : charges fixes, impôts et cotisations, bénéfice net et
  le bénéfice **par jour travaillé, par semaine, par mois**, la moyenne par
  travail et les recettes nécessaires rien que pour atteindre l'équilibre.
- Un tableau de **compte de résultat** avec chaque poste par an, par mois, par
  jour travaillé et en pourcentage des recettes.

### Catalogue
- **Clients** : nom, email, téléphone, numéro de TVA, adresse, notes.
- **Matériaux** : coût du lot, unités par lot, unité, note. Le coût unitaire est
  la division, et il est affiché sur la ligne.
- **Types de travaux** : chacun liste les matériaux qu'il utilise et en quelle
  quantité. Le coût matériau est calculé, jamais saisi, et la marge et la marge %
  viennent avec.
- **Opérateurs** et **transporteurs** : des listes courtes où l'on choisit.
- **Charges fixes** : local (loyer, prêt, charges), énergie (électricité, gaz,
  eau), assurance, comptable, personnel et tout le reste, mensuel ou annuel,
  avec le montant annuel et mensuel sur chaque ligne.
- **Impôts et calendrier** : régime forfaitaire ou réel avec des pourcentages
  simples, plus combien de jours par semaine et de semaines par an le
  laboratoire travaille vraiment : c'est ce qui transforme un bénéfice annuel en
  bénéfice journalier.
- **Réglages** : recherche de mises à jour activée ou non, version, chemin du
  fichier de données.

### Partout
- **Importer / Exporter** : export Excel des travaux, du résumé par type, du
  catalogue et des charges fixes ; import Excel des travaux ; sauvegardes JSON
  complètes restaurables sur n'importe quel ordinateur.
- **Mode clair et sombre**, mémorisé par ordinateur.
- **Cinq langues**, et changer de langue ne déplace pas la barre d'outils :
  chaque commande a une largeur fixe.
- **S'adapte à l'écran** : sur téléphone, chaque ligne du tableau devient une
  carte dont chaque valeur porte le nom de sa colonne.
- **Une seule liste deroulante** pour tous les choix, au lieu de celle que
  chaque systeme dessine a sa facon.
- **Le symbole euro suit toujours le nombre**, dans toutes les langues.
- **Clair par defaut**, sombre en un clic, memorise par ordinateur.

## Hors ligne par conception

Lab Ledger n'est pas un produit cloud avec un mode hors ligne. C'est un
programme hors ligne, point. Les données vivent dans un fichier JSON sur votre
ordinateur : pas de compte, pas de serveur, pas de télémétrie, et rien de ce que
vous saisissez ne quitte la machine.

Il y a une seule exception, et elle se désactive : **la recherche de mises à
jour**. Une fois par jour, si vous la laissez active, l'application demande à
l'API REST publique de GitHub quelle est la dernière version et la compare à la
vôtre. C'est le seul moment où Lab Ledger utilise internet. Elle n'envoie aucun
compte, aucun identifiant et rien de vos travaux, clients ou patients ; et elle
ne télécharge un installateur que lorsque vous le demandez par le bouton. Désactivez-la dans
**Catalogue > Réglages** et l'application ne fait aucun appel réseau. Voir
[GitHub API](#github-api).

## Le fichier Excel associé

Un laboratoire a déjà un dossier qui se synchronise, et tout le monde autour
sait ouvrir un tableur sans rien installer. Alors Lab Ledger l'écrit.

Indiquez-lui un fichier dans **Catalogue > Réglages** et l'application le
réécrit à chaque ouverture et à chaque fermeture. Placez-le dans le dossier que
votre cloud synchronise déjà et les chiffres du laboratoire voyagent avec lui,
partageables par vous, avec qui vous voulez, sans que personne n'installe
l'application. Lab Ledger ne téléverse toujours rien : il écrit seulement un
fichier local.

Huit feuilles lisibles telles quelles : travaux, l'année mois par mois,
matériaux avec le coût d'une unité, types de travaux avec leurs recettes et
leurs prix, charges fixes, cabinets, opérateurs, et une feuille Info avec la
version et le copyright.

C'est un fichier volontairement simple : des valeurs, pas de macros, pas de
tableaux croisés, aucune formule qu'un seul programme comprend, largeurs de
colonnes réglées. Microsoft Excel, Google Sheets, LibreOffice et Numbers
l'ouvrent **et le modifient** de la même façon. Désactivé par défaut.

## Langues

L'interface est disponible en **anglais, italien, espagnol, français et
allemand** : basculez avec le bouton de langue de la barre. Ajouter une langue
est une contribution de traduction uniquement : voir
[CONTRIBUTING.md](CONTRIBUTING.md).

## GitHub API

[![GitHub REST API](https://img.shields.io/badge/Powered%20by%20the-GitHub%20REST%20API-181717?logo=github&logoColor=white)](https://docs.github.com/rest)

Lab Ledger utilise l'**API REST GitHub** pour une seule chose : vous dire qu'une
version plus récente existe.

| | |
|---|---|
| Endpoint | `GET /repos/vladpereverzyev/lab-ledger/releases/latest` |
| Version de l'API | `X-GitHub-Api-Version: 2022-11-28` |
| Authentification | aucune : l'API publique non authentifiée |
| Limite d'appels | les 60 par heure et par IP de l'API publique ; l'application demande au plus une fois par jour |
| Ce qui est envoyé | la requête et un `User-Agent` `LabLedger/<version>`. Pas de compte, pas d'identifiant, rien de vos travaux, clients ou patients |
| Ce qui est reçu | le tag de la dernière version et l'URL de sa page |
| Ensuite | le tag est comparé à la version installée ; s'il est plus récent, une fenêtre s'ouvre. Sur **Télécharger**, l'application récupère elle-même l'installateur adapté à votre système dans le dossier Téléchargements et propose de le lancer. Sans ce bouton, elle ne télécharge et n'installe rien |

La vérification se désactive dans **Catalogue > Réglages** ; désactivée,
l'application ne fait aucun appel réseau. On y trouve aussi la version installée
et la version de l'API GitHub utilisée ; la version est également dans la barre
du haut : cliquez dessus pour vérifier les mises à jour à la main.

GitHub et le logo GitHub sont des marques de GitHub, Inc. Lab Ledger est un
projet indépendant, sans affiliation, parrainage ni approbation de
GitHub.

## Où sont stockées les données

Vos données vivent dans un unique fichier JSON local, dans le dossier de données
de l'application - le chemin exact est indiqué dans **Catalogue > Réglages**.
Rien n'est envoyé nulle part. Utilisez **Sauvegarde** pour en garder une copie et
**Importer sauvegarde** pour la restaurer.

## Lancer depuis les sources

Nécessite [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start
```

## Compiler

```bash
npm run dist
```

Les installeurs sont produits dans le dossier `release/` : installeur NSIS et
`.exe` portable sous Windows, `.dmg` et `.zip` sous macOS, `AppImage` et `.deb`
sous Linux.

Les icônes se régénèrent depuis `build/icon.svg` avec
[Pillow](https://pillow.readthedocs.io/) :

```bash
python -m pip install pillow
python build/make-icons.py
```

## Technique

- [Electron](https://www.electronjs.org/) - coque de bureau
- [Chart.js](https://www.chartjs.org/) - graphiques (embarqués, sans CDN)
- [SheetJS](https://sheetjs.com/) - import/export Excel
- [API REST GitHub](https://docs.github.com/rest) - recherche de mises à jour

## Comment il a été écrit

Lab Ledger est le travail d'un prothésiste dentaire, pas d'une société de
logiciels. Une partie du code a été écrite avec l'aide de Claude, l'assistant
IA d'Anthropic. Les décisions sur ce que le logiciel doit faire, la relecture de
ce qui en est sorti et les essais à la paillasse sont celles de l'auteur, tout
comme la responsabilité du résultat.

## Contribuer

Les contributions sont bienvenues, surtout les traductions. Voir
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Lab Ledger est **source-available**, pas open source : libre d'usage dans votre
propre laboratoire, pas libre à la revente. À partir de la version 1.3.0
s'applique la [Business Source License 1.1](LICENSE).

- **Tout laboratoire dentaire ou cabinet peut l'utiliser en production,
  gratuitement** - sur autant de postes et de sites qu'il veut - et peut payer
  quelqu'un pour l'installer, l'héberger, l'entretenir ou l'adapter.
- **Une licence commerciale est nécessaire** pour fournir Lab Ledger, ou une
  version modifiée, à des tiers contre paiement : comme produit, comme service
  hébergé, avec du matériel ou intégré à un autre logiciel. Écrivez à
  <info@vladpereverzyev.com>.
- **Le 2030-09-11 cette version devient Apache 2.0** automatiquement. Chaque
  publication porte sa propre date, quatre ans après sa sortie.
