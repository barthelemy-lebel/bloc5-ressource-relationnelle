/**
 * app.js — (RE)Sources Relationnelles
 * Gère : navigation SPA, filtrage ressources, modal connexion,
 * formulaire contribution, tableau modération, détails dashboard.
 * Aucune requête réseau — tout est simulé en mémoire.
 */

'use strict';

/* ================================================================
   0. DONNÉES SIMULÉES
   ================================================================ */

/** Catalogue de ressources factices */
const RESOURCES_DATA = [
  {
    id: 1,
    titre: "Écoute active : guide pratique",
    type: "guide",
    relation: "famille",
    categorie: "Communication",
    resume: "Techniques fondamentales pour mieux écouter sans juger, idéales pour le cadre familial et professionnel.",
    duree: "8 min",
    note: 4.8,
    auteur: "Marie D.",
    date: "2025-03-12"
  },
  {
    id: 2,
    titre: "Désamorcer une dispute en 5 étapes",
    type: "article",
    relation: "couple",
    categorie: "Gestion des conflits",
    resume: "Méthode validée pour retrouver le calme et rebâtir la confiance après un désaccord difficile.",
    duree: "12 min",
    note: 4.6,
    auteur: "Jean-Pierre M.",
    date: "2025-02-28"
  },
  {
    id: 3,
    titre: "Méditation de pleine conscience",
    type: "audio",
    relation: "amis",
    categorie: "Bien-être",
    resume: "Programme audio de 21 jours pour réduire le stress et améliorer la qualité de vos interactions.",
    duree: "5 min",
    note: 4.9,
    auteur: "Amira B.",
    date: "2025-01-15"
  },
  {
    id: 4,
    titre: "Communication non violente au travail",
    type: "video",
    relation: "travail",
    categorie: "Communication",
    resume: "Introduction à la CNV pour transformer les échanges professionnels et réduire les tensions.",
    duree: "25 min",
    note: 4.7,
    auteur: "Thomas K.",
    date: "2025-03-05"
  },
  {
    id: 5,
    titre: "Mieux connaître ses voisins",
    type: "atelier",
    relation: "voisinage",
    categorie: "Lien social",
    resume: "Atelier participatif pour tisser des liens positifs dans votre immeuble ou votre quartier.",
    duree: "2h",
    note: 4.5,
    auteur: "Sophie R.",
    date: "2025-03-20"
  },
  {
    id: 6,
    titre: "Gérer la crise d'adolescence",
    type: "guide",
    relation: "famille",
    categorie: "Parentalité",
    resume: "Un guide pour accompagner les parents et comprendre les mécanismes de la crise identitaire adolescente.",
    duree: "18 min",
    note: 4.4,
    auteur: "Lucie F.",
    date: "2025-02-10"
  },
  {
    id: 7,
    titre: "Reconstruire la confiance après une trahison",
    type: "article",
    relation: "couple",
    categorie: "Gestion des conflits",
    resume: "Approche thérapeutique et pratique pour rebâtir le lien de confiance brisé dans une relation de couple.",
    duree: "15 min",
    note: 4.6,
    auteur: "Marc B.",
    date: "2025-01-30"
  },
  {
    id: 8,
    titre: "Le cercle de parole entre amis",
    type: "atelier",
    relation: "amis",
    categorie: "Communication",
    resume: "Technique inspirée des pratiques amérindiennes pour favoriser l'expression authentique dans un groupe d'amis.",
    duree: "1h30",
    note: 4.3,
    auteur: "Inès L.",
    date: "2025-03-01"
  },
  {
    id: 9,
    titre: "Réunion d'équipe efficace et bienveillante",
    type: "guide",
    relation: "travail",
    categorie: "Communication",
    resume: "Protocoles pour animer des réunions qui respectent chaque voix et aboutissent à des décisions partagées.",
    duree: "10 min",
    note: 4.5,
    auteur: "David M.",
    date: "2025-02-20"
  },
  {
    id: 10,
    titre: "Yoga relationnel en famille",
    type: "video",
    relation: "famille",
    categorie: "Bien-être",
    resume: "Séquences de yoga adaptées à pratiquer en famille pour renforcer les liens corporels et émotionnels.",
    duree: "30 min",
    note: 4.8,
    auteur: "Camille V.",
    date: "2025-03-18"
  },
  {
    id: 11,
    titre: "Médiation de voisinage : guide du médiateur",
    type: "guide",
    relation: "voisinage",
    categorie: "Gestion des conflits",
    resume: "Méthodes et outils pour agir en tiers de confiance lors de conflits de voisinage.",
    duree: "20 min",
    note: 4.2,
    auteur: "Pierre-Henri G.",
    date: "2025-02-05"
  },
  {
    id: 12,
    titre: "Podcast : L'art de la conversation",
    type: "audio",
    relation: "amis",
    categorie: "Communication",
    resume: "Série de 10 épisodes explorant les subtilités d'une bonne conversation et les erreurs fréquentes.",
    duree: "45 min",
    note: 4.7,
    auteur: "Élise M.",
    date: "2025-01-22"
  }
];

