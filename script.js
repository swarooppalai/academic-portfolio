/* ═══════════════════════════════════════════════════
   Swaroop Kumar Palai — Academic Portfolio
   JavaScript — Navigation, Scroll Reveal, Active Links
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Mobile nav toggle ───
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // ─── Navbar scroll effect ───
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
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
});
