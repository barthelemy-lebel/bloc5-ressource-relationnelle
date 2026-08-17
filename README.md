# (RE)Sources Relationnelles

Plateforme citoyenne de partage de ressources autour de la qualité des
relations humaines.

Ce dépôt correspond au bloc de compétences **INFCDAAL3 — Déployer et sécuriser
les applications informatiques**. Il porte donc l'industrialisation de
l'application : conteneurisation, intégration continue, déploiement automatisé,
sécurisation et maintenance.

---

## Sommaire

- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Structure du dépôt](#structure-du-dépôt)
- [Qualité et tests](#qualité-et-tests)
- [Sécurité](#sécurité)
- [Intégration et déploiement continus](#intégration-et-déploiement-continus)
- [Environnements](#environnements)
- [Contribuer](#contribuer)
- [Limites connues](#limites-connues)

---

## Architecture

L'application est une **application monopage (SPA) statique** : HTML, CSS et
JavaScript sans dépendance de production, servie par nginx dans un conteneur.

```
Navigateur
    │  HTTPS
    ▼
Reverse proxy (terminaison TLS)          ← en production
    │  HTTP
    ▼
Conteneur Docker
    ├── nginx (non-privilégié, uid 101, port 8080)
    │     └── en-têtes de sécurité : CSP, HSTS, X-Frame-Options…
    └── /usr/share/nginx/html  (lecture seule)
          ├── index.html
          ├── app.js         — navigation, filtres, formulaires
          ├── utils.js       — fonctions pures, testées unitairement
          ├── style.css
          └── build-info.json — version et commit déployés
```

**Pourquoi une image conteneurisée pour un site statique ?** Parce que
l'artefact déployé n'est alors plus « des fichiers copiés quelque part », mais
une image immuable et horodatée, identifiée par l'empreinte du commit. C'est ce
qui rend le déploiement reproductible et le retour arrière instantané.

---

## Démarrage rapide

**Prérequis :** Docker et Docker Compose. Node.js 20+ uniquement pour
l'outillage qualité.

```bash
# Lancer l'application
docker-compose up -d --build

# L'application est disponible sur http://localhost:8080
# Sonde de vivacité :        http://localhost:8080/healthz
# Version déployée :         http://localhost:8080/build-info.json

# Arrêter
docker-compose down
```

Pour l'outillage qualité :

```bash
npm ci                       # installe les dépendances de développement
npm run verify               # lint (JS, CSS, HTML) + tests unitaires
bash scripts/smoke-test.sh   # construit l'image et la teste réellement
```

---

## Structure du dépôt

| Chemin | Rôle |
|---|---|
| `app/` | Code source de l'application |
| `docker/default.conf` | Configuration nginx (routage, cache, durcissement) |
| `docker/security-headers.conf` | En-têtes de sécurité HTTP, inclus par chaque `location` |
| `Dockerfile` | Construction multi-étapes de l'image |
| `docker-compose.yml` | Environnement local et référence de durcissement |
| `scripts/smoke-test.sh` | Tests d'intégration sur le conteneur réel |
| `tests/unit/` | Tests unitaires (lanceur intégré à Node.js) |
| `.github/workflows/ci.yml` | Pipeline d'intégration continue |
| `.github/workflows/cd.yml` | Pipeline de déploiement continu |
| `.github/ISSUE_TEMPLATE/` | Modèles de tickets : anomalie, incident, évolution |
| `docs/` | Plans de sécurisation, de déploiement et documents de référence |

---

## Qualité et tests

Trois niveaux de contrôle, tous exécutés en intégration continue.

| Niveau | Outil | Ce qui est vérifié |
|---|---|---|
| Analyse statique | ESLint | Erreurs de programmation, interdiction de `eval` et assimilés |
| Analyse statique | Stylelint | Validité et cohérence des feuilles de style |
| Analyse statique | html-validate | Validité HTML et accessibilité (RGAA) |
| Tests unitaires | `node --test` | Fonctions pures — dont la neutralisation XSS |
| Tests d'intégration | `smoke-test.sh` | Conteneur réel : disponibilité, en-têtes, durcissement |

### Choix de configuration des linters

Un linter doit signaler des **défauts**, pas imposer des goûts : une
configuration produisant des dizaines d'avertissements cosmétiques finit
ignorée, et masque alors les vrais problèmes. Chaque règle désactivée l'est
avec une justification écrite dans le fichier de configuration concerné
(`eslint.config.js`, `stylelint.config.js`, `.htmlvalidate.js`).

Deux exemples :

- `prefer-native-element` est désactivée car le motif `<div role="list">` est
  un choix délibéré : appliquer `display: grid` à `<ul>/<li>` fait perdre la
  sémantique de liste dans plusieurs navigateurs.
- `no-redundant-role` est désactivée car `<ul role="list">` restaure la
  sémantique que Safari retire dès qu'on applique `list-style: none`.

### Tests unitaires

Chaque fonction est couverte selon quatre axes : cas nominal, cas invalide,
cas de sécurité et cas limite. Exemple pour `escHtml()`, qui neutralise les
injections HTML :

```bash
npm test
# 15 tests, dont : balise <script>, évasion d'attribut par guillemet,
# évasion par apostrophe, entrées nulles, chaînes longues.
```

---

## Sécurité

Les mesures ci-dessous sont **effectivement en place et vérifiées
automatiquement** par `scripts/smoke-test.sh`, exécuté à chaque exécution de la CI.

### En-têtes HTTP

| En-tête | Menace traitée |
|---|---|
| `Content-Security-Policy` | Injection de script (XSS) |
| `X-Content-Type-Options: nosniff` | Réinterprétation d'un fichier en script |
| `X-Frame-Options: DENY` | Détournement de clic (clickjacking) |
| `Referrer-Policy` | Fuite d'URL vers des tiers |
| `Permissions-Policy` | Accès abusif aux capteurs du navigateur |
| `Strict-Transport-Security` | Rétrogradation SSL, interception (MITM) |

La CSP n'autorise **ni `unsafe-inline` ni `unsafe-eval`**, ce qui constitue le
niveau de protection le plus élevé. Ce résultat a exigé un travail préalable :
l'application ne comportait aucun script inline, mais sept attributs
`style="width:NN%"` ont dû être externalisés en classes CSS (`.pct-*`).

> **Piège nginx rencontré, et corrigé.** Un bloc `location` déclarant son
> propre `add_header` fait perdre **tous** les `add_header` hérités du bloc
> `server`. Comme `try_files` provoque une redirection interne vers
> `location = /index.html`, qui définit `Cache-Control`, la page d'accueil ne
> renvoyait aucun en-tête de sécurité. Le test de fumée a détecté la
> régression ; la parade est le fichier `security-headers.conf`, inclus
> explicitement dans chaque `location` concerné.

### Durcissement du conteneur

| Mesure | Menace traitée |
|---|---|
| Utilisateur non-root (uid 101) | Élévation de privilèges, évasion de conteneur |
| Racine en lecture seule | Persistance d'un attaquant, défiguration |
| `cap_drop: ALL` | Évasion de conteneur via les capacités Linux |
| Construction multi-étapes | Ni Node ni npm dans l'image finale |
| Limites CPU et mémoire | Déni de service par épuisement de ressources |
| Rotation des journaux | Saturation disque |

### Contrôles automatisés en CI

- `npm audit` — vulnérabilités connues des dépendances
- **Hadolint** — bonnes pratiques du Dockerfile
- **Trivy** (dépôt) — vulnérabilités, **secrets commités**, erreurs de configuration
- **Trivy** (image) — vulnérabilités des couches système
- **Test de fumée** — vérifie que chaque en-tête de sécurité est réellement émis
- **Dependabot** — ouvre une PR dès qu'une version corrigée d'une dépendance,
  d'une action GitHub ou de l'image de base est publiée

> **Ces contrôles ont déjà servi.** Trivy a détecté 10 vulnérabilités
> CRITICAL/HIGH corrigeables (openssl, libxml2, musl, nghttp2, zlib) dans
> l'image de base `nginx-unprivileged:1.27-alpine`. Le déploiement a été
> bloqué, la base est passée à `1.30.4-alpine` — vérifiée à 0 vulnérabilité —
> et Dependabot signalera désormais la suivante automatiquement.

---

## Intégration et déploiement continus

### `ci.yml` — à chaque push et chaque PR

Trois travaux exécutés en parallèle pour un retour rapide :

1. **qualite** — lint JS/CSS/HTML puis tests unitaires
2. **securite** — `npm audit`, Hadolint, Trivy (vulnérabilités, secrets, configuration)
3. **conteneur** — construction de l'image, test de fumée, analyse Trivy de l'image

### `cd.yml` — sur la branche `main` et les tags `v*.*.*`

1. **publier-image** — construit l'image et la pousse sur GHCR, étiquetée par
   empreinte de commit et par version, avec inventaire logiciel (SBOM) et
   attestation de provenance
2. **deployer-pages** — publie le site et son `build-info.json`
3. **verifier-deploiement** — interroge l'URL **en ligne** et compare le commit
   déployé au commit attendu

Cette troisième étape est essentielle : un pipeline vert ne prouve pas qu'un
déploiement a abouti. Seule l'interrogation du service en ligne le prouve.

### Retour arrière (rollback)

Chaque image est étiquetée par l'empreinte de son commit. Revenir en arrière
consiste à redéployer l'étiquette précédente — sans reconstruction, donc sans
risque d'obtenir un artefact différent :

```bash
docker pull ghcr.io/<compte>/<dépôt>:sha-9f8e7d6
docker-compose up -d
curl -s https://<url>/build-info.json   # confirmer la version rétablie
```

---

## Environnements

| Environnement | Déclencheur | Cible |
|---|---|---|
| Développement | local | `docker-compose up` sur `localhost:8080` |
| Intégration | push, PR | Runners GitHub Actions (éphémères) |
| Production | push sur `main` | GitHub Pages + image publiée sur GHCR |

**Prérequis de provisionnement (à faire une seule fois).** GitHub Pages doit
être activé dans `Settings → Pages → Source : GitHub Actions`. Le jeton du
pipeline ne peut pas créer le site lui-même (`Resource not accessible by
integration`). Il s'agit d'un acte de provisionnement de l'environnement
cible, distinct du déploiement : on ne recrée pas le serveur à chaque
livraison.

Aucun secret applicatif n'est nécessaire : l'application est statique et ne
comporte ni base de données ni service tiers. L'authentification au registre
utilise le jeton éphémère du pipeline (`GITHUB_TOKEN`), généré pour la durée de
l'exécution et expiré ensuite. **Aucun identifiant permanent n'est stocké dans
le dépôt.**

---

## Contribuer

Convention de commits : [Conventional Commits](https://www.conventionalcommits.org/fr/).

```
feat(catalogue): ajouter le filtre par type de relation
fix(moderation): corriger le compteur de ressources en attente
security(nginx): interdire unsafe-inline dans la CSP
docs(readme): documenter la procédure de retour arrière
```

Le préfixe n'est pas décoratif : il permet de générer les notes de version
automatiquement et de repérer immédiatement les commits de sécurité dans
l'historique.

Stratégie de branches : `main` (production, protégée) et `develop`
(intégration), avec des branches `feat/*`, `fix/*` et `docs/*` fusionnées par
Pull Request.

---

## Limites connues

Ces points sont documentés plutôt que dissimulés ; chacun fait l'objet d'un
ticket de suivi.

1. **Polices Google chargées depuis un tiers.** `fonts.googleapis.com` doit être
   autorisé dans la CSP, et le chargement transmet l'adresse IP du visiteur à
   un tiers hors UE. L'auto-hébergement des polices durcirait la CSP et
   supprimerait ce transfert (enjeu RGPD).
2. **`no-new-privileges` désactivé en local.** Le démon Docker de la machine de
   développement est installé via Snap, dont le confinement AppArmor est
   incompatible avec ce drapeau noyau. L'option reste appliquée dans le test de
   fumée exécuté en CI. Détails dans `docker-compose.yml`.
3. **GitHub Pages n'applique pas notre configuration nginx.** Les en-têtes de
   sécurité ne s'appliquent donc pas à cette vitrine publique. La cible de
   production réelle est l'image Docker publiée sur GHCR, exécutée derrière un
   reverse proxy — configuration validée par le test de fumée en CI.
4. **L'application est un prototype sans persistance.** Les données sont
   simulées en mémoire ; il n'y a ni backend, ni base de données, ni
   authentification réelle. Le plan de sécurisation traite en conséquence
   l'architecture cible, en distinguant explicitement les mesures **mises en
   œuvre** de celles **prévues**.

---

## Licence

MIT.
