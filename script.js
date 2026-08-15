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

    // ─── Floating CV Modal & Native HTML5 Canvas Renderer ───
    const openCvBtn = document.getElementById('openCvBtn');
    const cvModal = document.getElementById('cvModal');
    const closeCvModal = document.getElementById('closeCvModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfScrollContainer = document.getElementById('pdfScrollContainer');

    let pdfLoaded = false;
    let isRendering = false;

    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const renderPdfDocument = async (url) => {
        if (!pdfViewer || isRendering) return;
        isRendering = true;
        pdfViewer.innerHTML = `
            <div class="pdf-loading-spinner">
                <div class="spinner"></div>
                <p>Loading Curriculum Vitae...</p>
            </div>
        `;

        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded');
            }

            const loadingTask = pdfjsLib.getDocument(url);
            const pdfDoc = await loadingTask.promise;
            pdfViewer.innerHTML = '';

            const containerWidth = Math.max((pdfScrollContainer ? pdfScrollContainer.clientWidth : window.innerWidth) - 32, 280);

            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                
                // Calculate scale to fit container width nicely
                const unscaledViewport = page.getViewport({ scale: 1 });
                const baseScale = Math.min(containerWidth / unscaledViewport.width, 1.4);
                
                // Use devicePixelRatio for super crisp Retina rendering
                const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
                const viewport = page.getViewport({ scale: baseScale * dpr });

                const wrapper = document.createElement('div');
                wrapper.className = 'pdf-page-wrapper';

                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width / dpr}px`;
                canvas.style.height = `${viewport.height / dpr}px`;

                wrapper.appendChild(canvas);
                pdfViewer.appendChild(wrapper);

                const ctx = canvas.getContext('2d');
                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
            }
            pdfLoaded = true;
        } catch (err) {
            console.error('PDF.js rendering error:', err);
            pdfViewer.innerHTML = `
                <div class="pdf-fallback">
                    <p>Unable to preview PDF directly in this browser.</p>
                    <a href="${url}" download="Swaroop_Palai_Academic_CV.pdf" class="btn btn-primary">Download PDF Document</a>
                </div>
            `;
        } finally {
            isRendering = false;
        }
    };

    const openModal = () => {
        if (cvModal) {
            cvModal.classList.add('active');
            cvModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            if (closeCvModal) closeCvModal.focus();

            if (!pdfLoaded) {
                renderPdfDocument('Swaroop_Palai_Academic_CV.pdf');
            }
        }
    };

    const closeModal = () => {
        if (cvModal) {
            cvModal.classList.remove('active');
            cvModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            if (openCvBtn) openCvBtn.focus();
        }
    };

    if (openCvBtn) {
        openCvBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal();
        });
    }
    if (closeCvModal) closeCvModal.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cvModal && cvModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Re-render on orientation change/window resize if modal is open
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (cvModal && cvModal.classList.contains('active') && pdfLoaded) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderPdfDocument('Swaroop_Palai_Academic_CV.pdf');
            }, 300);
        }
    });
});




