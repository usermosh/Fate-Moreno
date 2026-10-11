/* ==========================================================================
   Purple identity card — script.js
   1. Footer year
   2. Profile photo fallback
   3. Link hover spotlight
   4. Floating particles
   ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Profile photo fallback ----------
     If fate.jpg is missing or fails to load, show a neutral icon
     instead of a broken-image symbol. */
  const avatar = document.querySelector(".avatar");
  const photo = avatar && avatar.querySelector("img");
  if (photo) {
    const showFallback = () => avatar.classList.add("avatar--empty");
    photo.addEventListener("error", showFallback);
    if (photo.complete && photo.naturalWidth === 0) showFallback();
  }

  /* ---------- 3. Link hover spotlight ---------- */
  document.querySelectorAll(".link").forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      const rect = link.getBoundingClientRect();
      link.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      link.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  /* ---------- 4. Floating particles ---------- */
  const canvas = document.getElementById("particles");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const COLORS = ["196, 181, 253", "167, 139, 250", "233, 213, 255"]; // lavender tones
  let particles = [];
  let width = 0;
  let height = 0;
  let rafId = null;

  function createParticle(startAnywhere) {
    return {
      x: Math.random() * width,
      y: startAnywhere ? Math.random() * height : height + 10,
      radius: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.25 + 0.08,
      sway: Math.random() * 0.4 - 0.2,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Keep the count modest: ~1 particle per 18,000 px², capped.
    const count = Math.min(Math.round((width * height) / 18000), 60);
    particles = Array.from({ length: count }, () => createParticle(true));
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      const twinkle = 0.35 + 0.35 * Math.sin(time / 1200 + p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${twinkle})`;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.fill();

      p.y -= p.speed;
      p.x += p.sway * 0.3;

      if (p.y < -10 || p.x < -10 || p.x > width + 10) {
        Object.assign(p, createParticle(false));
      }
    }
  }

  function loop(time) {
    draw(time);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(rafId);
    rafId = null;
    if (prefersReducedMotion.matches) {
      draw(0);              // single still frame, no movement
    } else {
      rafId = requestAnimationFrame(loop);
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); start(); }, 150);
  });

  // Pause when the tab is hidden to save battery
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      start();
    }
  });

  prefersReducedMotion.addEventListener("change", start);

  resize();
  start();
})();
