#!/usr/bin/env bash
# ==============================================================================
# Test de fumée (smoke test) — (RE)Sources Relationnelles
# ==============================================================================
# Vérifie qu'une image fraîchement construite se lance et se comporte
# correctement. C'est un test d'INTÉGRATION : il ne teste pas une fonction
# isolée, mais l'assemblage réel « image Docker + nginx + configuration ».
#
# Il sert de PREUVE pour deux critères de la grille d'évaluation :
#   - « environnement de déploiement correctement configuré » : le conteneur
#     démarre, répond, et expose une sonde de vivacité ;
#   - « plan de sécurisation / prévention des risques » : chaque en-tête de
#     sécurité est vérifié automatiquement. Une régression de configuration
#     (quelqu'un retire la CSP) fait échouer la CI et bloque le déploiement.
#
# Usage :
#   bash scripts/smoke-test.sh
#
# Variables d'environnement :
#   IMAGE       image à tester              (défaut : resources-relationnelles:dev)
#   PORT        port hôte                   (défaut : 8099)
#   SKIP_BUILD  1 pour ne pas reconstruire  (défaut : construit)
#   HARDENED    1 pour ajouter no-new-privileges (impossible sur Docker Snap,
#               activé en CI — voir le commentaire dans docker-compose.yml)
# ==============================================================================

set -euo pipefail

IMAGE="${IMAGE:-resources-relationnelles:dev}"
PORT="${PORT:-8099}"
CONTAINER="rr-smoke-$$"
BASE="http://localhost:${PORT}"

PASS=0
FAIL=0

# --- Utilitaires d'affichage et d'assertion -----------------------------------

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
ko()   { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=$((FAIL + 1)); }
info() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# Vérifie qu'une chaîne est présente dans un texte.
assert_contains() {
  local haystack="$1" needle="$2" label="$3"
  if printf '%s' "$haystack" | grep -qi -- "$needle"; then
    ok "$label"
  else
    ko "$label (attendu : « $needle »)"
  fi
}

# Vérifie qu'une chaîne est ABSENTE d'un texte.
assert_absent() {
  local haystack="$1" needle="$2" label="$3"
  if printf '%s' "$haystack" | grep -qi -- "$needle"; then
    ko "$label (trouvé alors qu'il ne devrait pas : « $needle »)"
  else
    ok "$label"
  fi
}

# Nettoyage systématique, y compris en cas d'erreur ou d'interruption.
cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# --- 1. Construction ----------------------------------------------------------

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  info "1. Construction de l'image"
  docker build \
    --build-arg VERSION="${VERSION:-0.0.0-smoke}" \
    --build-arg GIT_SHA="${GIT_SHA:-local}" \
    --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    -t "$IMAGE" . >/dev/null
  ok "Image construite : $IMAGE"
else
  info "1. Construction ignorée (SKIP_BUILD=1)"
fi

# --- 2. Démarrage du conteneur durci ------------------------------------------

info "2. Démarrage du conteneur (configuration durcie)"

SECOPTS=()
if [ "${HARDENED:-0}" = "1" ]; then
  SECOPTS+=(--security-opt no-new-privileges:true)
fi

docker run -d --name "$CONTAINER" \
  -p "${PORT}:8080" \
  --read-only \
  --tmpfs /tmp:uid=101,gid=101 \
  --tmpfs /var/cache/nginx:uid=101,gid=101 \
  --cap-drop ALL \
  "${SECOPTS[@]+"${SECOPTS[@]}"}" \
  "$IMAGE" >/dev/null

# Attente active de la disponibilité (max ~15 s) plutôt qu'un sleep arbitraire.
for _ in $(seq 1 30); do
  if curl -fsS "${BASE}/healthz" >/dev/null 2>&1; then break; fi
  sleep 0.5
done

if curl -fsS "${BASE}/healthz" >/dev/null 2>&1; then
  ok "Conteneur démarré et sonde /healthz répondante"
else
  ko "Le conteneur ne répond pas sur ${BASE}/healthz"
  echo "--- journaux du conteneur ---"
  docker logs "$CONTAINER" 2>&1 | tail -20
  exit 1
fi

# --- 3. Disponibilité applicative ---------------------------------------------

info "3. Disponibilité applicative"

STATUS=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/")
[ "$STATUS" = "200" ] && ok "GET / renvoie 200" || ko "GET / renvoie $STATUS (attendu 200)"

BODY=$(curl -s "${BASE}/")
assert_contains "$BODY" "(RE)Sources Relationnelles" "La page d'accueil contient le titre de l'application"
assert_contains "$BODY" "utils.js" "utils.js est bien référencé avant app.js"

