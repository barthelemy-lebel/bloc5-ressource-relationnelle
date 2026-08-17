/**
 * Configuration ESLint (format « flat config », ESLint 9+).
 *
 * RÔLE DANS LA CHAÎNE QUALITÉ
 * Le linter est un garde-fou automatique exécuté en intégration continue
 * (.github/workflows/ci.yml). Il traite deux enjeux de la grille d'évaluation :
 *   - « bonnes pratiques de développement / qualité du code » ;
 *   - la prévention de certaines classes de vulnérabilités : les règles
 *     no-eval, no-implied-eval et no-new-func interdisent l'évaluation
 *     dynamique de chaînes, vecteur classique d'exécution de code injecté.
 */

const js = require('@eslint/js');

module.exports = [
  // ---------------------------------------------------------------------------
  // Code applicatif (navigateur)
  // ---------------------------------------------------------------------------
  {
    files: ['app/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // API navigateur utilisées par l'application
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        localStorage: 'readonly',
        // Garde d'export CommonJS présent dans utils.js
        module: 'writable',
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // --- Sécurité -----------------------------------------------------------
      // Interdisent l'exécution de code à partir d'une chaîne de caractères.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // Empêche l'usage de `javascript:` dans les URL, vecteur de XSS.
      'no-script-url': 'error',

      // --- Robustesse ---------------------------------------------------------
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-undef': 'error',
      // Tolère les variables inutilisées préfixées par _ (convention explicite).
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // ---------------------------------------------------------------------------
  // app.js uniquement : consomme les utilitaires exposés globalement
  // ---------------------------------------------------------------------------
  // Ces globales sont déclarées ICI et non dans le bloc précédent : sinon
  // ESLint les considérerait comme prédéfinies dans utils.js AUSSI, et
  // signalerait à tort leurs déclarations comme des redéclarations
  // (règle no-redeclare). utils.js les définit, app.js les consomme.
  {
    files: ['app/app.js'],
    languageOptions: {
      globals: {
        escHtml: 'readonly',
        formatDate: 'readonly',
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Tests unitaires (Node.js)
  // ---------------------------------------------------------------------------
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ['error', 'always'],
    },
  },
];
