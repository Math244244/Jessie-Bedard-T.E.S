/**
 * Admin — Jessie Bédard, T.E.S.
 * Gestion des événements via Firebase Firestore
 */

const COLLECTION = 'evenements';

const MOIS_MAP = {
    'Janvier': 1, 'Février': 2, 'Mars': 3, 'Avril': 4,
    'Mai': 5, 'Juin': 6, 'Juillet': 7, 'Août': 8,
    'Septembre': 9, 'Octobre': 10, 'Novembre': 11, 'Décembre': 12
};

// ===== AUTHENTIFICATION =====

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

auth.onAuthStateChanged(user => {
    if (user) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        document.getElementById('admin-email').textContent = user.email;
        loadEvents();
    } else {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
        const messages = {
            'auth/user-not-found': 'Aucun compte trouvé avec ce courriel.',
            'auth/wrong-password': 'Mot de passe incorrect.',
            'auth/invalid-credential': 'Identifiants invalides.',
            'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
            'auth/invalid-email': 'Adresse courriel invalide.'
        };
        loginError.textContent = messages[err.code] || 'Erreur de connexion. Vérifiez vos identifiants.';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// ===== GUIDE RAPIDE =====

const guideToggle = document.getElementById('guide-toggle');
const guideBody = document.getElementById('guide-body');
const guideIcon = document.getElementById('guide-icon');

const guideHidden = localStorage.getItem('admin-guide-hidden') === 'true';
if (guideHidden) {
    guideBody.classList.add('hidden');
    guideIcon.classList.replace('fa-chevron-down', 'fa-chevron-right');
}

guideToggle.addEventListener('click', () => {
    const isHidden = guideBody.classList.toggle('hidden');
    guideIcon.classList.toggle('fa-chevron-down', !isHidden);
    guideIcon.classList.toggle('fa-chevron-right', isHidden);
    localStorage.setItem('admin-guide-hidden', isHidden);
});

// ===== CHARGEMENT DES ÉVÉNEMENTS =====

async function loadEvents() {
    const container = document.getElementById('events-list');
    container.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement...</p>';

    try {
        const snapshot = await db.collection(COLLECTION).orderBy('date_tri').get();
        const upcoming = [];
        const past = [];

        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (data.statut === 'termine') past.push(data);
            else upcoming.push(data);
        });

        document.getElementById('stat-upcoming').textContent = upcoming.length;
        document.getElementById('stat-past').textContent = past.length;
        document.getElementById('stat-total').textContent = upcoming.length + past.length;

        let html = '';

        if (upcoming.length === 0 && past.length === 0) {
            html = '<div class="empty-state"><i class="fas fa-calendar-plus"></i><p>Aucun événement pour le moment.<br>Cliquez sur « Ajouter un événement » pour commencer.</p></div>';
        } else {
            if (upcoming.length > 0) {
                html += '<p class="events-group-title"><span class="dot dot-upcoming"></span> À venir (' + upcoming.length + ')</p>';
                html += upcoming.map(ev => renderAdminCard(ev, false)).join('');
            }
            if (past.length > 0) {
                html += '<p class="events-group-title"><span class="dot dot-past"></span> Terminés (' + past.length + ')</p>';
                html += past.map(ev => renderAdminCard(ev, true)).join('');
            }
        }

        container.innerHTML = html;
        attachCardListeners();
    } catch (err) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Erreur de chargement.<br>Vérifiez que Firestore est activé dans la console Firebase.</p></div>';
        console.error(err);
    }
}

