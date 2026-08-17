/**
 * Configuration Stylelint — contrôle qualité des feuilles de style.
 *
 * Format JavaScript (et non JSON) afin de pouvoir documenter chaque choix :
 * un fichier .json n'accepte pas de commentaires, et les clés factices du type
 * "//" y sont interprétées comme des noms de règles inconnues.
 *
 * PRINCIPE RETENU
 * Un linter doit signaler des DÉFAUTS, pas imposer des goûts. Une configuration
 * qui produit 133 avertissements cosmétiques sur du code fonctionnel finit
 * ignorée par l'équipe — et masque alors les vrais problèmes. On désactive donc
 * les règles de pure notation, et on conserve celles qui détectent des erreurs
 * réelles (couleurs invalides, sélecteurs dupliqués, propriétés en conflit).
 */

module.exports = {
  extends: 'stylelint-config-standard',

  rules: {
    // --- Conventions de nommage du projet ------------------------------------
    // Le prototype combine un nommage de type BEM (.parcours-card--featured)
    // et des classes utilitaires (.pct-35). Imposer un motif unique
    // produirait du bruit sans aucun gain de qualité.
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,

    // --- Notations : choix dictés par la compatibilité navigateurs -----------
    // Les consignes imposent la compatibilité Chrome, Safari, Firefox et Edge.
    // Les notations « modernes » exigées par défaut par stylelint sont plus
    // récentes que les formes historiques, lesquelles restent universellement
    // supportées. On conserve donc volontairement les formes historiques.

    // Impose `(max-width: 768px)` plutôt que `(width <= 768px)`.
    'media-feature-range-notation': 'prefix',

    // Impose `rgba(0, 0, 0, .6)` plutôt que `rgb(0 0 0 / 60%)`.
    'color-function-notation': 'legacy',
    'alpha-value-notation': 'number',

    // --- Mise en forme --------------------------------------------------------
    // Le prototype regroupe volontiers des déclarations courtes sur une ligne
    // (`.shape { top: 0; left: 0; }`), ce qui reste parfaitement lisible.
    'declaration-block-single-line-max-declarations': null,

    // Signale des chevauchements de spécificité qui sont ici intentionnels
    // (surcharges d'état : :hover, .active, media queries).
    'no-descending-specificity': null,

    // --- Règles conservées : détection de défauts réels ------------------------
    // Une couleur hexadécimale invalide est un bug d'affichage silencieux.
    'color-no-invalid-hex': true,
    // Deux fois le même sélecteur : symptôme de copier-coller, source de
    // régressions car l'ordre de déclaration devient déterminant.
    'no-duplicate-selectors': true,
    // Deux fois la même propriété dans un bloc : l'une est morte.
    // On tolère la forme consécutive à valeurs différentes, qui est la
    // technique légitime de repli pour navigateurs anciens.
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] },
    ],
  },
};
