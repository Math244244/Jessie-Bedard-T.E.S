document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DU MENU HAMBURGER POUR MOBILE ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // --- GESTION DU BOUTON "RETOUR EN HAUT" ---
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // --- GESTION DES ANIMATIONS AU DÉFILEMENT (INTERSECTION OBSERVER) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation pour le fade-in général
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observer les sections pour le fade-in
    const fadeInSections = document.querySelectorAll('.fade-in');
    fadeInSections.forEach(section => observer.observe(section));

});
