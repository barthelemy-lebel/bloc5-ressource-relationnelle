/**
 * Tests unitaires — app/utils.js
 *
 * Exécutés par le lanceur de tests intégré à Node.js (`node --test`), sans
 * dépendance externe : moins de paquets tiers, donc moins de surface d'attaque
 * dans la chaîne d'approvisionnement (supply chain).
 *
 * STRUCTURE DES CAS, pour chaque fonction :
 *   1. cas nominal   — l'usage attendu ;
 *   2. cas invalide  — entrée vide, nulle, de mauvais type ;
 *   3. cas de sécurité — charge utile d'attaque réelle ;
 *   4. cas limite    — bornes du domaine de valeurs.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { escHtml, formatDate } = require('../../app/utils.js');

/* ==========================================================================
   escHtml — neutralisation des injections HTML/XSS
   ========================================================================== */

test('escHtml — cas nominal : un texte sans caractère spécial est inchangé', () => {
  assert.equal(escHtml('Bonjour le monde'), 'Bonjour le monde');
});

test('escHtml — échappe les cinq caractères dangereux', () => {
  assert.equal(escHtml('&'), '&amp;');
  assert.equal(escHtml('<'), '&lt;');
  assert.equal(escHtml('>'), '&gt;');
  assert.equal(escHtml('"'), '&quot;');
  assert.equal(escHtml("'"), '&#39;');
});

test('escHtml — l\'esperluette est échappée en premier (pas de double échappement)', () => {
  // Si & était échappé APRÈS < , alors "<" donnerait "&amp;lt;" au lieu de "&lt;".
  // Ce test verrouille l'ordre des remplacements dans l'implémentation.
  assert.equal(escHtml('<'), '&lt;');
  assert.equal(escHtml('&lt;'), '&amp;lt;');
});

test('escHtml — cas de sécurité : neutralise une balise script', () => {
  const payload = '<script>alert("XSS")</script>';
  const result = escHtml(payload);

  assert.equal(
    result,
    '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
  );
  // Vérification du critère qui compte réellement : plus aucun délimiteur
  // de balise ne subsiste, le navigateur ne peut donc pas ouvrir d'élément.
  assert.ok(!result.includes('<'), 'aucun < ne doit subsister');
  assert.ok(!result.includes('>'), 'aucun > ne doit subsister');
});

test('escHtml — cas de sécurité : neutralise une évasion d\'attribut', () => {
  // Vecteur classique : sortir d'un attribut HTML pour injecter un handler.
  const payload = '" onerror="alert(1)';
  const result = escHtml(payload);

  assert.ok(!result.includes('"'), 'aucun guillemet double ne doit subsister');
  assert.equal(result, '&quot; onerror=&quot;alert(1)');
});

test('escHtml — cas de sécurité : neutralise une évasion par apostrophe', () => {
  const result = escHtml("' onclick='alert(1)");
  assert.ok(!result.includes("'"), 'aucune apostrophe ne doit subsister');
});

test('escHtml — cas invalides : entrées vides ou nulles renvoient une chaîne vide', () => {
  assert.equal(escHtml(''), '');
  assert.equal(escHtml(null), '');
  assert.equal(escHtml(undefined), '');
});

test('escHtml — cas limite : les entrées non-string sont converties sans erreur', () => {
  assert.equal(escHtml(42), '42');
  assert.equal(escHtml(true), 'true');
  // 0 et false sont falsy : l'implémentation renvoie '' par sa garde initiale.
  // Ce test documente ce comportement afin qu'un changement soit conscient.
  assert.equal(escHtml(0), '');
  assert.equal(escHtml(false), '');
});

test('escHtml — cas limite : chaîne longue entièrement échappée', () => {
  const result = escHtml('<'.repeat(1000));
  assert.equal(result, '&lt;'.repeat(1000));
});

/* ==========================================================================
   formatDate — formatage de date ISO vers un libellé français
   ========================================================================== */

test('formatDate — cas nominal : convertit une date ISO en libellé français', () => {
  assert.equal(formatDate('2025-03-12'), '12 mars 2025');
});

test('formatDate — cas limite : premier et dernier mois de l\'année', () => {
  assert.equal(formatDate('2025-01-01'), '1 janv. 2025');
  assert.equal(formatDate('2025-12-31'), '31 déc. 2025');
});

test('formatDate — les douze mois sont correctement libellés', () => {
  const attendus = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];

  attendus.forEach((libelle, index) => {
    const mois = String(index + 1).padStart(2, '0');
    assert.equal(
      formatDate(`2025-${mois}-15`),
      `15 ${libelle} 2025`,
      `mois ${mois} mal libellé`
    );
  });
});

test('formatDate — cas limite : gère une année bissextile', () => {
  assert.equal(formatDate('2024-02-29'), '29 févr. 2024');
});

test('formatDate — cas invalides : entrées vides ou nulles renvoient une chaîne vide', () => {
  assert.equal(formatDate(''), '');
  assert.equal(formatDate(null), '');
  assert.equal(formatDate(undefined), '');
});

test('formatDate — les zéros de tête sont supprimés du jour', () => {
  // "2025-03-05" doit produire "5 mars 2025" et non "05 mars 2025",
  // conformément à l'usage typographique français.
  assert.equal(formatDate('2025-03-05'), '5 mars 2025');
});
