/**
 * Swaroop Kumar Palai — Interactive Physics & Experimental Lab Suite
 * High-performance, canvas-based simulations for:
 * 1. Optical Bench (Two-Mirror Beam Walking)
 * 2. 2D Semiconductor Exciton & Strain Physics
 * 3. NV Centers in Diamond & ODMR Spectroscopy
 * 4. AFM Nanoxerography & Directed Assembly
 * 5. Hanbury Brown–Twiss g²(τ) Single-Photon Autocorrelation
 */

(function () {
    'use strict';

    // Theme color helper
    function getThemeColors() {
        const isDark = document.body.classList.contains('dark-mode');
        return {
            isDark: isDark,
            bg: isDark ? '#14171d' : '#fcfbf8',
            surface: isDark ? '#1a1f27' : '#f4f1ea',
            grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            textPrimary: isDark ? '#f0f3f6' : '#1e242b',
            textSecondary: isDark ? '#9aa4b2' : '#5c6470',
            accent: '#C4652A',
            accentGlow: 'rgba(196, 101, 42, 0.35)',
            green: '#2e9e66',
            greenGlow: 'rgba(46, 158, 102, 0.35)',
            blue: '#2d7dd2',
            laserRed: '#f43f5e',
            laserGreen: '#10b981',
            laserViolet: '#8b5cf6',
            border: isDark ? '#2d333f' : '#e2ded5'
        };
    }

    // High-DPI canvas scaler
    function setupCanvasDPI(canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.floor(rect.width) || 600;
        const height = Math.floor(rect.height) || 360;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.resetTransform && ctx.resetTransform();
        ctx.scale(dpr, dpr);
        return { ctx, width, height, dpr };
    }

    // ─────────────────────────────────────────────────────────────
    // 01. OPTICAL BENCH: TWO-MIRROR BEAM WALKING SIMULATION
    // ─────────────────────────────────────────────────────────────
    class OpticalBenchSim {
        constructor() {
            this.canvas = document.getElementById('benchCanvas');
            if (!this.canvas) return;
            this.m1Slider = document.getElementById('benchM1');
            this.m2Slider = document.getElementById('benchM2');
            this.laserPowerSlider = document.getElementById('benchPower');
            this.alignBtn = document.getElementById('benchAutoAlign');
            this.misalignBtn = document.getElementById('benchMisalign');
            this.wlButtons = document.querySelectorAll('.bench-wl-btn');
            this.throughputBadge = document.getElementById('benchThroughput');
            this.statusBadge = document.getElementById('benchStatus');

            this.theta1 = parseFloat(this.m1Slider.value); // Mirror 1 angle delta
            this.theta2 = parseFloat(this.m2Slider.value); // Mirror 2 angle delta
            this.power = parseFloat(this.laserPowerSlider.value);
            this.wavelength = 'green'; // 'green' (532nm), 'red' (637nm), 'violet' (405nm)

            this.isAutoWalking = false;
            this.animFrame = null;

            this.bindEvents();
            this.render();
        }

        bindEvents() {
            this.m1Slider.addEventListener('input', () => {
                this.theta1 = parseFloat(this.m1Slider.value);
                document.getElementById('benchM1Val').textContent = `${this.theta1 > 0 ? '+' : ''}${this.theta1.toFixed(1)}°`;
                this.render();
            });

            this.m2Slider.addEventListener('input', () => {
                this.theta2 = parseFloat(this.m2Slider.value);
                document.getElementById('benchM2Val').textContent = `${this.theta2 > 0 ? '+' : ''}${this.theta2.toFixed(1)}°`;
                this.render();
            });

            this.laserPowerSlider.addEventListener('input', () => {
                this.power = parseFloat(this.laserPowerSlider.value);
                document.getElementById('benchPowerVal').textContent = `${this.power} mW`;
                this.render();
            });

            this.wlButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.wlButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.wavelength = btn.dataset.wl;
                    this.render();
                });
            });

            this.misalignBtn.addEventListener('click', () => {
                this.theta1 = (Math.random() * 8 - 4);
                this.theta2 = (Math.random() * 8 - 4);
                this.m1Slider.value = this.theta1.toFixed(1);
                this.m2Slider.value = this.theta2.toFixed(1);
                document.getElementById('benchM1Val').textContent = `${this.theta1 > 0 ? '+' : ''}${this.theta1.toFixed(1)}°`;
                document.getElementById('benchM2Val').textContent = `${this.theta2 > 0 ? '+' : ''}${this.theta2.toFixed(1)}°`;
                this.render();
            });

            this.alignBtn.addEventListener('click', () => {
                this.runAutoBeamWalk();
            });

            window.addEventListener('resize', () => this.render(), { passive: true });
        }

        runAutoBeamWalk() {
            if (this.isAutoWalking) return;
            this.isAutoWalking = true;
            this.alignBtn.disabled = true;

            let step = 0;
            const maxSteps = 16;
            const interval = setInterval(() => {
                // Step A: Walk M1 to center on P1
                // Step B: Walk M2 to center on P2
                if (step % 2 === 0) {
                    this.theta1 *= 0.65;
                } else {
                    this.theta2 *= 0.65;
                }

                if (Math.abs(this.theta1) < 0.05) this.theta1 = 0;
                if (Math.abs(this.theta2) < 0.05) this.theta2 = 0;

                this.m1Slider.value = this.theta1.toFixed(1);
                this.m2Slider.value = this.theta2.toFixed(1);
                document.getElementById('benchM1Val').textContent = `${this.theta1 > 0 ? '+' : ''}${this.theta1.toFixed(1)}°`;
                document.getElementById('benchM2Val').textContent = `${this.theta2 > 0 ? '+' : ''}${this.theta2.toFixed(1)}°`;
                this.render();

                step++;
                if (step >= maxSteps || (Math.abs(this.theta1) < 0.05 && Math.abs(this.theta2) < 0.05)) {
                    clearInterval(interval);
                    this.theta1 = 0;
                    this.theta2 = 0;
                    this.m1Slider.value = '0.0';
                    this.m2Slider.value = '0.0';
                    document.getElementById('benchM1Val').textContent = '0.0°';
                    document.getElementById('benchM2Val').textContent = '0.0°';
                    this.isAutoWalking = false;
                    this.alignBtn.disabled = false;
                    this.render();
                }
            }, 120);
        }

        render() {
            const { ctx, width, height } = setupCanvasDPI(this.canvas);
            const colors = getThemeColors();

            // Background breadboard grid
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            // Breadboard tapped holes (25mm grid)
            ctx.fillStyle = colors.grid;
            const gridSpacing = 28;
            for (let x = gridSpacing; x < width; x += gridSpacing) {
                for (let y = gridSpacing; y < height; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Component positions
            const laser = { x: 50, y: height - 60, w: 60, h: 36 };
            const m1 = { x: width * 0.28, y: height - 60 };
            const m2 = { x: width * 0.28, y: 70 };
            const p1 = { x: width * 0.54, y: 70 };
            const p2 = { x: width * 0.78, y: 70 };
            const detector = { x: width - 50, y: 70, w: 32, h: 48 };

            // Draw Laser Head
            ctx.fillStyle = colors.surface;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1.5;
            ctx.fillRect(laser.x - laser.w, laser.y - laser.h / 2, laser.w, laser.h);
            ctx.strokeRect(laser.x - laser.w, laser.y - laser.h / 2, laser.w, laser.h);
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LASER', laser.x - laser.w / 2, laser.y + 4);

            // Beam color determination
            let beamColor = colors.laserGreen;
            let beamWlLabel = '532 nm (Nd:YAG)';
            if (this.wavelength === 'red') {
                beamColor = colors.laserRed;
                beamWlLabel = '637 nm (NV Red)';
            } else if (this.wavelength === 'violet') {
                beamColor = colors.laserViolet;
                beamWlLabel = '405 nm (Diode)';
            }

            // Ray tracing physics:
            // Beam 1: Laser -> M1 (horizontal)
            // Beam 2: M1 -> M2 (vertical with theta1 tilt)
            // Beam 3: M2 -> P1 -> P2 -> Detector (horizontal with theta1 & theta2 combined tilt)

            // Tilt angles in radians:
            const rad1 = (this.theta1 * Math.PI) / 180;
            const rad2 = (this.theta2 * Math.PI) / 180;

            // M1 to M2 trajectory
            // Deflection angle from vertical = 2 * theta1
            const m1Angle = 2 * rad1;
            const m2HitX = m1.x + (m1.y - m2.y) * Math.tan(m1Angle);

            // M2 to target trajectory
            // Deflection angle from horizontal = - (2 * rad2 - m1Angle)
            const m2OutAngle = -(2 * rad2 - m1Angle * 0.5);

            // Pinholes: Target Y is 70
            const yAtP1 = m2.y + (p1.x - m2HitX) * Math.tan(m2OutAngle);
            const yAtP2 = m2.y + (p2.x - m2HitX) * Math.tan(m2OutAngle);
            const yAtDet = m2.y + (detector.x - m2HitX) * Math.tan(m2OutAngle);

            // Throughput calculation based on distance from pinhole center (radius = 9px)
            const pinholeRadius = 9;
            const dev1 = Math.abs(yAtP1 - p1.y);
            const dev2 = Math.abs(yAtP2 - p2.y);
            const t1 = Math.exp(-Math.pow(dev1 / (pinholeRadius * 0.9), 2));
            const t2 = Math.exp(-Math.pow(dev2 / (pinholeRadius * 0.9), 2));
            const throughput = Math.max(0, Math.min(100, Math.round(t1 * t2 * 100)));

            // 1. Draw Laser Beam Rays
            ctx.save();
            ctx.lineCap = 'round';
            ctx.shadowBlur = (this.power / 100) * 16;
            ctx.shadowColor = beamColor;

            // Leg 1: Laser -> M1
            ctx.strokeStyle = beamColor;
            ctx.lineWidth = 2.5 * (this.power / 60);
            ctx.beginPath();
            ctx.moveTo(laser.x, laser.y);
            ctx.lineTo(m1.x, m1.y);
            ctx.stroke();

            // Leg 2: M1 -> M2
            ctx.beginPath();
            ctx.moveTo(m1.x, m1.y);
            ctx.lineTo(m2HitX, m2.y);
            ctx.stroke();

            // Leg 3: M2 -> through pinholes to detector
            ctx.beginPath();
            ctx.moveTo(m2HitX, m2.y);
            // Attenuate beam brightness if clipped by pinhole
            const leg3Alpha = Math.max(0.15, throughput / 100);
            ctx.globalAlpha = leg3Alpha;
            ctx.lineTo(detector.x, yAtDet);
            ctx.stroke();
            ctx.restore();

            // Draw Mirror 1 (kinematic mount at 45 deg + theta1)
            this.drawMirror(ctx, m1.x, m1.y, Math.PI / 4 + rad1, 'M1 (Near)', colors);

            // Draw Mirror 2 (kinematic mount at 135 deg + theta2)
            this.drawMirror(ctx, m2HitX, m2.y, (3 * Math.PI) / 4 + rad2, 'M2 (Far)', colors);

            // Draw Pinhole 1 (Iris diaphragm)
            this.drawPinhole(ctx, p1.x, p1.y, yAtP1, dev1 <= pinholeRadius, 'P1', colors);

            // Draw Pinhole 2 (Iris diaphragm)
            this.drawPinhole(ctx, p2.x, p2.y, yAtP2, dev2 <= pinholeRadius, 'P2', colors);

            // Draw Photodetector
            ctx.fillStyle = throughput > 80 ? colors.green : colors.surface;
            ctx.strokeStyle = throughput > 80 ? colors.green : colors.border;
            ctx.lineWidth = 2;
            ctx.fillRect(detector.x, detector.y - detector.h / 2, detector.w, detector.h);
            ctx.strokeRect(detector.x, detector.y - detector.h / 2, detector.w, detector.h);
            ctx.fillStyle = throughput > 80 ? '#ffffff' : colors.textSecondary;
            ctx.font = '9px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SPAD', detector.x + detector.w / 2, detector.y + 4);

            // Update UI Badges
            if (this.throughputBadge) {
                this.throughputBadge.textContent = `${throughput}%`;
            }
            if (this.statusBadge) {
                if (throughput >= 95) {
                    this.statusBadge.textContent = 'COLLINEAR ALIGNED';
                    this.statusBadge.style.background = 'rgba(46, 158, 102, 0.15)';
                    this.statusBadge.style.color = colors.green;
                    this.statusBadge.style.borderColor = colors.green;
                } else if (throughput >= 50) {
                    this.statusBadge.textContent = 'PARTIAL COUPLING';
                    this.statusBadge.style.background = 'rgba(196, 101, 42, 0.15)';
                    this.statusBadge.style.color = colors.accent;
                    this.statusBadge.style.borderColor = colors.accent;
                } else {
                    this.statusBadge.textContent = 'BEAM CLIPPED';
                    this.statusBadge.style.background = 'rgba(244, 63, 94, 0.15)';
                    this.statusBadge.style.color = colors.laserRed;
                    this.statusBadge.style.borderColor = colors.laserRed;
                }
            }

            // Annotation note
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '11px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Target Wavelength: ${beamWlLabel}`, 18, 24);
        }

        drawMirror(ctx, x, y, angle, label, colors) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Mirror substrate
            ctx.fillStyle = colors.surface;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1.5;
            ctx.fillRect(-16, -4, 32, 8);
            ctx.strokeRect(-16, -4, 32, 8);

            // Highly reflective dielectric coating
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(-16, -4, 32, 2.5);

            ctx.restore();

            // Label
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + 24);
        }

        drawPinhole(ctx, x, y, beamY, passed, label, colors) {
            const irisH = 50;
            const apertureR = 8;

            ctx.save();
            ctx.fillStyle = colors.surface;
            ctx.strokeStyle = passed ? colors.green : colors.border;
            ctx.lineWidth = 1.5;

            // Upper blade
            ctx.fillRect(x - 3, y - irisH / 2, 6, (irisH / 2) - apertureR);
            ctx.strokeRect(x - 3, y - irisH / 2, 6, (irisH / 2) - apertureR);

            // Lower blade
            ctx.fillRect(x - 3, y + apertureR, 6, (irisH / 2) - apertureR);
            ctx.strokeRect(x - 3, y + apertureR, 6, (irisH / 2) - apertureR);

            // Aperture circle ring
            ctx.beginPath();
            ctx.arc(x, y, apertureR, 0, Math.PI * 2);
            ctx.strokeStyle = passed ? colors.green : colors.textSecondary;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + 36);

            ctx.restore();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 02. EXCITON & STRAIN BROADENING SIMULATION (2D MATERIALS)
    // ─────────────────────────────────────────────────────────────
    class ExcitonSim {
        constructor() {
            this.canvas = document.getElementById('excitonCanvas');
            if (!this.canvas) return;

            this.epsSlider = document.getElementById('excitonEps');
            this.strainSlider = document.getElementById('excitonStrain');
            this.tempSlider = document.getElementById('excitonTemp');
            this.valleyBtn = document.getElementById('excitonValleyToggle');
            this.ironBtn = document.getElementById('excitonIronBtn');

            this.eps = parseFloat(this.epsSlider.value); // Dielectric screening
            this.strain = parseFloat(this.strainSlider.value); // Interfacial strain
            this.temp = parseFloat(this.tempSlider.value); // Temperature (K)
            this.valley = 'K+'; // 'K+' (sigma+) or 'K-' (sigma-)
            this.phase = 0;

            this.bindEvents();
            this.startLoop();
        }

        bindEvents() {
            this.epsSlider.addEventListener('input', () => {
                this.eps = parseFloat(this.epsSlider.value);
                document.getElementById('excitonEpsVal').textContent = this.eps.toFixed(1);
            });

            this.strainSlider.addEventListener('input', () => {
                this.strain = parseFloat(this.strainSlider.value);
                document.getElementById('excitonStrainVal').textContent = `${(this.strain * 100).toFixed(1)}%`;
            });

            this.tempSlider.addEventListener('input', () => {
                this.temp = parseFloat(this.tempSlider.value);
                document.getElementById('excitonTempVal').textContent = `${this.temp} K`;
            });

            this.valleyBtn.addEventListener('click', () => {
                this.valley = this.valley === 'K+' ? 'K-' : 'K+';
                this.valleyBtn.textContent = `Valley: ${this.valley} (σ${this.valley === 'K+' ? '⁺' : '⁻'})`;
            });

            this.ironBtn.addEventListener('click', () => {
                // Animate ironing: smoothly reduce strain to 0
                const initialStrain = this.strain;
                let t = 0;
                const ironInterval = setInterval(() => {
                    t += 0.1;
                    this.strain = Math.max(0, initialStrain * (1 - t));
                    this.strainSlider.value = this.strain.toFixed(3);
                    document.getElementById('excitonStrainVal').textContent = `${(this.strain * 100).toFixed(1)}%`;
                    if (t >= 1) {
                        clearInterval(ironInterval);
                        this.strain = 0;
                        this.strainSlider.value = '0';
                        document.getElementById('excitonStrainVal').textContent = '0.0% (AFM Ironed)';
                    }
                }, 40);
            });
        }

        startLoop() {
            const tick = () => {
                this.phase += 0.04;
                this.render();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        render() {
            const { ctx, width, height } = setupCanvasDPI(this.canvas);
            const colors = getThemeColors();

            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            const halfW = width * 0.48;

            // 1. LEFT PANEL: Real-Space Exciton Orbit & Coulomb Field
            this.renderRealSpace(ctx, 20, 20, halfW - 30, height - 40, colors);

            // Divider line
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(halfW, 20);
            ctx.lineTo(halfW, height - 20);
            ctx.stroke();

            // 2. RIGHT PANEL: Cryogenic Photoluminescence (PL) Spectrum
            this.renderPLSpectrum(ctx, halfW + 20, 20, width - halfW - 40, height - 40, colors);
        }

        renderRealSpace(ctx, x, y, w, h, colors) {
            ctx.save();
            ctx.translate(x + w / 2, y + h / 2);

            // Physical parameters
            // Bohr radius scales proportionally to dielectric screening eps_r
            // Binding energy scales as 1 / eps_r^2
            const rBohr = 18 + (this.eps - 1) * 9;
            const ebMev = Math.round(520 / Math.pow(this.eps / 1.5, 1.4));

            // Coulomb potential well representation (contours)
            for (let r = 1; r <= 3; r++) {
                ctx.beginPath();
                ctx.arc(0, 0, rBohr * (r * 0.55), 0, Math.PI * 2);
                ctx.strokeStyle = colors.accentGlow;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Central Hole (+ charge)
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fillStyle = colors.laserRed;
            ctx.shadowBlur = 12;
            ctx.shadowColor = colors.laserRed;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('h⁺', 0, 0);

            // Orbiting Electron (- wavepacket)
            const angle = this.valley === 'K+' ? this.phase : -this.phase;
            const ex = Math.cos(angle) * rBohr;
            const ey = Math.sin(angle) * (rBohr * 0.7); // 2D projection

            // Wavefunction density halo
            const grad = ctx.createRadialGradient(ex, ey, 2, ex, ey, 18);
            grad.addColorStop(0, colors.blue);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, ey, 18, 0, Math.PI * 2);
            ctx.fill();

            // Electron Core
            ctx.beginPath();
            ctx.arc(ex, ey, 7, 0, Math.PI * 2);
            ctx.fillStyle = colors.blue;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.blue;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillText('e⁻', ex, ey);

            ctx.restore();

            // Legend / Readout
            ctx.fillStyle = colors.textPrimary;
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('REAL-SPACE EXCITON ORBIT', x + 10, y + 16);
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '11px "IBM Plex Mono", monospace';
            ctx.fillText(`Bohr Radius a₀: ${(rBohr / 18 * 1.4).toFixed(2)} nm`, x + 10, y + 36);
            ctx.fillText(`Binding Energy E_b: ~${ebMev} meV`, x + 10, y + 54);
            ctx.fillText(`Valley Polarization: ${this.valley}`, x + 10, y + 72);
        }

        renderPLSpectrum(ctx, x, y, w, h, colors) {
            ctx.save();
            ctx.fillStyle = colors.textPrimary;
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('PHOTOLUMINESCENCE SPECTRUM', x + 10, y + 16);

            // Plot axes
            const ox = x + 35;
            const oy = y + h - 30;
            const pw = w - 45;
            const ph = h - 65;

            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox + pw, oy);
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox, oy - ph);
            ctx.stroke();

            // Labels
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Photon Energy (eV)', ox + pw / 2, oy + 22);

            ctx.save();
            ctx.translate(ox - 22, oy - ph / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('PL Intensity (a.u.)', 0, 0);
            ctx.restore();

            // Compute spectrum curve:
            // Peak center ~1.72 eV
            // Inhomogeneous broadening from strain + temperature
            const fwhm = 4 + (this.strain * 70) + (this.temp * 0.08); // meV
            const centerE = 1.72; // eV
            const peakHeight = Math.min(ph * 0.9, (120 / (fwhm * 0.18)));

            ctx.beginPath();
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 2.5;

            for (let px = 0; px <= pw; px += 2) {
                const energy = 1.66 + (px / pw) * 0.12; // 1.66 to 1.78 eV
                const deltaMev = (energy - centerE) * 1000;
                // Lorentzian / Voigt line shape
                const intensity = (peakHeight) * (Math.pow(fwhm / 2, 2) / (Math.pow(deltaMev, 2) + Math.pow(fwhm / 2, 2)));
                // Asymmetric tail if strain is present (strain gradient in moire)
                const tail = this.strain > 0.02 && deltaMev < 0 ? Math.exp(deltaMev / (fwhm * 1.5)) * (ph * 0.25 * this.strain) : 0;
                const py = oy - Math.max(0, intensity + tail);

                if (px === 0) ctx.moveTo(ox + px, py);
                else ctx.lineTo(ox + px, py);
            }
            ctx.stroke();

            // Fill under curve
            ctx.lineTo(ox + pw, oy);
            ctx.lineTo(ox, oy);
            ctx.closePath();
            ctx.fillStyle = colors.accentGlow;
            ctx.fill();

            // Readout of FWHM
            ctx.fillStyle = this.strain === 0 ? colors.green : colors.textPrimary;
            ctx.font = '11px "IBM Plex Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`FWHM Linewidth: ${fwhm.toFixed(1)} meV`, ox + pw, y + 26);
            if (this.strain === 0) {
                ctx.fillText('Intrinsic Exciton Limit (AFM Ironed)', ox + pw, y + 42);
            } else {
                ctx.fillStyle = colors.laserRed;
                ctx.fillText('Strain Inhomogeneous Broadening', ox + pw, y + 42);
            }

            ctx.restore();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 03. NV CENTER & ODMR SIMULATION
    // ─────────────────────────────────────────────────────────────
    class NVCenterSim {
        constructor() {
            this.canvas = document.getElementById('nvCanvas');
            if (!this.canvas) return;

            this.freqSlider = document.getElementById('nvFreq');
            this.bFieldSlider = document.getElementById('nvBField');
            this.laserSlider = document.getElementById('nvLaserPower');
            this.scanBtn = document.getElementById('nvScanBtn');

            this.freq = parseFloat(this.freqSlider.value); // GHz
            this.bz = parseFloat(this.bFieldSlider.value); // mT
            this.laser = parseFloat(this.laserSlider.value); // mW
            this.phase = 0;
            this.isScanning = false;

            this.bindEvents();
            this.startLoop();
        }

        bindEvents() {
            this.freqSlider.addEventListener('input', () => {
                this.freq = parseFloat(this.freqSlider.value);
                document.getElementById('nvFreqVal').textContent = `${this.freq.toFixed(3)} GHz`;
            });

            this.bFieldSlider.addEventListener('input', () => {
                this.bz = parseFloat(this.bFieldSlider.value);
                document.getElementById('nvBFieldVal').textContent = `${this.bz.toFixed(1)} mT`;
            });

            this.laserSlider.addEventListener('input', () => {
                this.laser = parseFloat(this.laserSlider.value);
                document.getElementById('nvLaserVal').textContent = `${this.laser} mW`;
            });

            this.scanBtn.addEventListener('click', () => {
                this.runODMRScan();
            });
        }

        runODMRScan() {
            if (this.isScanning) return;
            this.isScanning = true;
            this.scanBtn.disabled = true;

            let f = 2.70;
            const endF = 3.04;
            const step = 0.005;

            const scanInterval = setInterval(() => {
                f += step;
                if (f > endF) {
                    clearInterval(scanInterval);
                    this.isScanning = false;
                    this.scanBtn.disabled = false;
                } else {
                    this.freq = f;
                    this.freqSlider.value = f.toFixed(3);
                    document.getElementById('nvFreqVal').textContent = `${this.freq.toFixed(3)} GHz`;
                }
            }, 30);
        }

        startLoop() {
            const tick = () => {
                this.phase += 0.05;
                this.render();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        render() {
            const { ctx, width, height } = setupCanvasDPI(this.canvas);
            const colors = getThemeColors();

            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            const halfH = height * 0.52;

            // 1. TOP PANEL: Jablonski Level Diagram
            this.renderLevelDiagram(ctx, 16, 16, width - 32, halfH - 24, colors);

            // Divider
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(16, halfH);
            ctx.lineTo(width - 16, halfH);
            ctx.stroke();

            // 2. BOTTOM PANEL: Live ODMR Spectrum Curve
            this.renderODMRSpectrum(ctx, 16, halfH + 8, width - 32, height - halfH - 24, colors);
        }

        renderLevelDiagram(ctx, x, y, w, h, colors) {
            ctx.save();
            ctx.fillStyle = colors.textPrimary;
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('NV⁻ ENERGY LEVELS & CYCLING TRANSITIONS', x + 10, y + 16);

            // Energy levels:
            // Ground triplet 3A2 (bottom)
            // Optical excited triplet 3E (top)
            // Metastable singlet 1A1 / 1E (middle right)

            const groundY = y + h - 25;
            const excitedY = y + 40;
            const singletY = y + (h * 0.55);

            const col1X = x + w * 0.25; // ms = 0
            const col2X = x + w * 0.50; // ms = +/-1
            const col3X = x + w * 0.78; // Singlet

            // Ground levels
            ctx.strokeStyle = colors.textPrimary;
            ctx.lineWidth = 2.5;

            // 3A2 (ms = 0)
            ctx.beginPath();
            ctx.moveTo(col1X - 35, groundY);
            ctx.lineTo(col1X + 35, groundY);
            ctx.stroke();
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('³A₂ (mₛ = 0)', col1X, groundY + 16);

            // Zeeman split: ms = -1 and ms = +1
            const zeemanDelta = (this.bz * 28 / 1000) * 12; // 28 MHz/mT
            ctx.beginPath();
            ctx.moveTo(col2X - 45, groundY - 8 - zeemanDelta);
            ctx.lineTo(col2X + 45, groundY - 8 - zeemanDelta);
            ctx.moveTo(col2X - 45, groundY - 8 + zeemanDelta);
            ctx.lineTo(col2X + 45, groundY - 8 + zeemanDelta);
            ctx.stroke();
            ctx.fillText(`³A₂ (mₛ = ±1) [Δf = ${(this.bz * 56).toFixed(0)} MHz]`, col2X, groundY + 16);

            // Excited levels 3E
            ctx.beginPath();
            ctx.moveTo(col1X - 35, excitedY);
            ctx.lineTo(col1X + 35, excitedY);
            ctx.moveTo(col2X - 45, excitedY - zeemanDelta);
            ctx.lineTo(col2X + 45, excitedY + zeemanDelta);
            ctx.stroke();
            ctx.fillText('³E (Excited State)', col1X + 35, excitedY - 12);

            // Singlet shelf
            ctx.strokeStyle = colors.accent;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(col3X - 35, singletY);
            ctx.lineTo(col3X + 35, singletY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = colors.accent;
            ctx.fillText('¹A₁ / ¹E (Dark Singlet)', col3X, singletY + 16);

            // Animated transitions
            // 532 nm pump (Green arrow up from ms=0)
            this.drawArrow(ctx, col1X - 12, groundY, col1X - 12, excitedY, colors.laserGreen, '532 nm');

            // 637 nm radiative decay (Red arrow down)
            this.drawArrow(ctx, col1X + 12, excitedY, col1X + 12, groundY, colors.laserRed, '637 nm ZPL');

            // Intersystem crossing from ms=+/-1 to Singlet (purple arrow)
            this.drawArrow(ctx, col2X + 30, excitedY, col3X - 25, singletY, '#c084fc', 'ISC (Dark)');

            // Microwave resonance arrow between ms=0 and ms=+/-1
            const gamma = 0.028; // GHz/mT
            const fMinus = 2.870 - (this.bz * gamma);
            const fPlus = 2.870 + (this.bz * gamma);
            const isResonant = (Math.abs(this.freq - fMinus) < 0.015) || (Math.abs(this.freq - fPlus) < 0.015);

            ctx.strokeStyle = isResonant ? '#eab308' : colors.textSecondary;
            ctx.lineWidth = isResonant ? 2.5 : 1;
            ctx.setLineDash([3, 2]);
            ctx.beginPath();
            ctx.moveTo(col1X + 35, groundY);
            ctx.lineTo(col2X - 45, groundY - 8);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isResonant) {
                ctx.fillStyle = '#eab308';
                ctx.font = 'bold 10px "IBM Plex Mono", monospace';
                ctx.fillText('MW RESONANCE ACTIVE (SPIN FLIP)', (col1X + col2X) / 2, groundY - 18);
            }

            ctx.restore();
        }

        drawArrow(ctx, x1, y1, x2, y2, color, label) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Arrow head
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - 7 * Math.cos(angle - Math.PI / 6), y2 - 7 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - 7 * Math.cos(angle + Math.PI / 6), y2 - 7 * Math.sin(angle + Math.PI / 6));
            ctx.fill();

            if (label) {
                ctx.font = '9px "IBM Plex Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2);
            }
            ctx.restore();
        }

        renderODMRSpectrum(ctx, x, y, w, h, colors) {
            ctx.save();
            const ox = x + 40;
            const oy = y + h - 22;
            const pw = w - 55;
            const ph = h - 45;

            // Axes
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox + pw, oy);
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox, oy - ph);
            ctx.stroke();

            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Microwave Frequency (GHz)', ox + pw / 2, oy + 18);

            ctx.save();
            ctx.translate(ox - 24, oy - ph / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Norm. PL', 0, 0);
            ctx.restore();

            // Resonant frequencies
            const gamma = 0.028; // GHz/mT
            const fMinus = 2.870 - (this.bz * gamma);
            const fPlus = 2.870 + (this.bz * gamma);
            const lw = 0.012; // Linewidth in GHz

            // Plot ODMR curve
            ctx.beginPath();
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 2.2;

            for (let px = 0; px <= pw; px += 2) {
                const freqX = 2.70 + (px / pw) * 0.35; // 2.70 to 3.05 GHz
                // Dips from fMinus and fPlus
                const dip1 = 0.22 / (1 + Math.pow((freqX - fMinus) / lw, 2));
                const dip2 = 0.22 / (1 + Math.pow((freqX - fPlus) / lw, 2));
                const normPL = 1.0 - (dip1 + dip2);
                const py = (oy - ph * 0.95) + (1.0 - normPL) * (ph * 0.85);

                if (px === 0) ctx.moveTo(ox + px, py);
                else ctx.lineTo(ox + px, py);
            }
            ctx.stroke();

            // Marker for current frequency
            const markerX = ox + ((this.freq - 2.70) / 0.35) * pw;
            if (markerX >= ox && markerX <= ox + pw) {
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.moveTo(markerX, oy);
                ctx.lineTo(markerX, oy - ph);
                ctx.stroke();
                ctx.setLineDash([]);

                // Marker dot
                const currentDip1 = 0.22 / (1 + Math.pow((this.freq - fMinus) / lw, 2));
                const currentDip2 = 0.22 / (1 + Math.pow((this.freq - fPlus) / lw, 2));
                const currentPL = 1.0 - (currentDip1 + currentDip2);
                const markerY = (oy - ph * 0.95) + (1.0 - currentPL) * (ph * 0.85);

                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
                ctx.fill();

                // Live Contrast Readout
                const contrast = ((1.0 - currentPL) * 100).toFixed(1);
                ctx.fillStyle = colors.textPrimary;
                ctx.font = '11px "IBM Plex Mono", monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`ODMR Contrast: ${contrast}%`, ox + pw, y + 16);
            }

            ctx.restore();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 04. AFM NANOXEROGRAPHY & DIRECTED ASSEMBLY SIMULATION
    // ─────────────────────────────────────────────────────────────
    class NanoxerographySim {
        constructor() {
            this.canvas = document.getElementById('nanoCanvas');
            if (!this.canvas) return;

            this.biasSlider = document.getElementById('nanoBias');
            this.pulseSlider = document.getElementById('nanoPulse');
            this.concSlider = document.getElementById('nanoConc');
            this.pulseBtn = document.getElementById('nanoPulseBtn');
            this.flushBtn = document.getElementById('nanoFlushBtn');
            this.clearBtn = document.getElementById('nanoClearBtn');
            this.trappedBadge = document.getElementById('nanoTrapped');

            this.bias = parseFloat(this.biasSlider.value); // Volts (0 - 40V)
            this.pulseDuration = parseFloat(this.pulseSlider.value); // ms
            this.conc = parseInt(this.concSlider.value, 10); // particle count

            // Tip position
            this.tipX = 0.5; // normalized 0 to 1
            this.isPulsing = false;
            this.pulseAnim = 0;

            // Substrate charge spots [{x, charge, width}]
            this.chargeSpots = [];

            // Nanodiamond colloid particles [{x, y, vx, vy, trapped}]
            this.particles = [];
            this.spawnParticles();

            this.bindEvents();
            this.startLoop();
        }

        spawnParticles() {
            this.particles = [];
            for (let i = 0; i < this.conc; i++) {
                this.particles.push({
                    x: Math.random(),
                    y: 0.15 + Math.random() * 0.55,
                    vx: (Math.random() - 0.5) * 0.002,
                    vy: (Math.random() - 0.5) * 0.002,
                    trapped: false
                });
            }
        }

        bindEvents() {
            this.biasSlider.addEventListener('input', () => {
                this.bias = parseFloat(this.biasSlider.value);
                document.getElementById('nanoBiasVal').textContent = `${this.bias} V`;
            });

            this.pulseSlider.addEventListener('input', () => {
                this.pulseDuration = parseFloat(this.pulseSlider.value);
                document.getElementById('nanoPulseVal').textContent = `${this.pulseDuration} ms`;
            });

            this.concSlider.addEventListener('input', () => {
                this.conc = parseInt(this.concSlider.value, 10);
                document.getElementById('nanoConcVal').textContent = `${this.conc} particles`;
                this.spawnParticles();
            });

            this.pulseBtn.addEventListener('click', () => {
                this.triggerPulse();
            });

            this.flushBtn.addEventListener('click', () => {
                this.spawnParticles();
            });

            this.clearBtn.addEventListener('click', () => {
                this.chargeSpots = [];
                this.spawnParticles();
            });

            // Interactive canvas click to move AFM tip
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.tipX = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / rect.width));
                this.triggerPulse();
            });
        }

        triggerPulse() {
            if (this.isPulsing) return;
            this.isPulsing = true;
            this.pulseAnim = 1.0;

            // Add charge electret to substrate
            const spotWidth = 0.04 + (this.bias / 40) * 0.03;
            const chargeAmount = (this.bias / 40) * (this.pulseDuration / 100);
            this.chargeSpots.push({
                x: this.tipX,
                charge: chargeAmount,
                width: spotWidth
            });

            setTimeout(() => {
                this.isPulsing = false;
            }, this.pulseDuration * 4);
        }

        startLoop() {
            const tick = () => {
                if (this.pulseAnim > 0) this.pulseAnim = Math.max(0, this.pulseAnim - 0.04);
                this.updatePhysics();
                this.render();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        updatePhysics() {
            const substrateY = 0.78; // Substrate interface
            let trappedCount = 0;

            this.particles.forEach(p => {
                if (p.trapped) {
                    trappedCount++;
                    return;
                }

                // Brownian diffusion
                p.vx += (Math.random() - 0.5) * 0.0006;
                p.vy += (Math.random() - 0.5) * 0.0006;
                p.vx *= 0.94;
                p.vy *= 0.94;

                // Electrostatic attraction from written charge electrets (Coulomb + DEP)
                this.chargeSpots.forEach(spot => {
                    const dx = spot.x - p.x;
                    const dy = substrateY - p.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 0.12) {
                        const force = (spot.charge * 0.0018) / (distSq + 0.004);
                        p.vx += dx * force;
                        p.vy += dy * force;

                        // Trap condition: near surface at charge spot
                        if (Math.abs(dx) < spot.width * 0.4 && p.y >= substrateY - 0.03) {
                            p.trapped = true;
                            p.x = spot.x + (Math.random() - 0.5) * 0.008;
                            p.y = substrateY - 0.015;
                            p.vx = 0;
                            p.vy = 0;
                        }
                    }
                });

                p.x += p.vx;
                p.y += p.vy;

                // Boundaries
                if (p.x < 0.05) p.x = 0.05;
                if (p.x > 0.95) p.x = 0.95;
                if (p.y < 0.15) p.y = 0.15;
                if (p.y > substrateY - 0.02) p.y = substrateY - 0.02;
            });

            if (this.trappedBadge) {
                this.trappedBadge.textContent = `${trappedCount}`;
            }
        }

        render() {
            const { ctx, width, height } = setupCanvasDPI(this.canvas);
            const colors = getThemeColors();

            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            const subY = height * 0.78;
            const tipPixelX = this.tipX * width;

            // 1. Dielectric Substrate (SiO2 on Silicon)
            ctx.fillStyle = colors.surface;
            ctx.fillRect(0, subY, width, height - subY);
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, subY);
            ctx.lineTo(width, subY);
            ctx.stroke();

            // Label substrate
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('DIELECTRIC SUBSTRATE (SiO₂ / PMMA)', 16, subY + 24);

            // 2. Render Charge Electrets (Trapped surface charges)
            this.chargeSpots.forEach(spot => {
                const sx = spot.x * width;
                const sw = spot.width * width;

                // Glowing potential well
                const grad = ctx.createRadialGradient(sx, subY, 2, sx, subY, sw);
                grad.addColorStop(0, 'rgba(234, 179, 8, 0.75)');
                grad.addColorStop(0.6, 'rgba(196, 101, 42, 0.35)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sx, subY, sw, 0, Math.PI * 2);
                ctx.fill();

                // Surface charge markers (-)
                ctx.fillStyle = '#eab308';
                ctx.font = 'bold 11px "IBM Plex Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('⁻⁻⁻', sx, subY + 12);
            });

            // 3. Render Colloidal Nanodiamonds
            this.particles.forEach(p => {
                const px = p.x * width;
                const py = p.y * height;

                ctx.save();
                ctx.translate(px, py);
                ctx.fillStyle = p.trapped ? colors.laserGreen : '#60a5fa';
                ctx.shadowBlur = p.trapped ? 10 : 4;
                ctx.shadowColor = p.trapped ? colors.laserGreen : '#60a5fa';

                // Diamond shape
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(5, 0);
                ctx.lineTo(0, 5);
                ctx.lineTo(-5, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            });

            // 4. Render AFM Cantilever & Conductive Tip
            const tipTipY = this.isPulsing ? subY - 4 : subY - 26;

            ctx.save();
            ctx.fillStyle = colors.textSecondary;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1.5;

            // Cantilever arm
            ctx.beginPath();
            ctx.moveTo(tipPixelX - 70, tipTipY - 35);
            ctx.lineTo(tipPixelX, tipTipY - 20);
            ctx.lineTo(tipPixelX, tipTipY - 14);
            ctx.lineTo(tipPixelX - 70, tipTipY - 28);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sharp pyramidal tip
            ctx.fillStyle = this.isPulsing ? '#eab308' : colors.textPrimary;
            ctx.beginPath();
            ctx.moveTo(tipPixelX - 10, tipTipY - 18);
            ctx.lineTo(tipPixelX + 10, tipTipY - 18);
            ctx.lineTo(tipPixelX, tipTipY);
            ctx.closePath();
            ctx.fill();

            // Electric field arc when pulsing
            if (this.pulseAnim > 0) {
                ctx.strokeStyle = `rgba(234, 179, 8, ${this.pulseAnim})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(tipPixelX, tipTipY, 22 * (1 - this.pulseAnim * 0.4), 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#eab308';
                ctx.font = 'bold 11px "IBM Plex Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`BIAS PULSE: -${this.bias}V`, tipPixelX, tipTipY - 42);
            }

            ctx.restore();

            // Readout info
            ctx.fillStyle = colors.textPrimary;
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('AFM NANOXEROGRAPHY: DIRECTED ASSEMBLY', 16, 24);
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '11px "IBM Plex Mono", monospace';
            ctx.fillText('Click anywhere on substrate to position AFM tip and write electret', 16, 42);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 05. g²(τ) SECOND-ORDER AUTOCORRELATION & SINGLE-PHOTON SIMULATION
    // ─────────────────────────────────────────────────────────────
    class G2MeasurementSim {
        constructor() {
            this.canvas = document.getElementById('g2Canvas');
            if (!this.canvas) return;

            this.emittersSlider = document.getElementById('g2Emitters');
            this.sbrSlider = document.getElementById('g2SBR');
            this.lifetimeSlider = document.getElementById('g2Lifetime');
            this.jitterSlider = document.getElementById('g2Jitter');
            this.streamBtn = document.getElementById('g2StreamBtn');
            this.resetBtn = document.getElementById('g2ResetBtn');
            this.verdictBadge = document.getElementById('g2Verdict');
            this.g2ValBadge = document.getElementById('g2Val');

            this.nEmitters = parseInt(this.emittersSlider.value, 10); // 1, 2, 3, etc.
            this.sbr = parseFloat(this.sbrSlider.value); // Signal to background ratio
            this.tau1 = parseFloat(this.lifetimeSlider.value); // ns (lifetime)
            this.jitter = parseFloat(this.jitterSlider.value); // ns

            this.isStreaming = false;
            this.histBins = new Array(51).fill(0); // Coincidence histogram bins
            this.totalEvents = 0;
            this.photons = []; // Travelling photon packets

            this.bindEvents();
            this.startLoop();
        }

        bindEvents() {
            this.emittersSlider.addEventListener('input', () => {
                this.nEmitters = parseInt(this.emittersSlider.value, 10);
                document.getElementById('g2EmittersVal').textContent = `${this.nEmitters} ${this.nEmitters === 1 ? 'Emitter (Single)' : 'Emitters'}`;
                this.resetHistogram();
            });

            this.sbrSlider.addEventListener('input', () => {
                this.sbr = parseFloat(this.sbrSlider.value);
                document.getElementById('g2SBRVal').textContent = `${this.sbr.toFixed(1)}:1`;
                this.resetHistogram();
            });

            this.lifetimeSlider.addEventListener('input', () => {
                this.tau1 = parseFloat(this.lifetimeSlider.value);
                document.getElementById('g2LifetimeVal').textContent = `${this.tau1.toFixed(1)} ns`;
                this.resetHistogram();
            });

            this.jitterSlider.addEventListener('input', () => {
                this.jitter = parseFloat(this.jitterSlider.value);
                document.getElementById('g2JitterVal').textContent = `${this.jitter.toFixed(2)} ns`;
                this.resetHistogram();
            });

            this.streamBtn.addEventListener('click', () => {
                this.isStreaming = !this.isStreaming;
                this.streamBtn.textContent = this.isStreaming ? 'Pause Acquisition' : 'Stream Live Photons';
                this.streamBtn.classList.toggle('active', this.isStreaming);
            });

            this.resetBtn.addEventListener('click', () => {
                this.resetHistogram();
            });
        }

        resetHistogram() {
            this.histBins = new Array(51).fill(0);
            this.totalEvents = 0;
            this.photons = [];
        }

        startLoop() {
            const tick = () => {
                if (this.isStreaming) {
                    this.simulateEvents();
                }
                this.render();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        simulateEvents() {
            // Generate stochastic coincidence events based on physical g2(tau) distribution
            // Theoretical g2(0) = 1 - (1/N) * (S / (S+B))^2
            const rho = this.sbr / (this.sbr + 1);
            const g0 = Math.max(0.02, 1 - (1 / this.nEmitters) * (rho * rho));

            for (let i = 0; i < 4; i++) {
                // Random time delay tau between -25 ns and +25 ns
                const tau = (Math.random() - 0.5) * 50;
                const prob = 1 - (1 - g0) * Math.exp(-Math.abs(tau) / this.tau1);

                if (Math.random() < prob) {
                    // Add timing jitter convolution
                    const measuredTau = tau + (Math.random() - 0.5) * this.jitter * 2;
                    const bin = Math.floor(((measuredTau + 25) / 50) * 50);
                    if (bin >= 0 && bin < 51) {
                        this.histBins[bin]++;
                        this.totalEvents++;
                    }
                }
            }
        }

        render() {
            const { ctx, width, height } = setupCanvasDPI(this.canvas);
            const colors = getThemeColors();

            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            // Compute theoretical g2(0)
            const rho = this.sbr / (this.sbr + 1);
            const g2Zero = Math.max(0.01, 1 - (1 / this.nEmitters) * (rho * rho));

            // Update UI Badges
            if (this.g2ValBadge) {
                this.g2ValBadge.textContent = g2Zero.toFixed(2);
            }
            if (this.verdictBadge) {
                if (g2Zero < 0.5) {
                    this.verdictBadge.textContent = 'QUANTUM: SINGLE PHOTON EMITTER (g²(0) < 0.5)';
                    this.verdictBadge.style.background = 'rgba(46, 158, 102, 0.15)';
                    this.verdictBadge.style.color = colors.green;
                    this.verdictBadge.style.borderColor = colors.green;
                } else {
                    this.verdictBadge.textContent = 'CLASSICAL / MULTI-EMITTER REGIME (g²(0) ≥ 0.5)';
                    this.verdictBadge.style.background = 'rgba(244, 63, 94, 0.15)';
                    this.verdictBadge.style.color = colors.laserRed;
                    this.verdictBadge.style.borderColor = colors.laserRed;
                }
            }

            const ox = 55;
            const oy = height - 42;
            const pw = width - 80;
            const ph = height - 85;

            // 1. Draw Threshold Zone (Quantum Regime: 0 to 0.5)
            const yThreshold = oy - (0.5 / 1.35) * ph;
            ctx.fillStyle = 'rgba(46, 158, 102, 0.08)';
            ctx.fillRect(ox, yThreshold, pw, oy - yThreshold);

            // Quantum threshold line
            ctx.strokeStyle = colors.green;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(ox, yThreshold);
            ctx.lineTo(ox + pw, yThreshold);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = colors.green;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('Quantum Threshold g²(0) = 0.5', ox + pw - 6, yThreshold - 6);

            // 2. Draw Histogram Bins (Simulated TCSPC Coincidence Clicks)
            if (this.totalEvents > 0) {
                const maxBin = Math.max(1, ...this.histBins);
                const binW = pw / 51;

                ctx.fillStyle = 'rgba(196, 101, 42, 0.35)';
                ctx.strokeStyle = colors.accent;
                ctx.lineWidth = 0.5;

                for (let b = 0; b < 51; b++) {
                    const bh = (this.histBins[b] / maxBin) * (ph * 0.72);
                    const bx = ox + b * binW;
                    const by = oy - bh;
                    ctx.fillRect(bx, by, binW - 1, bh);
                    ctx.strokeRect(bx, by, binW - 1, bh);
                }
            }

            // 3. Draw Analytical g2(tau) Curve
            ctx.beginPath();
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 2.5;

            for (let px = 0; px <= pw; px += 2) {
                const tau = -25 + (px / pw) * 50; // -25ns to +25ns
                const val = 1 - (1 - g2Zero) * Math.exp(-Math.abs(tau) / this.tau1);
                const py = oy - (val / 1.35) * ph;

                if (px === 0) ctx.moveTo(ox + px, py);
                else ctx.lineTo(ox + px, py);
            }
            ctx.stroke();

            // Zero delay center line (tau = 0)
            const centerX = ox + pw / 2;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(centerX, oy);
            ctx.lineTo(centerX, oy - ph);
            ctx.stroke();
            ctx.setLineDash([]);

            // Axes
            ctx.strokeStyle = colors.textPrimary;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox + pw, oy);
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox, oy - ph);
            ctx.stroke();

            // Axis ticks & labels
            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('-25 ns', ox, oy + 16);
            ctx.fillText('0 ns (Zero Delay)', centerX, oy + 16);
            ctx.fillText('+25 ns', ox + pw, oy + 16);
            ctx.fillText('Delay Time τ (ns)', centerX, oy + 32);

            ctx.textAlign = 'right';
            ctx.fillText('0.0', ox - 8, oy);
            ctx.fillText('0.5', ox - 8, yThreshold + 4);
            ctx.fillText('1.0', ox - 8, oy - (1.0 / 1.35) * ph + 4);

            ctx.save();
            ctx.translate(ox - 30, oy - ph / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('g⁽²⁾(τ)', 0, 0);
            ctx.restore();

            // Title & Readouts
            ctx.fillStyle = colors.textPrimary;
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('HANBURY BROWN–TWISS (HBT) AUTOCORRELATION', ox, 22);

            ctx.fillStyle = colors.textSecondary;
            ctx.font = '10px "IBM Plex Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`Recorded Events: ${this.totalEvents}`, ox + pw, 22);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TAB SWITCHER CONTROLLER (PAUSES INACTIVE SIMS TO SAVE BATTERY)
    // ─────────────────────────────────────────────────────────────
    function initLabTabs() {
        const tabBtns = document.querySelectorAll('.lab-tab-btn');
        const panels = document.querySelectorAll('.lab-panel');
        if (!tabBtns.length) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.tab;
                tabBtns.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });

                panels.forEach(panel => {
                    const isActive = panel.id === targetId;
                    panel.classList.toggle('active', isActive);
                    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                });

                // Trigger resize so newly visible canvas initializes cleanly
                window.dispatchEvent(new Event('resize'));
            });
        });
    }

    // Initialize all 5 simulations when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initLabTabs();
        new OpticalBenchSim();
        new ExcitonSim();
        new NVCenterSim();
        new NanoxerographySim();
        new G2MeasurementSim();
    });

})();
