<!--
  Modèle de demande de fusion (Pull Request).

  La PR est le point de contrôle avant l'intégration dans une branche
  protégée : c'est là que se joue la revue de code et la vérification que les
  garde-fous automatisés sont bien passés.
-->

## Objet

<!-- Que fait cette modification, et pourquoi ? Une PR sans « pourquoi » est
     incompréhensible six mois plus tard. -->

## Ticket lié

<!-- Ex. : Closes #12 — assure la traçabilité entre la demande et le code
     livré, exigence du critère « gestion des évolutions ». -->
Closes #

## Type de modification

- [ ] 🐛 Correction d'anomalie (`fix`)
- [ ] ✨ Nouvelle fonctionnalité (`feat`)
- [ ] 🔐 Sécurité (`security`)
- [ ] ♻️ Remaniement sans changement de comportement (`refactor`)
- [ ] 📝 Documentation (`docs`)
- [ ] 🔧 Outillage, CI/CD, configuration (`ci` / `chore`)

## Vérifications

- [ ] `npm run verify` passe en local (lint + tests unitaires)
- [ ] `bash scripts/smoke-test.sh` passe en local
- [ ] La CI est verte sur cette branche
- [ ] Le code ajouté est commenté là où l'intention n'est pas évidente
- [ ] Aucun secret, jeton ou donnée personnelle n'est introduit

## Impact sécurité et RGPD

<!-- À remplir dès que la modification touche aux données personnelles, à
     l'authentification, aux autorisations ou aux en-têtes de sécurité.
     Indiquer « Aucun » le cas échéant — mais y avoir réfléchi. -->

## Vérification manuelle effectuée

<!-- Ce qui a été testé à la main, et dans quel environnement. Les tests
     automatisés ne couvrent pas tout : dites ce que vous avez réellement vu. -->
