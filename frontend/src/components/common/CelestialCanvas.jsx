import React, { useEffect, useRef } from "react";

/**
 * Deterministic PRNG (Mulberry32) so celestial constellations stabilize cleanly across resizes.
 */
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_PALETTES = [
  { rgb: "232, 226, 213", weight: 0.56 }, // Warm Parchment (#E8E2D5)
  { rgb: "197, 160, 89", weight: 0.28 }, // Antique Gold (#C5A059)
  { rgb: "239, 228, 200", weight: 0.1 }, // Champagne Gold leaf
  { rgb: "138, 109, 59", weight: 0.06 }, // Muted Bronze (#8A6D3B)
];

function pickStarColor(rand) {
  const roll = rand();
  let acc = 0;
  for (const item of STAR_PALETTES) {
    acc += item.weight;
    if (roll <= acc) return item.rgb;
  }
  return STAR_PALETTES[0].rgb;
}

/**
 * Single fixed pointer-none `<canvas>` rendering a Gold-Leaf Celestial Vault:
 * subtle engraved meridian arcs, constellations, gently breathing gold/parchment stars,
 * and occasional tapered meteor trails. Honors `prefers-reduced-motion` and tab visibility.
 */
export default function CelestialCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== "function") return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const finePointerQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: fine)")
        : null;

    let reducedMotion = Boolean(motionQuery?.matches);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
    let stars = [];
    let constellationChains = [];
    const meteors = [];
    const sparks = [];
    let nextMeteorAt = performance.now() + 1400;
    let rafId = null;
    let lastTime = performance.now();

    const buildScene = () => {
      const rand = createSeededRandom(0x546f726f);
      const isMobile = width < 768;
      const starCount = isMobile ? 48 : Math.min(115, Math.max(70, Math.round((width * height) / 17000)));

      stars = Array.from({ length: starCount }, (_, i) => {
        const isAnchor = i < (isMobile ? 6 : 12);
        return {
          x: rand() * width,
          y: rand() * height * 0.92,
          radius: isAnchor ? 1.45 + rand() * 0.95 : 0.55 + rand() * 1.1,
          baseAlpha: isAnchor ? 0.58 + rand() * 0.3 : 0.22 + rand() * 0.52,
          twinkleSpeed: 0.45 + rand() * 1.15,
          phase: rand() * Math.PI * 2,
          depth: isAnchor ? 0.85 : 0.2 + rand() * 0.75,
          color: isAnchor ? "197, 160, 89" : pickStarColor(rand),
          isAnchor,
        };
      });

      // Link subsets of anchor stars into 2 subtle engraved constellations
      const anchors = stars.slice(0, isMobile ? 6 : 12);
      anchors.sort((a, b) => a.x - b.x);
      const splitIndex = Math.ceil(anchors.length / 2);
      constellationChains = [
        anchors.slice(0, splitIndex),
        anchors.slice(splitIndex),
      ].filter((chain) => chain.length >= 2);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    const spawnMeteor = (now) => {
      const fromLeft = Math.random() > 0.35;
      const startX = fromLeft
        ? width * (0.12 + Math.random() * 0.52)
        : width * (0.45 + Math.random() * 0.45);
      const startY = height * (0.04 + Math.random() * 0.26);
      const angle = fromLeft
        ? 0.38 + Math.random() * 0.28
        : Math.PI - (0.38 + Math.random() * 0.28);
      const speed = 520 + Math.random() * 340;
      const duration = 900 + Math.random() * 420;

      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 85 + Math.random() * 75,
        bornAt: now,
        duration,
      });

      nextMeteorAt = now + (4800 + Math.random() * 4200);
    };

    const drawAstrolabeArcs = (ox, oy) => {
      const cx = width * 0.5 + ox * 0.25;
      const cy = height * 0.14 + oy * 0.25;
      const outerRadius = Math.max(width, height) * 0.46;
      const innerRadius = Math.max(width, height) * 0.31;

      // Zenith warm candlelight wash (no purple/cyan)
      const zenith = ctx.createRadialGradient(
        cx,
        cy,
        10,
        cx,
        cy,
        outerRadius * 1.15,
      );
      zenith.addColorStop(0, "rgba(197, 160, 89, 0.045)");
      zenith.addColorStop(0.45, "rgba(94, 25, 20, 0.025)");
      zenith.addColorStop(1, "rgba(11, 10, 14, 0)");
      ctx.fillStyle = zenith;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(197, 160, 89, 0.075)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();

      ctx.strokeStyle = "rgba(138, 109, 59, 0.065)";
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, Math.PI * 0.12, Math.PI * 0.88);
      ctx.stroke();
      ctx.restore();
    };

    const drawDiamondStar = (x, y, size, alpha) => {
      ctx.save();
      ctx.strokeStyle = `rgba(197, 160, 89, ${alpha * 0.72})`;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(x - size * 3.1, y);
      ctx.lineTo(x + size * 3.1, y);
      ctx.moveTo(x, y - size * 3.1);
      ctx.lineTo(x, y + size * 3.1);
      ctx.stroke();

      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5.2);
      glow.addColorStop(0, `rgba(197, 160, 89, ${alpha * 0.28})`);
      glow.addColorStop(1, "rgba(197, 160, 89, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const renderFrame = (now, dt) => {
      ctx.clearRect(0, 0, width, height);

      // Ease parallax smoothly when fine pointer moves
      pointer.currentX += (pointer.targetX - pointer.currentX) * Math.min(1, dt * 4.5);
      pointer.currentY += (pointer.targetY - pointer.currentY) * Math.min(1, dt * 4.5);

      drawAstrolabeArcs(pointer.currentX, pointer.currentY);

      const seconds = now * 0.001;

      // Subtle hairline constellations behind anchor stars
      ctx.save();
      ctx.strokeStyle = "rgba(197, 160, 89, 0.11)";
      ctx.lineWidth = 0.75;
      for (const chain of constellationChains) {
        ctx.beginPath();
        chain.forEach((star, idx) => {
          const sx = star.x + pointer.currentX * star.depth;
          const sy = star.y + pointer.currentY * star.depth;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
      }
      ctx.restore();

      // Render stars
      for (const star of stars) {
        const sx = star.x + pointer.currentX * star.depth;
        const sy = star.y + pointer.currentY * star.depth;
        const twinkle = reducedMotion
          ? 0.85
          : 0.62 + 0.38 * Math.sin(seconds * star.twinkleSpeed + star.phase);
        const alpha = star.baseAlpha * twinkle;

        if (star.isAnchor) {
          drawDiamondStar(sx, sy, star.radius, alpha);
        }

        ctx.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reducedMotion) return;

      // Spawn and advance poetic gold-leaf meteors
      if (now >= nextMeteorAt && meteors.length < 2) {
        spawnMeteor(now);
      }

      for (let i = meteors.length - 1; i >= 0; i -= 1) {
        const m = meteors[i];
        const elapsed = now - m.bornAt;
        const progress = elapsed / m.duration;

        if (progress >= 1) {
          meteors.splice(i, 1);
          continue;
        }

        const easeFade =
          progress < 0.18
            ? progress / 0.18
            : Math.pow(1 - (progress - 0.18) / 0.82, 1.35);

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        const speed = Math.hypot(m.vx, m.vy) || 1;
        const dx = (m.vx / speed) * m.length * (0.55 + easeFade * 0.45);
        const dy = (m.vy / speed) * m.length * (0.55 + easeFade * 0.45);

        const tailX = m.x - dx;
        const tailY = m.y - dy;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(232, 226, 213, ${(0.95 * easeFade).toFixed(3)})`);
        grad.addColorStop(0.28, `rgba(197, 160, 89, ${(0.72 * easeFade).toFixed(3)})`);
        grad.addColorStop(0.68, `rgba(139, 58, 50, ${(0.28 * easeFade).toFixed(3)})`);
        grad.addColorStop(1, "rgba(11, 10, 14, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Crisp luminous meteor head
        const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 9);
        headGlow.addColorStop(0, `rgba(232, 226, 213, ${(0.92 * easeFade).toFixed(3)})`);
        headGlow.addColorStop(0.35, `rgba(197, 160, 89, ${(0.48 * easeFade).toFixed(3)})`);
        headGlow.addColorStop(1, "rgba(197, 160, 89, 0)");
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 9, 0, Math.PI * 2);
        ctx.fill();

        // Occasional trailing gold-leaf dust spark
        if (Math.random() < 0.36 && sparks.length < 32) {
          sparks.push({
            x: m.x - dx * 0.14 + (Math.random() - 0.5) * 4,
            y: m.y - dy * 0.14 + (Math.random() - 0.5) * 4,
            vx: m.vx * 0.08 + (Math.random() - 0.5) * 18,
            vy: m.vy * 0.08 + (Math.random() - 0.5) * 18,
            alpha: 0.72 * easeFade,
            radius: 0.8 + Math.random() * 1.1,
          });
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const sp = sparks[i];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.alpha -= dt * 1.15;

        if (sp.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(197, 160, 89, ${sp.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
      lastTime = now;
      renderFrame(now, dt);
      if (!reducedMotion && document.visibilityState !== "hidden") {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      lastTime = performance.now();
      renderFrame(lastTime, 0.016);
      if (!reducedMotion && document.visibilityState !== "hidden") {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e) => {
      if (!finePointerQuery?.matches || reducedMotion) return;
      const nx = (e.clientX / Math.max(1, width) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, height) - 0.5) * 2;
      pointer.targetX = -nx * 9;
      pointer.targetY = -ny * 7;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        nextMeteorAt = performance.now() + 2000;
        startLoop();
      }
    };

    const handleMotionChange = (e) => {
      reducedMotion = Boolean(e.matches);
      if (reducedMotion) {
        meteors.length = 0;
        sparks.length = 0;
      }
      startLoop();
    };

    resize();
    startLoop();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        startLoop();
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery?.addEventListener?.("change", handleMotionChange);

    return () => {
      clearTimeout(resizeTimer);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery?.removeEventListener?.("change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
