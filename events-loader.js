/**
 * Chargeur d'événements dynamiques — Jessie Bédard, T.E.S.
 * Utilise onSnapshot pour des mises à jour TEMPS RÉEL.
 * Gère deux pages : services (complet) et accueil (aperçu).
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;

    const config = firebase.app().options;
    if (!config.apiKey || config.apiKey === 'VOTRE_API_KEY') return;

    const servicesContainer = document.getElementById('events-dynamic-container');
    const homeContainer = document.getElementById('events-home-grid');

    if (servicesContainer) listenServicesEvents();
    if (homeContainer) listenHomeEvents();
});

// ===== PAGE SERVICES — Temps réel complet =====

function listenServicesEvents() {
    db.collection('evenements').orderBy('date_tri').onSnapshot(
        (snapshot) => {
            const upcoming = [];
            const past = [];
            snapshot.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                if (data.statut === 'termine') past.push(data);
                else upcoming.push(data);
            });

            const upcomingEl = document.getElementById('events-upcoming');
            const pastEl = document.getElementById('events-past');
            const upcomingCount = document.getElementById('upcoming-count');
            const pastCount = document.getElementById('past-count');
            const historySection = document.getElementById('events-history-section');

            if (upcoming.length > 0 && upcomingEl) {
                const hasVedette = upcoming.some(e => e.vedette);
                upcomingEl.innerHTML = upcoming.map((ev, i) => renderPublicCard(ev, hasVedette ? !!ev.vedette : i === 0)).join('');
                if (upcomingCount) upcomingCount.textContent = upcoming.length + ' événement' + (upcoming.length > 1 ? 's' : '');
            } else if (upcomingEl) {
                upcomingEl.innerHTML = '<p style="text-align:center; color:#7f8c8d; padding:2rem;">Aucun événement à venir pour le moment. Restez à l\'affût !</p>';
                if (upcomingCount) upcomingCount.textContent = '0';
            }

            if (past.length > 0 && pastEl && historySection) {
                pastEl.innerHTML = past.reverse().map(ev => renderPastCard(ev)).join('');
                if (pastCount) pastCount.textContent = past.length;
                historySection.style.display = '';
            } else if (historySection) {
                historySection.style.display = 'none';
            }
        },
        (err) => {
            console.warn('Events: erreur Firestore.', err);
        }
    );
}

// ===== PAGE ACCUEIL — Aperçu compact =====

function listenHomeEvents() {
    const grid = document.getElementById('events-home-grid');

    db.collection('evenements').orderBy('date_tri').onSnapshot(
        (snapshot) => {
            const upcoming = [];
            snapshot.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                if (data.statut === 'a_venir') upcoming.push(data);
            });

            if (upcoming.length === 0) {
                grid.innerHTML = '';
                return;
            }

            upcoming.sort((a, b) => (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0));
            const maxCards = Math.min(upcoming.length, 3);
            grid.innerHTML = upcoming.slice(0, maxCards).map(ev => renderPreviewCard(ev)).join('');
        },
        (err) => {
            console.warn('Events home: erreur Firestore.', err);
        }
    );
}

function renderPreviewCard(ev) {
    const typeLabel = ev.type === 'atelier' ? 'Atelier' : 'Webinaire';
    const badgeLabel = ev.etiquette === 'gratuit' ? 'Gratuit' : ev.etiquette === 'nouveau' ? 'Nouveau' : typeLabel;
    const formatIcon = ev.format === 'en_personne' ? 'fa-users' : 'fa-laptop';
    const formatLabel = ev.format === 'en_personne' ? 'En personne' : 'En ligne';

    return `
        <a href="services.html#webinaire" class="event-preview-card">
            <div class="event-preview-date">
                <span class="day">${ev.jour || '-'}</span>
                <span class="month">${ev.mois || ''}</span>
            </div>
            <div class="event-preview-body">
                <span class="event-preview-badge"><i class="fas fa-star"></i> ${badgeLabel}</span>
                <h4>${ev.titre || 'Événement'}</h4>
                <div class="event-preview-meta">
                    ${ev.heure ? `<span><i class="fas fa-clock"></i> ${ev.heure}</span>` : ''}
                    <span><i class="fas ${formatIcon}"></i> ${formatLabel}</span>
                </div>
                <span class="event-preview-link">Voir les détails <i class="fas fa-arrow-right"></i></span>
            </div>
        </a>`;
}

// ===== RENDUS SERVICES (complets) =====

function renderPublicCard(ev, isHighlight) {
    const highlightClass = isHighlight ? 'event-card--highlight' : '';

    let tagHtml = '';
    if (ev.etiquette === 'gratuit') {
        tagHtml = ev.type === 'webinaire'
            ? '<span class="event-tag event-tag--free"><i class="fas fa-video"></i> Webinaire gratuit</span>'
            : '<span class="event-tag event-tag--free">Gratuit</span>';
    }
    if (ev.etiquette === 'nouveau') tagHtml = '<span class="event-tag event-tag--new">Nouveau</span>';

    const formatLabel = ev.format === 'en_personne' ? 'En personne' : 'En ligne';
    const formatIcon = ev.format === 'en_personne' ? 'fa-users' : 'fa-laptop';

    let listeHtml = '';
    if (ev.liste && ev.liste.length > 0) {
        listeHtml = '<ul class="event-list">' + ev.liste.map(item => `<li>${item}</li>`).join('') + '</ul>';
    }

    const descHtml = ev.description ? `<p>${ev.description}</p>` : '';
    const subject = encodeURIComponent(`Inscription — ${ev.titre}`);
    const body = encodeURIComponent(`Bonjour Jessie,\n\nJ'aimerais m'inscrire à l'événement « ${ev.titre} ».\n\nMerci !`);
    const mailto = `mailto:jbedard_89@hotmail.com?subject=${subject}&body=${body}`;

    return `
        <div class="event-card ${highlightClass}">
            <div class="event-date-col">
                <span class="event-day">${ev.jour || '-'}</span>
                <span class="event-month">${ev.mois || ''}</span>
            </div>
            <div class="event-content">
                ${tagHtml}
                <h4>${ev.titre || 'Événement'}</h4>
                ${descHtml}
                ${listeHtml}
                <div class="event-meta">
                    ${ev.heure ? `<span><i class="fas fa-clock"></i> ${ev.heure}</span>` : ''}
                    <span><i class="fas ${formatIcon}"></i> ${formatLabel}</span>
                    <span><i class="fas fa-user"></i> Par Jessie Bédard, T.E.S.</span>
                </div>
                <div class="event-cta">
                    <a href="${mailto}" class="cta cta-primary" onclick="trackEventClick('${ev.type}', '${(ev.titre || '').replace(/'/g, "\\'")}')">
                        <i class="fas fa-envelope"></i> S'inscrire par courriel
                    </a>
                </div>
            </div>
        </div>`;
}

function renderPastCard(ev) {
    const formatIcon = ev.format === 'en_personne' ? 'fa-users' : 'fa-video';
    const formatLabel = ev.format === 'en_personne' ? 'En personne' : ev.type === 'webinaire' ? 'Webinaire gratuit' : 'En ligne';

    return `
        <div class="event-card event-card--past">
            <div class="event-date-col">
                <span class="event-day">${ev.jour || '-'}</span>
                <span class="event-month">${ev.mois || ''}</span>
            </div>
            <div class="event-content">
                <span class="event-tag event-tag--past">Terminé</span>
                <h4>${ev.titre || 'Événement'}</h4>
                <div class="event-meta">
                    ${ev.heure ? `<span><i class="fas fa-clock"></i> ${ev.heure}</span>` : ''}
                    <span><i class="fas ${formatIcon}"></i> ${formatLabel}</span>
                </div>
            </div>
        </div>`;
}

function trackEventClick(type, titre) {
    if (typeof gtag === 'function') {
        gtag('event', 'inscription_evenement', {
            event_type: type,
            event_titre: titre
        });
    }
}
