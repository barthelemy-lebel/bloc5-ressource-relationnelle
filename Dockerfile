# ==============================================================================
# (RE)Sources Relationnelles — Image applicative
# ==============================================================================
# Construction multi-étapes (multi-stage build).
#
# POURQUOI MULTI-ÉTAGES ?
# L'étape « builder » dispose de Node.js pour préparer l'artefact de
# déploiement. L'étape finale ne contient QUE nginx et les fichiers statiques :
# ni Node, ni npm, ni sources de build. Bénéfices :
#   - Surface d'attaque réduite  : pas d'interpréteur exploitable dans l'image
#     de production (un attaquant qui obtient l'exécution de commandes n'y
#     trouve ni node, ni npm, ni gestionnaire de paquets).
#   - Taille réduite             : ~50 Mo au lieu de ~400 Mo.
#   - Reproductibilité           : versions de base épinglées.
# ==============================================================================

# ------------------------------------------------------------------------------
# ÉTAPE 1 — Builder : prépare l'artefact statique et les métadonnées de version
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Métadonnées de traçabilité, injectées par la CI (voir .github/workflows/).
# Elles permettent de savoir EXACTEMENT quel commit tourne en production :
# indispensable pour le diagnostic d'incident et le rollback.
ARG VERSION=0.0.0-dev
ARG GIT_SHA=local
ARG BUILD_DATE=unknown

WORKDIR /build

# Copie des sources applicatives (voir .dockerignore pour les exclusions).
COPY app/ ./dist/

# Génération du fichier de version, servi sur /build-info.json.
# Permet de vérifier en une requête HTTP quelle version est déployée.
RUN printf '{\n  "name": "resources-relationnelles",\n  "version": "%s",\n  "commit": "%s",\n  "buildDate": "%s"\n}\n' \
      "$VERSION" "$GIT_SHA" "$BUILD_DATE" > ./dist/build-info.json \
    && echo "Artefact préparé :" && ls -la ./dist

# ------------------------------------------------------------------------------
# ÉTAPE 2 — Runtime : nginx non-privilégié
# ------------------------------------------------------------------------------
# On utilise nginxinc/nginx-unprivileged plutôt que l'image nginx officielle :
# elle s'exécute sous l'utilisateur uid 101 et non sous root.
#
# MENACE TRAITÉE : élévation de privilèges. Si une faille de nginx permettait
# l'exécution de code, l'attaquant hériterait des droits root DANS le conteneur,
# ce qui facilite grandement une évasion vers l'hôte. Ici, il n'obtient qu'un
# compte non privilégié.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Étiquettes OCI standard : identifient l'image dans le registre (GHCR).
LABEL org.opencontainers.image.title="(RE)Sources Relationnelles" \
      org.opencontainers.image.description="Plateforme citoyenne de ressources relationnelles" \
      org.opencontainers.image.licenses="MIT"

ARG VERSION=0.0.0-dev
ARG GIT_SHA=local
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$GIT_SHA" \
      org.opencontainers.image.created="$BUILD_DATE"

# Configuration nginx durcie (en-têtes de sécurité, CSP, etc.).
# Copiée en root avant la bascule d'utilisateur, pour que l'applicatif
# ne puisse pas modifier sa propre configuration à l'exécution.
USER root
COPY docker/security-headers.conf /etc/nginx/security-headers.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /usr/share/nginx/html

# Les fichiers servis appartiennent à root et sont en lecture seule pour nginx.
# MENACE TRAITÉE : défiguration (defacement). Même compromis, le processus
# nginx ne peut pas réécrire les pages qu'il sert.
RUN chown -R root:root /usr/share/nginx/html \
    && chmod -R a-w,a+rX /usr/share/nginx/html

# Retour à l'utilisateur non privilégié fourni par l'image de base.
USER 101

EXPOSE 8080

# Sonde de vivacité : Docker redémarre/signale le conteneur s'il ne répond plus.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