/** Données modération factices */
const MODERATION_DATA = [
  { id: 101, titre: "L'empathie comme outil de paix", type: "article", relation: "famille", auteur: "Claire N.", date: "2025-04-02", statut: "pending", resume: "Article explorant comment l'empathie transforme les conflits familiaux en opportunités de croissance. Sources issues de la psychologie positive." },
  { id: 102, titre: "Sophrologie et relations", type: "audio", relation: "travail", auteur: "Yann P.", date: "2025-04-03", statut: "pending", resume: "Enregistrement audio de 30 minutes guidant une séance de sophrologie centrée sur la gestion des tensions professionnelles." },
  { id: 103, titre: "Journal du lien", type: "guide", relation: "couple", auteur: "Fatima O.", date: "2025-04-04", statut: "pending", resume: "Guide pratique pour tenir un journal à deux et renforcer la complicité. Exercices quotidiens progressifs sur 30 jours." },
  { id: 104, titre: "Les 5 langages de l'amour", type: "article", relation: "couple", auteur: "Romain D.", date: "2025-04-01", statut: "pending", resume: "Synthèse du bestseller de Gary Chapman adaptée au contexte francophone, avec des exemples concrets de mise en pratique." },
  { id: 105, titre: "Jeux coopératifs pour enfants", type: "atelier", relation: "famille", auteur: "Nathalie B.", date: "2025-03-30", statut: "pending", resume: "Recueil de 20 jeux favorisant la coopération et l'entraide entre enfants de 6 à 12 ans, jouables en famille ou en classe." },
  { id: 106, titre: "Prévenir le burn-out relationnel", type: "video", relation: "travail", auteur: "Olivier C.", date: "2025-03-28", statut: "pending", resume: "Vidéo de 20 minutes expliquant les signaux d'alerte du burn-out relationnel et les stratégies de prévention." },
  { id: 107, titre: "La fête des voisins : comment l'organiser", type: "guide", relation: "voisinage", auteur: "Alice T.", date: "2025-03-25", statut: "pending", resume: "Guide pratique pour organiser un événement de quartier inclusif et chaleureux, avec check-lists et conseils logistiques." },
];

/* ================================================================
   1. NAVIGATION SPA
   ================================================================ */

/**
 * Affiche la page correspondant à l'id donné,
 * met à jour l'état actif des liens et ajoute l'animation.
 * @param {string} pageId - ex: "accueil", "ressources", etc.
 */
function navigateTo(pageId) {
  // Masquer toutes les pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'page-enter');
    p.hidden = true;
  });

  // Afficher la page cible
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.hidden = false;
    // Forcer un reflow pour déclencher l'animation
    void target.offsetWidth;
    target.classList.add('active', 'page-enter');
    // Remonter en haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Mettre à jour les liens actifs
  document.querySelectorAll('.nav-link').forEach(link => {
    const isActive = link.dataset.page === pageId;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Fermer le menu mobile si ouvert
  closeMobileNav();

  // Initialisation spécifique à la page
  if (pageId === 'ressources') initResourcesPage();
  if (pageId === 'moderation') initModerationPage();
}

/** Écoute tous les clics [data-page] pour la navigation */
function initNavigation() {
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-page]');
    if (link && !link.closest('.mod-table') && !link.classList.contains('btn-detail')) {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) navigateTo(page);
    }
  });
}

