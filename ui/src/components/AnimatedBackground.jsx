import React, { useEffect, useRef } from 'react';

/**
 * Stunning animated background for auth pages.
 * Dark navy base with bright teal network, pulsing orbs, and scan effects.
 */
export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // ─── Particles ───
        const PARTICLE_COUNT = 80;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * 2000,
            y: Math.random() * 2000,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 2.5 + 1.5,
            opacity: Math.random() * 0.6 + 0.3
        }));

        // ─── Large glowing orbs ───
        const orbs = [
            { x: 0.15, y: 0.75, baseR: 350, color: '42,157,143', speed: 0.008, phase: 0 },
            { x: 0.85, y: 0.25, baseR: 300, color: '2,88,212', speed: 0.006, phase: 2 },
            { x: 0.5, y: 0.1, baseR: 200, color: '42,157,143', speed: 0.01, phase: 4 },
            { x: 0.7, y: 0.8, baseR: 250, color: '59,130,246', speed: 0.007, phase: 1 },
        ];

        let time = 0;

        const draw = () => {
            time += 0.016;
            // Dark navy fill
            ctx.fillStyle = '#0a0e1a';
            ctx.fillRect(0, 0, w, h);

            // ─── Draw pulsing gradient orbs ───
            orbs.forEach(orb => {
                const pulse = Math.sin(time * orb.speed * 60 + orb.phase) * 0.3 + 0.85;
                const r = orb.baseR * pulse;
                const grad = ctx.createRadialGradient(orb.x * w, orb.y * h, 0, orb.x * w, orb.y * h, r);
                grad.addColorStop(0, `rgba(${orb.color}, 0.15)`);
                grad.addColorStop(0.5, `rgba(${orb.color}, 0.05)`);
                grad.addColorStop(1, `rgba(${orb.color}, 0)`);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            });

            // ─── Draw perspective grid ───
            ctx.strokeStyle = 'rgba(42, 157, 143, 0.06)';
            ctx.lineWidth = 0.5;
            const gridSpacing = 60;
            for (let y = 0; y < h; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            for (let x = 0; x < w; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }

            // ─── Update & draw particles ───
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                glow.addColorStop(0, `rgba(42, 157, 143, ${p.opacity * 0.3})`);
                glow.addColorStop(1, `rgba(42, 157, 143, 0)`);
                ctx.fillStyle = glow;
                ctx.fillRect(p.x - p.r * 6, p.y - p.r * 6, p.r * 12, p.r * 12);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(42, 157, 143, ${p.opacity})`;
                ctx.fill();
            });

            // ─── Connection lines between nearby particles ───
            const connectionDist = 180;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(42, 157, 143, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // ─── Horizontal scanning beam ───
            const scanY = ((time * 40) % (h + 200)) - 100;
            const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
            scanGrad.addColorStop(0, 'rgba(42, 157, 143, 0)');
            scanGrad.addColorStop(0.5, 'rgba(42, 157, 143, 0.08)');
            scanGrad.addColorStop(1, 'rgba(42, 157, 143, 0)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 60, w, 120);

            // ─── Corner vignette ───
            const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
            vignette.addColorStop(0, 'rgba(10, 14, 26, 0)');
            vignette.addColorStop(1, 'rgba(10, 14, 26, 0.6)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, w, h);

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <canvas ref={canvasRef} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0
        }} />
    );
}
