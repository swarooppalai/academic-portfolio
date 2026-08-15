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

    // ─── Real Leaflet Toulouse Map (CEMES-CNRS) ───
    const mapElement = document.getElementById('toulouseMap');
    if (mapElement && typeof L !== 'undefined') {
        const cemesCoords = [43.5828, 1.4651]; // CEMES-CNRS, 29 Rue Jeanne Marvig, 31055 Toulouse
        const map = L.map('toulouseMap', {
            center: cemesCoords,
            zoom: 15,
            zoomControl: true,
            scrollWheelZoom: false
        });

        // CartoDB tile URLs (light & dark)
        const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        const tileOptions = {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        };

        let currentTileLayer = L.tileLayer(
            document.body.classList.contains('dark-mode') ? darkTileUrl : lightTileUrl,
            tileOptions
        ).addTo(map);

        // Custom Waze-style animated marker pin on CEMES
        const wazeIcon = L.divIcon({
            className: 'waze-leaflet-marker',
            html: `
                <div class="waze-pin-wrapper">
                    <div class="waze-radar-wave r1"></div>
                    <div class="waze-radar-wave r2"></div>
                    <div class="waze-beacon-core" title="CEMES-CNRS">
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

        marker.bindPopup(`
            <div class="map-popup-editorial">
                <p class="popup-label">RESEARCH LAB LOCATION</p>
                <h4 class="popup-title">CEMES-CNRS · LPCNO</h4>
                <p class="popup-address">29 Rue Jeanne Marvig, 31055 Toulouse</p>
                <p class="popup-author">Swaroop Kumar Palai</p>
            </div>
        `, {
            offset: [0, -14],
            closeButton: false,
            autoClose: false,
            closeOnClick: false
        }).openPopup();

        // Update map tiles on theme change
        window.updateMapTheme = (isDark) => {
            if (map && currentTileLayer) {
                map.removeLayer(currentTileLayer);
                currentTileLayer = L.tileLayer(isDark ? darkTileUrl : lightTileUrl, tileOptions).addTo(map);
            }
        };

        // Fix map size on container resize / load
        setTimeout(() => map.invalidateSize(), 400);
    }

    // ─── Hero Card Dark Mode Toggle ───
    const heroCard = document.getElementById('heroCard') || document.querySelector('.hero-content');

    // Initialize from localStorage
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (window.updateMapTheme) window.updateMapTheme(true);
    }

    if (heroCard) {
        const toggleTheme = () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
            if (window.updateMapTheme) {
                window.updateMapTheme(isDark);
            }
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