/* ================================================================
   2. MENU MOBILE (BURGER)
   ================================================================ */

function initMobileNav() {
  const burger = document.getElementById('burger-btn');
  const nav    = document.querySelector('.main-nav');

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('nav-open', open);
  });

  // Fermer en cliquant hors du nav
  document.addEventListener('click', e => {
    if (!e.target.closest('.main-nav') && !e.target.closest('#burger-btn')) {
      closeMobileNav();
    }
  });
}

function closeMobileNav() {
  const burger = document.getElementById('burger-btn');
  const nav    = document.querySelector('.main-nav');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('nav-open');
}

/* ================================================================
   3. MODAL CONNEXION
   ================================================================ */

function initLoginModal() {
  const btnOpen    = document.getElementById('btn-login');
  const btnClose   = document.getElementById('btn-close-modal');
  const overlay    = document.getElementById('modal-overlay');
  const modal      = document.getElementById('login-modal');
  const loginForm  = document.getElementById('login-form');
  const pwdToggle  = document.getElementById('pwd-toggle');
  const pwdInput   = document.getElementById('login-password');
  const emailInput = document.getElementById('login-email');
  const roleSelect = document.getElementById('login-role');

  /** Ouvre la modal */
  function openModal() {
    overlay.hidden = false;
    modal.hidden   = false;
    overlay.setAttribute('aria-hidden', 'false');
    btnOpen.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus sur le 1er champ
    setTimeout(() => emailInput.focus(), 50);
  }

  /** Ferme la modal et remet à zéro */
  function closeModal() {
    overlay.hidden = true;
    modal.hidden   = true;
    overlay.setAttribute('aria-hidden', 'true');
    btnOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    resetLoginForm();
    btnOpen.focus();
  }

  function resetLoginForm() {
    loginForm.reset();
    document.getElementById('login-email-error').hidden = true;
    document.getElementById('login-pwd-error').hidden   = true;
    document.getElementById('login-error-msg').hidden   = true;
    emailInput.classList.remove('is-invalid');
    pwdInput.classList.remove('is-invalid');
  }

  // Événements ouverture/fermeture
  btnOpen.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Fermeture clavier (Escape)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Trap focus dans la modal
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Toggle afficher/masquer mot de passe
  pwdToggle.addEventListener('click', () => {
    const isText = pwdInput.type === 'text';
    pwdInput.type = isText ? 'password' : 'text';
    pwdToggle.setAttribute('aria-label', isText ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
  });

  // Soumission simulée du formulaire de connexion
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // Validation basique côté client
    if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      document.getElementById('login-email-error').hidden = false;
      emailInput.classList.add('is-invalid');
      emailInput.focus();
      valid = false;
    } else {
      document.getElementById('login-email-error').hidden = true;
      emailInput.classList.remove('is-invalid');
    }

    if (!pwdInput.value) {
      document.getElementById('login-pwd-error').hidden = false;
      pwdInput.classList.add('is-invalid');
      if (valid) pwdInput.focus();
      valid = false;
    } else {
      document.getElementById('login-pwd-error').hidden = true;
      pwdInput.classList.remove('is-invalid');
    }

    if (!valid) return;

    // Simulation : accepter tout identifiant valide sauf test d'erreur
    const email = emailInput.value.toLowerCase();
    const pwd   = pwdInput.value;
    const role  = roleSelect.value;

    if (pwd === 'erreur') {
      // Simuler une erreur de connexion
      document.getElementById('login-error-msg').hidden = false;
      return;
    }

    // Connexion simulée réussie
    closeModal();
    const roleLabels = {
      citoyen: 'Citoyen',
      'super-utilisateur': 'Super-utilisateur',
      moderateur: 'Modérateur',
      administrateur: 'Administrateur'
    };
    showToast(`✓ Connecté en tant que ${roleLabels[role] || role} !`);

    // Mettre à jour le bouton header (factice)
    const firstName = email.split('@')[0].split('.')[0];
    const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    document.getElementById('btn-login').innerHTML = `
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      ${name}
    `;
    document.getElementById('btn-login').style.borderColor = 'var(--green-500)';
    document.getElementById('btn-login').style.color = 'var(--green-700)';
  });
}

