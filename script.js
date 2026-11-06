/* ═══════════════════════════════════════════════════
   Swaroop Kumar Palai — Academic Portfolio
   JavaScript — Navigation, Scroll Reveal, Active Links
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Accessible Mobile nav toggle ───
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    const toggleNav = (forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !navLinks.classList.contains('open');
        navLinks.classList.toggle('open', isOpen);
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNav();
        });

        // Close mobile nav on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleNav(false));
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                toggleNav(false);
            }
        });

        // Close mobile nav on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                toggleNav(false);
                navToggle.focus();
            }
        });
    }

    // ─── Navbar scroll effect ───
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ─── Active nav link on scroll ───
    const sections = document.querySelectorAll('.section, #hero');
    const navAnchors = document.querySelectorAll('.nav-links a');

    const updateActiveLink = () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navAnchors.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    // ─── Scroll reveal (Intersection Observer) ───
    const revealTargets = document.querySelectorAll(
        '.section-title, .project-card, .pub-card, .edu-card, .award-card, ' +
        '.stat-card, .talk-item, .skill-group, .coursework-item, .contact-link'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger the animations slightly
                const delay = Array.from(entry.target.parentElement.children)
                    .indexOf(entry.target) * 60;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Math.min(delay, 300));
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach(el => revealObserver.observe(el));

    // ─── Real Leaflet Toulouse Map (CEMES-CNRS Plus Code: HFH7+J2) ───
    const mapElement = document.getElementById('toulouseMap');
    if (mapElement && typeof L !== 'undefined') {
        const cemesCoords = [43.5791, 1.4627]; // CEMES-CNRS, 29 Rue Jeanne Marvig, 31055 Toulouse (Plus Code: HFH7+J2)
        const map = L.map('toulouseMap', {
            center: cemesCoords,
            zoom: 16,
            zoomControl: true,
            scrollWheelZoom: false
        });

        // OpenStreetMap tile URL (100% free, no API key required)
        const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        const tileOptions = {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
            maxZoom: 19
        };

        let currentTileLayer = L.tileLayer(osmTileUrl, tileOptions).addTo(map);

        // Custom Waze-style animated marker pin on CEMES
        const wazeIcon = L.divIcon({
            className: 'waze-leaflet-marker',
            html: `
                <div class="waze-pin-wrapper">
                    <div class="waze-radar-wave r1"></div>
                    <div class="waze-radar-wave r2"></div>
                    <div class="waze-beacon-core" title="CEMES-CNRS (HFH7+J2 Toulouse)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.12 7.23L4 22l3.43-1.03C9.07 21.62 10.49 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                        </svg>
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const marker = L.marker(cemesCoords, { icon: wazeIcon }).addTo(map);

        // Update map theme hook (handled seamlessly via CSS tile-pane filter)
        window.updateMapTheme = (isDark) => {
            if (map) {
                map.invalidateSize();
            }
        };

        // Fix map size on container resize / load
        setTimeout(() => map.invalidateSize(), 400);
    }

    // ─── Hero Card Dark Mode Toggle & Visual Affordance ───
    const heroCard = document.getElementById('heroCard') || document.querySelector('.hero-content');
    const heroThemeBadge = document.getElementById('heroThemeBadge');
    const heroThemeIcon  = document.getElementById('heroThemeIcon');
    const heroThemeText  = document.getElementById('heroThemeText');

    const moonIconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIconSvg  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    const syncThemeUI = (isDark) => {
        if (heroThemeIcon) heroThemeIcon.innerHTML = isDark ? sunIconSvg : moonIconSvg;
        if (heroThemeText) heroThemeText.textContent = isDark ? 'Light mode' : 'Dark mode';
    };

    // Initialize from localStorage
    const savedTheme = localStorage.getItem('portfolio-theme');
    const initialIsDark = savedTheme === 'dark';
    if (initialIsDark) {
        document.body.classList.add('dark-mode');
        if (window.updateMapTheme) window.updateMapTheme(true);
    }
    syncThemeUI(initialIsDark);

    if (heroCard) {
        const toggleTheme = () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
            syncThemeUI(isDark);
            if (window.updateMapTheme) {
                window.updateMapTheme(isDark);
            }
            window.dispatchEvent(new Event('resize'));
        };

        heroCard.addEventListener('click', (e) => {
            // Do not toggle theme if clicking action buttons or links inside the hero card
            if (e.target.closest('a, button, .btn')) {
                return;
            }
            toggleTheme();
        });

        heroCard.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a, button, .btn')) {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
});




