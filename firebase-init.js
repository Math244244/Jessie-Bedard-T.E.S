// =============================================
// Google Analytics 4 — Événements personnalisés
// Jessie Bédard, T.E.S.
// 
// Le suivi de base (pages vues, sessions, etc.)
// est géré par le tag gtag.js dans le <head>.
// Ce fichier ajoute des événements personnalisés
// pour un suivi plus précis des interactions.
// =============================================

// Attendre que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {

    // Vérifier que gtag est disponible
    if (typeof gtag !== 'function') {
        console.warn('⚠️ Google Analytics (gtag) non disponible — les événements personnalisés ne seront pas suivis.');
        return;
    }

    console.log('✅ Google Analytics 4 actif — Événements personnalisés activés.');

    // --- 1. Suivre les clics sur "Prendre RDV" (lien Psylio) ---
    document.querySelectorAll('a[href*="psylio.com"]').forEach(link => {
        link.addEventListener('click', () => {
            gtag('event', 'clic_prise_rdv', {
                page_title: document.title,
                page_location: window.location.href
            });
        });
    });

    // --- 2. Suivre les clics sur les liens email (mailto) ---
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', () => {
            gtag('event', 'clic_envoi_courriel', {
                page_title: document.title,
                page_location: window.location.href
            });
        });
    });

    // --- 3. Suivre les clics sur le lien du webinaire ---
    document.querySelectorAll('a[href*="webinaire"], a[href*="#webinaire"]').forEach(link => {
        link.addEventListener('click', () => {
            gtag('event', 'clic_webinaire', {
                page_title: document.title,
                page_location: window.location.href
            });
        });
    });

    // --- 4. Suivre le scroll profond (75% de la page lue) ---
    let scrollTracked = false;
    window.addEventListener('scroll', () => {
        if (scrollTracked) return;
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        if (scrollPercentage >= 75) {
            scrollTracked = true;
            gtag('event', 'scroll_profond', {
                page_title: document.title,
                page_location: window.location.href,
                pourcentage: '75%'
            });
        }
    }, { passive: true });

    // --- 5. Suivre les clics sur les boutons CTA (Contact / RDV) ---
    document.querySelectorAll('.cta').forEach(btn => {
        btn.addEventListener('click', () => {
            gtag('event', 'clic_cta', {
                button_text: btn.textContent.trim().substring(0, 50),
                page_title: document.title,
                page_location: window.location.href
            });
        });
    });

    // --- 6. Suivre le temps passé sur la page (30s, 60s, 120s) ---
    const timeThresholds = [30, 60, 120];
    timeThresholds.forEach(seconds => {
        setTimeout(() => {
            gtag('event', 'temps_sur_page', {
                duree_secondes: seconds,
                page_title: document.title,
                page_location: window.location.href
            });
        }, seconds * 1000);
    });

});