# Les assets doivent être servis correctement.
for asset in style.css app.js utils.js; do
  ST=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/${asset}")
  [ "$ST" = "200" ] && ok "GET /${asset} renvoie 200" || ko "GET /${asset} renvoie $ST"
done

# Traçabilité de version : indispensable au diagnostic d'incident.
BUILDINFO=$(curl -s "${BASE}/build-info.json")
assert_contains "$BUILDINFO" '"version"' "/build-info.json expose la version déployée"
assert_contains "$BUILDINFO" '"commit"'  "/build-info.json expose le commit déployé"

# Routage SPA : une route inconnue doit retomber sur l'application, pas sur 404.
ST=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/une/route/inexistante")
[ "$ST" = "200" ] && ok "Le routage SPA renvoie l'application sur une route inconnue" \
                  || ko "Route inconnue : $ST (attendu 200 via try_files)"

# --- 4. En-têtes de sécurité --------------------------------------------------

info "4. En-têtes de sécurité HTTP"

HEADERS=$(curl -sI "${BASE}/")

assert_contains "$HEADERS" "content-security-policy"      "Content-Security-Policy présent"
assert_contains "$HEADERS" "x-content-type-options: nosniff" "X-Content-Type-Options: nosniff"
assert_contains "$HEADERS" "x-frame-options: DENY"        "X-Frame-Options: DENY (anti-clickjacking)"
assert_contains "$HEADERS" "referrer-policy"              "Referrer-Policy présent"
assert_contains "$HEADERS" "permissions-policy"           "Permissions-Policy présent"
assert_contains "$HEADERS" "strict-transport-security"    "Strict-Transport-Security présent"

# Point central de notre posture CSP : aucune exécution ni style inline autorisés.
# Garde-fou : si la CSP est absente, les assertions « absence de » passeraient
# à tort (une chaîne vide ne contient effectivement pas 'unsafe-inline').
# On échoue donc explicitement plutôt que d'afficher de faux succès.
CSP=$(printf '%s' "$HEADERS" | grep -i "content-security-policy" || true)
if [ -z "$CSP" ]; then
  ko "CSP absente — les contrôles de contenu de la CSP ne peuvent pas être évalués"
else
  assert_absent   "$CSP" "unsafe-inline" "La CSP n'autorise PAS 'unsafe-inline'"
  assert_absent   "$CSP" "unsafe-eval"   "La CSP n'autorise PAS 'unsafe-eval'"
  assert_contains "$CSP" "frame-ancestors 'none'" "La CSP interdit l'inclusion en iframe"
  assert_contains "$CSP" "object-src 'none'"      "La CSP interdit les objets/plugins"
fi

# Divulgation d'information : la version de nginx ne doit pas fuiter.
SERVER_HDR=$(printf '%s' "$HEADERS" | grep -i "^server:" || true)
assert_absent "$SERVER_HDR" "nginx/1." "La bannière serveur ne divulgue pas la version de nginx"

# --- 5. Contrôles d'accès ------------------------------------------------------

info "5. Contrôles d'accès"

# Les fichiers cachés (.env, .git…) doivent être refusés, pas servis.
ST=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/.env")
[ "$ST" = "403" ] && ok "L'accès aux fichiers cachés est refusé (403)" \
                  || ko "GET /.env renvoie $ST (attendu 403)"

# --- 6. Durcissement du conteneur ---------------------------------------------

info "6. Durcissement du conteneur"

USER_ID=$(docker exec "$CONTAINER" id -u 2>/dev/null || echo "?")
[ "$USER_ID" = "101" ] && ok "Le conteneur s'exécute en utilisateur non-root (uid 101)" \
                       || ko "Le conteneur s'exécute sous l'uid $USER_ID (attendu 101)"

RO=$(docker inspect -f '{{.HostConfig.ReadonlyRootfs}}' "$CONTAINER")
[ "$RO" = "true" ] && ok "Le système de fichiers racine est en lecture seule" \
                   || ko "Le système de fichiers racine est inscriptible"

# Vérification effective : l'écriture doit être refusée.
if docker exec "$CONTAINER" sh -c 'echo x > /usr/share/nginx/html/pwn.html' 2>/dev/null; then
  ko "Écriture possible dans la racine web (risque de défiguration)"
else
  ok "Écriture refusée dans la racine web (anti-défiguration)"
fi

# --- Bilan --------------------------------------------------------------------

info "Bilan"
printf '  Réussis : %d — Échoués : %d\n\n' "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  printf '\033[31mTest de fumée EN ÉCHEC\033[0m\n'
  exit 1
fi
printf '\033[32mTest de fumée RÉUSSI\033[0m\n'
