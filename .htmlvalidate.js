/**
 * Configuration html-validate — validation HTML et contrôles d'accessibilité.
 *
 * Format JavaScript afin de documenter chaque désactivation : une règle
 * désactivée sans justification est une dette invisible.
 *
 * Le RGAA est explicitement exigé par les consignes ; cette validation
 * automatisée en CI en couvre la partie mécanisable (structure, rôles,
 * libellés de formulaires, alternatives textuelles).
 */
module.exports = {
  extends: ['html-validate:recommended'],

  rules: {
    // --- Préférences de style, non désactivées à la légère -------------------

    // Signale `<div role="list">` / `<div role="listitem">` au profit de
    // <ul>/<li>. Or c'est ici un choix DÉLIBÉRÉ : les grilles CSS
    // (display: grid) appliquées à <ul>/<li> font perdre la sémantique de
    // liste dans plusieurs navigateurs. Le motif div + role est la parade
    // recommandée, et reste de l'ARIA parfaitement valide.
    'prefer-native-element': 'off',

    // Signale `<ul role="list">` comme redondant. C'est au contraire une
    // technique d'accessibilité connue : Safari/VoiceOver retire la
    // sémantique de liste dès qu'on applique `list-style: none`, et le rôle
    // explicite la restaure. Les quelques rôles réellement redondants
    // (nav, header, footer) sont conservés par cohérence avec ce motif et
    // demeurent sans effet négatif.
    'no-redundant-role': 'off',

    // --- Assouplissements de mise en forme -----------------------------------
    'void-style': 'off',
    'no-trailing-whitespace': 'off',
    'attribute-boolean-style': 'off',
    'long-title': 'off',
  },
};
