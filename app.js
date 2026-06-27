/**
 * VR Setdesigner - Core Website Logic
 * Handles scroll-linked interactions, reveal animations, legal modals, and bilingual toggling.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Bilingual Toggle Logic (DE | EN) with LocalStorage persistence
       ========================================================================== */
    const btnLangEn = document.getElementById('btn-lang-en');
    const btnLangDe = document.getElementById('btn-lang-de');
    const bodyEl = document.body;

    function setLanguage(lang) {
        const studiesInput = document.getElementById('studies-email');
        if (lang === 'de') {
            bodyEl.className = 'lang-de';
            btnLangDe.classList.add('active');
            btnLangEn.classList.remove('active');
            localStorage.setItem('preferred-lang', 'de');
            if (studiesInput) {
                studiesInput.placeholder = 'E-Mail-Adresse eingeben...';
            }
        } else {
            bodyEl.className = 'lang-en';
            btnLangEn.classList.add('active');
            btnLangDe.classList.remove('active');
            localStorage.setItem('preferred-lang', 'en');
            if (studiesInput) {
                studiesInput.placeholder = 'Enter your email...';
            }
        }
        
        // Refresh intersection observer targets if needed (re-trigger observer to ensure active nodes align)
        document.dispatchEvent(new Event('scroll'));
    }

    if (btnLangEn && btnLangDe) {
        btnLangEn.addEventListener('click', () => setLanguage('en'));
        btnLangDe.addEventListener('click', () => setLanguage('de'));

        // Load preferred language
        const savedLang = localStorage.getItem('preferred-lang');
        if (savedLang === 'de') {
            setLanguage('de');
        } else if (savedLang === 'en') {
            setLanguage('en');
        } else {
            // Default to browser language if German, otherwise English
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('de')) {
                setLanguage('de');
            } else {
                setLanguage('en');
            }
        }
    }


    /* ==========================================================================
       2. Sticky Visuals Crossfade (Scroll-Linked Showcase)
       ========================================================================== */
    const stepAnchors = document.querySelectorAll('.showcase-step-anchor');
    const showcaseImgs = document.querySelectorAll('.showcase-img');

    if (stepAnchors.length > 0 && showcaseImgs.length > 0) {
        let currentActiveTarget = 'img-splat'; // Track current to avoid redundant DOM writes

        function updateShowcase() {
            const viewportCenter = window.innerHeight / 2;
            let closestAnchor = null;
            let closestDistance = Infinity;

            stepAnchors.forEach(anchor => {
                const rect = anchor.getBoundingClientRect();
                const anchorCenter = rect.top + rect.height / 2;
                const distance = Math.abs(anchorCenter - viewportCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestAnchor = anchor;
                }
            });

            if (closestAnchor) {
                const targetId = closestAnchor.getAttribute('data-target');
                if (targetId && targetId !== currentActiveTarget) {
                    currentActiveTarget = targetId;

                    // Switch image
                    showcaseImgs.forEach(img => img.classList.remove('active'));
                    const targetImg = document.getElementById(targetId);
                    if (targetImg) targetImg.classList.add('active');

                    // Switch step card highlight
                    stepAnchors.forEach(a => {
                        const card = a.querySelector('.step-card');
                        if (card) card.classList.remove('active-focus');
                    });
                    const activeCard = closestAnchor.querySelector('.step-card');
                    if (activeCard) activeCard.classList.add('active-focus');
                }
            }
        }

        window.addEventListener('scroll', updateShowcase, { passive: true });
        // Run once on load to set initial state
        updateShowcase();
    }


    /* ==========================================================================
       3. Scroll Reveal Animations
       ========================================================================== */
    // Exclude .step-card from reveal animation — its opacity is controlled by the showcase scroll logic
    const revealElements = document.querySelectorAll('.feature-row, .team-card, .metric-card, .collab-text, .about-content, .vision-card, .studies-card');
    
    // Add initial setup style for animation support
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Once revealed, we don't need to observe it anymore
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    /* ==========================================================================
       4. Active Navigation State on Scroll
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const viewportCenter = window.innerHeight / 2;
        let activeSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Check if section is visible at all
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const sectionCenter = rect.top + rect.height / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeSection = section;
                }
            }
        });

        if (activeSection) {
            const id = activeSection.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    // Run once on load
    updateActiveNav();


    /* ==========================================================================
       5. Legal Modals (Impressum & Datenschutz)
       ========================================================================== */
    const privacyLink = document.getElementById('link-privacy');
    const privacyModal = document.getElementById('modal-privacy');
    const closePrivacy = document.getElementById('close-privacy');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (privacyLink && privacyModal) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    }

    if (closePrivacy) {
        closePrivacy.addEventListener('click', () => closeModal(privacyModal));
    }

    // Close on overlay click
    if (privacyModal) {
        privacyModal.addEventListener('click', (e) => {
            if (e.target === privacyModal) {
                closeModal(privacyModal);
            }
        });
    }

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(privacyModal);
        }
    });

    /* ==========================================================================
       6. User Studies Email Form Submission
       ========================================================================== */
    const studiesForm = document.getElementById('studies-form');
    const studiesSuccess = document.getElementById('studies-success');

    if (studiesForm) {
        studiesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('studies-email');
            if (!emailInput || !emailInput.value) return;

            // Google Form submission parameters
            const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfAjxgh9ZYZw48BZqF4gP5dLP9-BiIfcgPyLSSog3cLWt2ksQ/formResponse';
            const body = `entry.1803176717=${encodeURIComponent(emailInput.value)}`;

            // Send in background using no-cors mode
            fetch(formUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            }).then(() => {
                console.log('Successfully posted email to Google Forms.');
            }).catch((err) => {
                console.error('Google Forms post error:', err);
            });

            // Fade out form elements instantly
            studiesForm.style.opacity = '0';
            studiesForm.style.pointerEvents = 'none';

            // Wait for transition, then hide form and show success message
            setTimeout(() => {
                studiesForm.style.display = 'none';
                if (studiesSuccess) {
                    studiesSuccess.classList.add('show');
                }
            }, 300);
        });
    }

    /* ==========================================================================
       7. Mobile Hamburger Menu Toggle
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const mainHeader = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && mainHeader) {
        menuToggle.addEventListener('click', () => {
            mainHeader.classList.toggle('mobile-open');
        });
    }

    // Auto-close menu drawer when clicking on navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainHeader) {
                mainHeader.classList.remove('mobile-open');
            }
        });
    });

    // Close menu drawer if window is resized above mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 767 && mainHeader) {
            mainHeader.classList.remove('mobile-open');
        }
    });

});
