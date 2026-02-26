/**
 * Jessie Bédard, T.E.S. — Script principal v2.0
 * Gère : animations AOS, menu mobile, FAQ accordéon,
 * carrousel témoignages, bouton retour en haut, header scroll,
 * animation compteurs, micro-interactions.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALISATION DES ANIMATIONS AU DÉFILEMENT ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out',
            once: true,
            offset: 50,
        });
    }

    // --- GESTION DU MENU MOBILE ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        const navLinksInMenu = navMenu.querySelectorAll('.nav-link');

        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');

            // Change l'icône hamburger / close
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        const closeMenu = () => {
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        };

        navLinksInMenu.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // --- GESTION DE LA FAQ ACCORDÉON ---
    const faqItems = document.querySelectorAll('.faq-item-box');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.open) {
                            otherItem.open = false;
                        }
                    });
                }
            });
        });
    }

    // --- GESTION DE L'ACCORDÉON DES PROBLÉMATIQUES ---
    const issueCards = document.querySelectorAll('.issue-card');
    if (issueCards.length > 0) {
        issueCards.forEach(card => {
            card.addEventListener('toggle', () => {
                if (card.open) {
                    issueCards.forEach(otherCard => {
                        if (otherCard !== card && otherCard.open) {
                            otherCard.open = false;
                        }
                    });
                }
            });
        });
    }

    // --- HEADER : EFFET AU SCROLL ---
    const header = document.querySelector('header');
    if (header) {
        const handleHeaderScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll();
    }

    // --- GESTION DU BOUTON "RETOUR EN HAUT" ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        const handleBackToTop = () => {
            if (window.scrollY > 400) {
                backToTopButton.style.opacity = '1';
                backToTopButton.style.visibility = 'visible';
            } else {
                backToTopButton.style.opacity = '0';
                backToTopButton.style.visibility = 'hidden';
            }
        };
        window.addEventListener('scroll', handleBackToTop, { passive: true });
        handleBackToTop();

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- GESTION DU CARROUSEL DE TÉMOIGNAGES (SWIPER) ---
    if (typeof Swiper !== 'undefined' && document.querySelector('.testimonial-slider')) {
        new Swiper('.testimonial-slider', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: {
                delay: 6000,
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

    // --- ANIMATION DES COMPTEURS (BANDE DE CONFIANCE) ---
    const trustNumbers = document.querySelectorAll('.trust-number[data-count]');
    if (trustNumbers.length > 0) {
        let countersAnimated = false;

        const animateCounters = () => {
            trustNumbers.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const suffix = counter.getAttribute('data-suffix') || '';
                const duration = 1500; // ms
                const steps = 40;
                const increment = target / steps;
                let current = 0;
                let step = 0;

                const timer = setInterval(() => {
                    step++;
                    current = Math.min(Math.round(increment * step), target);
                    counter.textContent = current + suffix;

                    if (step >= steps) {
                        counter.textContent = target + suffix;
                        clearInterval(timer);
                    }
                }, duration / steps);
            });
        };

        // Observer pour déclencher l'animation au scroll
        const trustStrip = document.querySelector('.trust-strip');
        if (trustStrip) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !countersAnimated) {
                        countersAnimated = true;
                        animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(trustStrip);
        }
    }

    // --- PARALLAXE SUBTILE SUR LE HÉRO ---
    const heroImage = document.querySelector('.hero-image-container');
    if (heroImage && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < 600) {
                heroImage.style.transform = `translateY(${scrolled * 0.08}px)`;
            }
        }, { passive: true });
    }

    // --- GESTION ROBUSTE DES LIENS MAILTO ---
    // Affiche un panneau avec plusieurs options pour envoyer un email
    // au cas où le client email natif ne s'ouvre pas.
    const mailtoCtaLinks = document.querySelectorAll('a.cta[href^="mailto:"]');
    if (mailtoCtaLinks.length > 0) {
        const EMAIL = 'jbedard_89@hotmail.com';

        // Créer le panneau de fallback
        const overlay = document.createElement('div');
        overlay.id = 'mailto-overlay';
        overlay.innerHTML = `
            <div class="mailto-panel">
                <button class="mailto-panel-close" aria-label="Fermer"><i class="fas fa-times"></i></button>
                <div class="mailto-panel-icon"><i class="fas fa-envelope-open-text"></i></div>
                <h3>Envoyer un courriel</h3>
                <p>Choisissez comment vous souhaitez m'écrire :</p>
                <div class="mailto-panel-options">
                    <a id="mailto-gmail" href="#" target="_blank" rel="noopener noreferrer" class="mailto-option mailto-option-gmail">
                        <i class="fas fa-envelope"></i>
                        <span>Ouvrir avec Gmail</span>
                    </a>
                    <a id="mailto-outlook" href="#" target="_blank" rel="noopener noreferrer" class="mailto-option mailto-option-outlook">
                        <i class="fas fa-envelope"></i>
                        <span>Ouvrir avec Outlook</span>
                    </a>
                    <a id="mailto-default" href="#" class="mailto-option mailto-option-default">
                        <i class="fas fa-desktop"></i>
                        <span>Application email par défaut</span>
                    </a>
                </div>
                <div class="mailto-panel-copy">
                    <p>Ou copiez l'adresse :</p>
                    <div class="mailto-copy-row">
                        <span class="mailto-copy-email">${EMAIL}</span>
                        <button class="mailto-copy-btn"><i class="fas fa-copy"></i> Copier</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Fermer le panneau
        const closePanel = () => {
            overlay.classList.remove('show');
            document.body.classList.remove('no-scroll');
        };
        overlay.querySelector('.mailto-panel-close').addEventListener('click', closePanel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePanel();
        });

        // Bouton copier
        overlay.querySelector('.mailto-copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(EMAIL).then(() => {
                const btn = overlay.querySelector('.mailto-copy-btn');
                btn.innerHTML = '<i class="fas fa-check"></i> Copié !';
                btn.style.background = 'var(--color-accent)';
                btn.style.color = '#fff';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copier';
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2500);
            });
        });

        // Attacher à chaque bouton mailto CTA
        mailtoCtaLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const mailtoUrl = link.getAttribute('href');

                // Extraire le sujet du mailto URL
                let subject = 'Prise de contact - Site Web';
                const subjectMatch = mailtoUrl.match(/subject=([^&]*)/);
                if (subjectMatch) {
                    subject = decodeURIComponent(subjectMatch[1]);
                }
                const subjectEncoded = encodeURIComponent(subject);

                // Mettre à jour les liens dynamiquement
                overlay.querySelector('#mailto-gmail').href =
                    `https://mail.google.com/mail/?view=cm&to=${EMAIL}&su=${subjectEncoded}`;
                overlay.querySelector('#mailto-outlook').href =
                    `https://outlook.live.com/mail/0/deeplink/compose?to=${EMAIL}&subject=${subjectEncoded}`;
                overlay.querySelector('#mailto-default').href = mailtoUrl;

                // Afficher le panneau
                overlay.classList.add('show');
                document.body.classList.add('no-scroll');
            });
        });
    }

});