function renderAdminCard(ev, isPast) {
    const typeBadge = ev.type === 'atelier'
        ? '<span class="admin-badge admin-badge-type">Atelier</span>'
        : '<span class="admin-badge admin-badge-type">Webinaire</span>';

    let etiquetteBadge = '';
    if (ev.etiquette === 'gratuit') etiquetteBadge = '<span class="admin-badge admin-badge-free">Gratuit</span>';
    if (ev.etiquette === 'nouveau') etiquetteBadge = '<span class="admin-badge admin-badge-new">Nouveau</span>';

    const formatBadge = ev.format === 'en_personne'
        ? '<span class="admin-badge admin-badge-inperson">En personne</span>'
        : '<span class="admin-badge admin-badge-online">En ligne</span>';

    const heureBadge = ev.heure ? `<span class="admin-badge" style="background:#f0f0f0;color:#555;">${ev.heure}</span>` : '';
    const vedetteBadge = ev.vedette ? '<span class="admin-badge admin-badge-vedette"><i class="fas fa-star" style="font-size:0.6rem;"></i> Vedette</span>' : '';

    const toggleLabel = isPast ? 'Remettre à venir' : 'Marquer terminé';
    const toggleIcon = isPast ? 'fa-undo' : 'fa-check';

    const descSnippet = ev.description
        ? `<div class="admin-event-desc">${ev.description}</div>`
        : '';

    return `
        <div class="admin-event-card ${isPast ? 'admin-event-card--past' : ''} ${ev.vedette ? 'admin-event-card--vedette' : ''}" data-id="${ev.id}">
            <div class="admin-event-date">
                <span class="day">${ev.jour || '-'}</span>
                <span class="month">${ev.mois || ''}</span>
            </div>
            <div class="admin-event-info">
                <h4>${ev.titre || 'Sans titre'}</h4>
                ${descSnippet}
                <div class="admin-event-badges">${typeBadge}${etiquetteBadge}${formatBadge}${heureBadge}${vedetteBadge}</div>
            </div>
            <div class="admin-event-actions">
                <button class="btn-sm btn-edit" data-action="edit" data-id="${ev.id}" title="Modifier"><i class="fas fa-pen"></i></button>
                <button class="btn-sm btn-duplicate" data-action="duplicate" data-id="${ev.id}" title="Dupliquer"><i class="fas fa-copy"></i></button>
                <button class="btn-sm btn-toggle" data-action="toggle" data-id="${ev.id}" data-statut="${ev.statut}" title="${toggleLabel}"><i class="fas ${toggleIcon}"></i></button>
                <button class="btn-sm btn-delete" data-action="delete" data-id="${ev.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
}

function attachCardListeners() {
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => editEvent(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
        btn.addEventListener('click', () => duplicateEvent(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const newStatut = btn.dataset.statut === 'a_venir' ? 'termine' : 'a_venir';
            toggleStatus(btn.dataset.id, newStatut);
        });
    });
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
    });
}

// ===== FORMULAIRE =====

const modal = document.getElementById('event-modal');
const form = document.getElementById('event-form');
const moisSelect = document.getElementById('event-mois-select');
const moisCustom = document.getElementById('event-mois-custom');
const descField = document.getElementById('event-description');
const descCounter = document.getElementById('desc-counter');

document.getElementById('add-event-btn').addEventListener('click', () => openForm());
document.getElementById('modal-close').addEventListener('click', () => closeForm());
document.getElementById('form-cancel').addEventListener('click', () => closeForm());
modal.addEventListener('click', (e) => { if (e.target === modal) closeForm(); });

moisSelect.addEventListener('change', () => {
    const val = moisSelect.value;
    moisCustom.style.display = val === 'custom' ? 'block' : 'none';
    if (val !== 'custom') moisCustom.value = '';
    autoFillDateTri();
    updatePreview();
});

moisCustom.addEventListener('input', () => {
    updatePreview();
});

descField.addEventListener('input', () => {
    descCounter.textContent = `${descField.value.length} / 300 caractères`;
    updatePreview();
});

['event-titre', 'event-jour', 'event-heure', 'event-type', 'event-etiquette', 'event-format', 'event-vedette'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', updatePreview);
});

document.getElementById('event-jour').addEventListener('input', () => {
    autoFillDateTri();
    updatePreview();
});

function getMoisValue() {
    return moisSelect.value === 'custom' ? moisCustom.value.trim() : moisSelect.value;
}

function autoFillDateTri() {
    const jour = document.getElementById('event-jour').value.trim();
    const moisText = getMoisValue();
    const moisNum = MOIS_MAP[moisText];
    const dayNum = parseInt(jour, 10);

    if (moisNum && dayNum && dayNum >= 1 && dayNum <= 31) {
        const year = new Date().getFullYear();
        const dateStr = `${year}-${String(moisNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        document.getElementById('event-date-tri').value = dateStr;
    }
}

function updatePreview() {
    const jour = document.getElementById('event-jour').value.trim() || '—';
    const mois = getMoisValue() || '';
    const titre = document.getElementById('event-titre').value.trim() || 'Titre de l\'événement';
    const desc = descField.value.trim();
    const heure = document.getElementById('event-heure').value.trim();
    const type = document.getElementById('event-type').value;
    const format = document.getElementById('event-format').value;
    const etiquette = document.getElementById('event-etiquette').value;

    document.getElementById('preview-day').textContent = jour;
    document.getElementById('preview-month').textContent = mois.substring(0, 4).toUpperCase();
    document.getElementById('preview-title').textContent = titre;
    document.getElementById('preview-desc').textContent = desc || '';

    let tagText = '';
    if (etiquette === 'gratuit') tagText = 'Gratuit';
    else if (etiquette === 'nouveau') tagText = 'Nouveau';
    const tagEl = document.getElementById('preview-tag');
    tagEl.textContent = tagText;
    tagEl.style.display = tagText ? 'inline-block' : 'none';

    const metaParts = [];
    metaParts.push(type === 'atelier' ? 'Atelier' : 'Webinaire');
    metaParts.push(format === 'en_personne' ? 'En personne' : 'En ligne');
    if (heure) metaParts.push(heure);
    document.getElementById('preview-meta').textContent = metaParts.join(' · ');
}

function openForm(eventData = null) {
    form.reset();
    document.getElementById('event-id').value = '';
    moisCustom.style.display = 'none';
    moisCustom.value = '';
    moisSelect.value = '';
    descCounter.textContent = '0 / 300 caractères';

    if (eventData) {
        document.getElementById('modal-title').textContent = 'Modifier l\'événement';
        document.getElementById('event-id').value = eventData.id || '';
        document.getElementById('event-titre').value = eventData.titre || '';
        document.getElementById('event-type').value = eventData.type || 'webinaire';
        document.getElementById('event-etiquette').value = eventData.etiquette || '';
        document.getElementById('event-jour').value = eventData.jour || '';
        document.getElementById('event-heure').value = eventData.heure || '';
        document.getElementById('event-format').value = eventData.format || 'en_ligne';
        document.getElementById('event-description').value = eventData.description || '';
        document.getElementById('event-liste').value = (eventData.liste || []).join('\n');
        document.getElementById('event-statut').value = eventData.statut || 'a_venir';
        document.getElementById('event-vedette').checked = !!eventData.vedette;

        const moisVal = eventData.mois || '';
        if (Object.keys(MOIS_MAP).includes(moisVal)) {
            moisSelect.value = moisVal;
        } else if (moisVal) {
            moisSelect.value = 'custom';
            moisCustom.value = moisVal;
            moisCustom.style.display = 'block';
        }

        if (eventData.date_tri) {
            const d = eventData.date_tri.toDate ? eventData.date_tri.toDate() : new Date(eventData.date_tri);
            document.getElementById('event-date-tri').value = d.toISOString().split('T')[0];
        }

        descCounter.textContent = `${(eventData.description || '').length} / 300 caractères`;
    } else {
        document.getElementById('modal-title').textContent = 'Ajouter un événement';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updatePreview();
    setTimeout(() => document.getElementById('event-titre').focus(), 100);
}

function closeForm() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const moisFinal = getMoisValue();
    if (!moisFinal) {
        showToast('Veuillez choisir un mois.', 'error');
        return;
    }

    const submitBtn = document.getElementById('form-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    const id = document.getElementById('event-id').value;
    const listeRaw = document.getElementById('event-liste').value.trim();
    const liste = listeRaw ? listeRaw.split('\n').map(l => l.trim()).filter(Boolean) : [];
    const dateTriValue = document.getElementById('event-date-tri').value;

    const data = {
        titre: document.getElementById('event-titre').value.trim(),
        type: document.getElementById('event-type').value,
        etiquette: document.getElementById('event-etiquette').value,
        jour: document.getElementById('event-jour').value.trim(),
        mois: moisFinal,
        heure: document.getElementById('event-heure').value.trim(),
        format: document.getElementById('event-format').value,
        description: document.getElementById('event-description').value.trim(),
        liste: liste,
        statut: document.getElementById('event-statut').value,
        vedette: document.getElementById('event-vedette').checked,
        date_tri: firebase.firestore.Timestamp.fromDate(new Date(dateTriValue + 'T00:00:00')),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (id) {
            await db.collection(COLLECTION).doc(id).update(data);
            showToast('Événement modifié avec succès !', 'success');
        } else {
            data.created_at = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(COLLECTION).add(data);
            showToast('Événement ajouté avec succès !', 'success');
        }
        closeForm();
        loadEvents();
    } catch (err) {
        showToast('Erreur : ' + err.message, 'error');
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
    }
});

async function editEvent(id) {
    try {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (doc.exists) {
            openForm({ id: doc.id, ...doc.data() });
        }
    } catch (err) {
        showToast('Erreur de chargement.', 'error');
    }
}

// ===== DUPLICATION =====

async function duplicateEvent(id) {
    try {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return;

        const original = doc.data();
        const copy = { ...original };
        copy.titre = (copy.titre || '') + ' (copie)';
        copy.vedette = false;
        copy.created_at = firebase.firestore.FieldValue.serverTimestamp();
        copy.updated_at = firebase.firestore.FieldValue.serverTimestamp();
        delete copy.id;

        await db.collection(COLLECTION).add(copy);
        showToast('Événement dupliqué ! Modifiez la copie.', 'success');
        loadEvents();
    } catch (err) {
        showToast('Erreur lors de la duplication.', 'error');
        console.error(err);
    }
}

// ===== TOGGLE STATUT =====

async function toggleStatus(id, newStatut) {
    try {
        await db.collection(COLLECTION).doc(id).update({
            statut: newStatut,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        const label = newStatut === 'termine' ? 'marqué comme terminé' : 'remis à venir';
        showToast('Événement ' + label + '.', 'success');
        loadEvents();
    } catch (err) {
        showToast('Erreur lors du changement de statut.', 'error');
    }
}

// ===== SUPPRESSION =====

function confirmDelete(id) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-card">
            <h4><i class="fas fa-exclamation-triangle" style="color:var(--admin-danger);"></i> Supprimer cet événement ?</h4>
            <p>Cette action est irréversible. L'événement sera retiré du site immédiatement.</p>
            <div class="confirm-actions">
                <button class="btn-secondary" id="confirm-cancel">Annuler</button>
                <button class="btn-primary" style="background:var(--admin-danger);" id="confirm-ok"><i class="fas fa-trash"></i> Supprimer</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#confirm-ok').addEventListener('click', async () => {
        overlay.remove();
        try {
            await db.collection(COLLECTION).doc(id).delete();
            showToast('Événement supprimé.', 'success');
            loadEvents();
        } catch (err) {
            showToast('Erreur lors de la suppression.', 'error');
        }
    });
}

// ===== TOAST =====

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