/* ================================================================
   4. PAGE RESSOURCES — FILTRAGE DYNAMIQUE
   ================================================================ */

function initResourcesPage() {
  renderResources(RESOURCES_DATA);
  bindResourceFilters();
}

/**
 * Affiche les cartes de ressources dans la grille.
 * @param {Array} data - tableau de ressources filtrées
 */
function renderResources(data) {
  const grid      = document.getElementById('resources-grid');
  const noResults = document.getElementById('no-results');
  const counter   = document.getElementById('resource-count');

  counter.textContent = data.length;

  if (data.length === 0) {
    grid.innerHTML = '';
    noResults.hidden = false;
    return;
  }

  noResults.hidden = true;

  // Map catégorie → classe CSS de tag
  const tagClass = {
    'Communication':       'tag-communication',
    'Gestion des conflits':'tag-gestion',
    'Bien-être':           'tag-bien-etre',
    'Parentalité':         'tag-guide',
    'Lien social':         'tag-atelier',
  };

  const typeClass = {
    article: 'tag-article',
    video:   'tag-video',
    audio:   'tag-audio',
    atelier: 'tag-atelier',
    guide:   'tag-guide',
  };

  const typeLabel = {
    article: 'Article',
    video:   'Vidéo',
    audio:   'Audio',
    atelier: 'Atelier',
    guide:   'Guide',
  };

  const relationLabel = {
    famille:  'Famille',
    couple:   'Couple',
    amis:     'Amis',
    travail:  'Travail',
    voisinage:'Voisinage',
  };

  // Génération du HTML pour chaque carte
  grid.innerHTML = data.map(r => `
    <article class="resource-card" role="listitem" tabindex="0" aria-label="${escHtml(r.titre)}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <span class="resource-tag ${typeClass[r.type] || 'tag-article'}">${typeLabel[r.type] || r.type}</span>
        <span class="resource-tag ${tagClass[r.categorie] || 'tag-guide'}">${escHtml(r.categorie)}</span>
      </div>
      <h3>${escHtml(r.titre)}</h3>
      <p>${escHtml(r.resume)}</p>
      <div style="margin-top:auto;">
        <div class="card-meta" style="margin-bottom:8px;">
          <span title="Relation concernée">👥 ${relationLabel[r.relation] || r.relation}</span>
          <span title="Durée de lecture/écoute">🕐 ${escHtml(r.duree)}</span>
          <span title="Note moyenne">⭐ ${r.note}</span>
        </div>
        <div class="card-meta" style="color:var(--neutral-400);">
          <span title="Auteur">✍ ${escHtml(r.auteur)}</span>
          <span title="Date de publication">📅 ${formatDate(r.date)}</span>
        </div>
      </div>
    </article>
  `).join('');
}

/** Filtre le catalogue selon les entrées utilisateur */
function filterResources() {
  const search   = document.getElementById('search-input').value.trim().toLowerCase();
  const type     = document.getElementById('filter-type').value;
  const relation = document.getElementById('filter-relation').value;

  const filtered = RESOURCES_DATA.filter(r => {
    const matchSearch = !search
      || r.titre.toLowerCase().includes(search)
      || r.resume.toLowerCase().includes(search)
      || r.categorie.toLowerCase().includes(search)
      || r.auteur.toLowerCase().includes(search);

    const matchType     = !type     || r.type === type;
    const matchRelation = !relation || r.relation === relation;

    return matchSearch && matchType && matchRelation;
  });

  renderResources(filtered);
}

/** Branche les listeners de filtres */
function bindResourceFilters() {
  const searchInput = document.getElementById('search-input');
  const filterType  = document.getElementById('filter-type');
  const filterRel   = document.getElementById('filter-relation');
  const btnReset    = document.getElementById('btn-reset-filters');
  const btnClear    = document.getElementById('btn-clear-search');

  // Debounce pour la recherche texte
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(filterResources, 250);
  });

  filterType.addEventListener('change', filterResources);
  filterRel.addEventListener('change',  filterResources);

  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    filterType.value  = '';
    filterRel.value   = '';
    renderResources(RESOURCES_DATA);
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      searchInput.value = '';
      filterType.value  = '';
      filterRel.value   = '';
      renderResources(RESOURCES_DATA);
    });
  }
}

