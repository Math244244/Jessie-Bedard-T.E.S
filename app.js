document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALISATION DES ANIMATIONS AU DÉFILEMENT ---
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50,
    });

    // --- GESTION DU MENU MOBILE ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinksInMenu = navMenu.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    const closeMenu = () => {
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    navLinksInMenu.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- GESTION DE LA FAQ ACCORDÉON ---
    const faqItems = document.querySelectorAll('.faq-item-box');
    faqItems.forEach(item => {
        item.addEventListener('toggle', (event) => {
            if (item.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });

    // --- GESTION DE L'ACCORDÉON DES PROBLÉMATIQUES ---
    const issueCards = document.querySelectorAll('.issue-card');
    issueCards.forEach(card => {
        card.addEventListener('toggle', (event) => {
            // Si la carte vient de s'ouvrir
            if (card.open) {
                // Ferme toutes les autres cartes
                issueCards.forEach(otherCard => {
                    if (otherCard !== card && otherCard.open) {
                        otherCard.open = false;
                    }
                });
            }
        });
    });


    // --- SURBRillance du lien de navigation actif AU DÉFILEMENT ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta)');

    const updateActiveLink = () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // --- GESTION DU BOUTON "RETOUR EN HAUT" ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.opacity = '1';
                backToTopButton.style.visibility = 'visible';
            } else {
                backToTopButton.style.opacity = '0';
                backToTopButton.style.visibility = 'hidden';
            }
        });
    }

    // --- GESTION DU CARROUSEL DE TÉMOIGNAGES (SWIPER) ---
    if (typeof Swiper !== 'undefined') {
        const swiper = new Swiper('.testimonial-slider', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: {
                delay: 7000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }
});
