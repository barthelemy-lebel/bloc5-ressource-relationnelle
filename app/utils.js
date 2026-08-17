/**
 * utils.js — (RE)Sources Relationnelles
 *
 * Fonctions utilitaires pures (sans dépendance au DOM), extraites de app.js
 * afin de pouvoir être testées unitairement hors navigateur (Node.js).
 *
 * Ce fichier est chargé :
 *  - dans le navigateur, via <script src="utils.js"> AVANT app.js
 *    (les fonctions sont alors disponibles dans la portée globale) ;
 *  - dans les tests, via `require('../../app/utils.js')`.
 */

'use strict';

/**
 * Échappe les caractères HTML afin de neutraliser les injections XSS.
 *
 * Toute donnée d'origine utilisateur insérée dans le DOM via innerHTML
 * DOIT passer par cette fonction. Les cinq caractères échappés sont ceux
 * qui permettent de sortir d'un contexte texte ou d'un attribut HTML.
 *
 * @param {string} str - Chaîne potentiellement dangereuse.
 * @returns {string} Chaîne sûre pour insertion dans du HTML.
 */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formate une date ISO (AAAA-MM-JJ) en date lisible en français.
 *
 * @param {string} isoDate - Date au format ISO, ex. "2025-03-12".
 * @returns {string} Date formatée, ex. "12 mars 2025". Chaîne vide si entrée vide.
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} ${mois[m - 1]} ${y}`;
}

/* Export CommonJS pour les tests unitaires Node.
   Le garde `typeof module` évite toute erreur dans le navigateur. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escHtml, formatDate };
}