/* ================================================================
   5. PAGE CONTRIBUTION — FORMULAIRE
   ================================================================ */

function initContributionPage() {
  const form      = document.getElementById('contribution-form');
  const textarea  = document.getElementById('res-resume');
  const charCount = document.getElementById('char-count');
  const btnDraft  = document.getElementById('btn-save-draft');
  const success   = document.getElementById('form-success');

  // Compteur de caractères
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
  });

  // Enregistrer le brouillon (simulation)
  btnDraft.addEventListener('click', () => {
    showToast('📝 Brouillon enregistré localement !');
  });

  // Soumission du formulaire avec validation
  form.addEventListener('submit', e => {
    e.preventDefault();
    const isValid = validateContributionForm();

    if (isValid) {
      // Simulation envoi réussi
      form.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Avancer l'étape du workflow
      document.querySelectorAll('.workflow-step').forEach((step, i) => {
        if (i === 0) step.classList.add('done');
        if (i === 1) step.classList.add('active');
      });
    }
  });
}

/** Valide le formulaire de contribution, retourne true si valide */
function validateContributionForm() {
  let valid = true;

  // Titre
  const titre = document.getElementById('res-titre');
  const titreError = document.getElementById('titre-error');
  if (!titre.value.trim()) {
    titreError.hidden = false;
    titre.classList.add('is-invalid');
    if (valid) titre.focus();
    valid = false;
  } else {
    titreError.hidden = true;
    titre.classList.remove('is-invalid');
  }

  // Type
  const type = document.getElementById('res-type');
  const typeError = document.getElementById('type-error');
  if (!type.value) {
    typeError.hidden = false;
    type.classList.add('is-invalid');
    valid = false;
  } else {
    typeError.hidden = true;
    type.classList.remove('is-invalid');
  }

  // RGPD
  const rgpd = document.getElementById('check-rgpd');
  const rgpdError = document.getElementById('check-rgpd-error');
  if (!rgpd.checked) {
    rgpdError.hidden = false;
    valid = false;
  } else {
    rgpdError.hidden = true;
  }

  // Licence
  const licence = document.getElementById('check-licence');
  if (!licence.checked) {
    licence.parentElement.style.outline = '2px solid var(--red-500)';
    licence.parentElement.style.borderRadius = '4px';
    valid = false;
  } else {
    licence.parentElement.style.outline = '';
  }

  return valid;
}

/* ================================================================
   6. PAGE MODÉRATION
   ================================================================ */

function initModerationPage() {
  renderModerationTable(MODERATION_DATA);
  bindModerationActions();
}

