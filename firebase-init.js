// =============================================
// Firebase Analytics — Jessie Bédard, T.E.S.
// Ce fichier initialise Firebase et active le
// suivi analytique sur toutes les pages du site.
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

// Configuration Firebase (depuis la console Firebase > Paramètres du projet)
const firebaseConfig = {
    apiKey: "AIzaSyCP6CF2tAlAtxZVt3TRANK4jZ_5z6bP5z0",
    authDomain: "jessie-tes.firebaseapp.com",
    projectId: "jessie-tes",
    storageBucket: "jessie-tes.firebasestorage.app",
    messagingSenderId: "59395449881",
    appId: "1:59395449881:web:03cbe0b6b210b28746f688",
    measurementId: "G-WF8XNMFQXV"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Activer Google Analytics
const analytics = getAnalytics(app);

// --- Événements personnalisés pour un suivi plus précis ---

// 1. Suivre les clics sur le bouton "Prendre RDV"
document.querySelectorAll('a[href*="psylio.com"]').forEach(link => {
    link.addEventListener('click', () => {
        logEvent(analytics, 'clic_prise_rdv', {
            page: document.title,
            url: window.location.pathname
        });
    });
});

// 2. Suivre les clics sur les liens mailto (envoi de courriel)
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
        logEvent(analytics, 'clic_envoi_courriel', {
            page: document.title,
            url: window.location.pathname
        });
    });
});

// 3. Suivre les clics sur le lien du webinaire
document.querySelectorAll('a[href*="webinaire"], a[href*="#webinaire"]').forEach(link => {
    link.addEventListener('click', () => {
        logEvent(analytics, 'clic_webinaire', {
            page: document.title,
            url: window.location.pathname
        });
    });
});

// 4. Suivre le scroll profond (l'utilisateur a lu au moins 75% de la page)
let scrollTracked = false;
window.addEventListener('scroll', () => {
    if (scrollTracked) return;
    const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    if (scrollPercentage >= 75) {
        scrollTracked = true;
        logEvent(analytics, 'scroll_profond', {
            page: document.title,
            url: window.location.pathname,
            pourcentage: '75%'
        });
    }
}, { passive: true });

console.log('✅ Firebase Analytics activé — Jessie Bédard, T.E.S.');