/** Génère les lignes du tableau de modération */
function renderModerationTable(data) {
  const tbody = document.getElementById('mod-table-body');
  if (!tbody) return;

  const typeLabel = { article:'Article', video:'Vidéo', audio:'Audio', atelier:'Atelier', guide:'Guide' };
  const relLabel  = { famille:'Famille', couple:'Couple', amis:'Amis', travail:'Travail', voisinage:'Voisinage' };

  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${escHtml(r.titre)}</strong></td>
      <td>${typeLabel[r.type] || r.type}</td>
      <td>${relLabel[r.relation] || r.relation}</td>
      <td>${escHtml(r.auteur)}</td>
      <td><time datetime="${r.date}">${formatDate(r.date)}</time></td>
      <td><span class="status-badge status-pending">En attente</span></td>
      <td>
        <button class="btn-detail"
          data-id="${r.id}"
          data-titre="${escHtml(r.titre).replace(/"/g, '&quot;')}"
          data-content="${escHtml(r.resume).replace(/"/g, '&quot;')}"
          aria-label="Voir le détail de : ${escHtml(r.titre)}">
          Voir
        </button>
      </td>
    </tr>
  `).join('');
}

let currentModerationRow = null;

/** Gère l'ouverture/fermeture du panneau détail et les actions de modération */
function bindModerationActions() {
  const tbody  = document.getElementById('mod-table-body');
  const detail = document.getElementById('mod-detail');
  const btnClose = document.getElementById('btn-close-detail');
  const btnApprove = document.getElementById('btn-approve');
  const btnReject  = document.getElementById('btn-reject');
  const btnAskEdit = document.getElementById('btn-ask-edit');

  if (!tbody) return;

  // Délégation d'événement sur le bouton "Voir"
  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.btn-detail');
    if (!btn) return;

    currentModerationRow = btn.closest('tr');

    document.getElementById('mod-detail-title').textContent   = btn.dataset.titre;
    document.getElementById('mod-detail-content').textContent = btn.dataset.content;
    detail.hidden = false;
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('btn-approve').focus();
  });

  // Fermer le détail
  btnClose.addEventListener('click', () => {
    detail.hidden = true;
    currentModerationRow = null;
  });

  // Valider
  btnApprove.addEventListener('click', () => {
    if (currentModerationRow) {
      const badge = currentModerationRow.querySelector('.status-badge');
      badge.textContent = 'Validée';
      badge.className   = 'status-badge status-approved';
      const btn = currentModerationRow.querySelector('.btn-detail');
      btn.disabled = true;
      btn.textContent = '✓';
    }
    detail.hidden = true;
    showToast('✓ Ressource validée et publiée !');
    currentModerationRow = null;
  });

  // Refuser
  btnReject.addEventListener('click', () => {
    if (currentModerationRow) {
      const badge = currentModerationRow.querySelector('.status-badge');
      badge.textContent = 'Refusée';
      badge.className   = 'status-badge status-refused';
      const btn = currentModerationRow.querySelector('.btn-detail');
      btn.disabled = true;
      btn.textContent = '✗';
    }
    detail.hidden = true;
    showToast('✗ Ressource refusée.');
    currentModerationRow = null;
  });

  // Demander modification
  btnAskEdit.addEventListener('click', () => {
    detail.hidden = true;
    showToast('⟲ Demande de modification envoyée à l\'auteur.');
    currentModerationRow = null;
  });
}

/* ================================================================
   7. PAGE TABLEAU DE BORD — DÉTAILS MASQUÉS
   ================================================================ */

function initDashboardPage() {
  // Boutons "Afficher/Masquer les détails"
  document.querySelectorAll('.toggle-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const detail   = document.getElementById(targetId);
      if (!detail) return;

      const isOpen = !detail.hidden;
      detail.hidden = isOpen;
      btn.textContent  = isOpen ? 'Afficher les détails' : 'Masquer les détails';
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ================================================================
   8. TOAST (notification)
   ================================================================ */

let toastTimer;

/**
 * Affiche un message de notification temporaire.
 * @param {string} message
 * @param {number} duration - durée en ms (défaut 3500)
 */
function showToast(message, duration = 3500) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.hidden = false;

  // Déclencher l'animation
  void toast.offsetWidth;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 400);
  }, duration);
}

/* ================================================================
   9. UTILITAIRES
   ================================================================
   Les fonctions escHtml() et formatDate() ont été déplacées dans
   app/utils.js afin d'être testables unitairement hors navigateur.
   Elles restent disponibles ici via la portée globale, utils.js
   étant chargé avant app.js dans index.html.
   ================================================================ */

/* ================================================================
   10. INITIALISATION GLOBALE
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation entre pages
  initNavigation();

  // Menu mobile
  initMobileNav();

  // Modal de connexion
  initLoginModal();

  // Initialiser la page d'accueil au chargement
  navigateTo('accueil');

  // Initialiser les pages qui ont du contenu dynamique au premier chargement
  initContributionPage();
  initDashboardPage();

  // Les pages Ressources et Modération s'initialisent lors de la navigation (voir navigateTo)

  // Gestion du compteur caractères (page contribution) si déjà visible
  const textarea = document.getElementById('res-resume');
  if (textarea) {
    textarea.addEventListener('input', () => {
      const count = document.getElementById('char-count');
      if (count) count.textContent = textarea.value.length;
    });
  }

  console.info('(RE)Sources Relationnelles — prototype initialisé ✓');
});
