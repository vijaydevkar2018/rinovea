document.addEventListener("DOMContentLoaded", () => {
  const elExp = document.getElementById("type-expertise");
  const elInv = document.getElementById("type-innovation");
  if (!elExp || !elInv) return;

  const WORD_EXP = "Expertise";
  const WORD_INV = "Innovation";

  const TYPE_SPEED = 120;  // ms per char
  const HOLD_MS   = 300;  // pause between words

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function typeText(el, text, speed = TYPE_SPEED) {
    el.classList.add("type-caret");   // keep your caret style if you have it
    el.textContent = "";
    for (const ch of text) {
      el.textContent += ch;
      await sleep(speed);
    }
    el.classList.remove("type-caret");
  }

  // Always run once on each load/refresh
  (async () => {
    // in case of hot reloads, reset both
    elExp.textContent = "";
    elInv.textContent = "";

    await typeText(elExp, WORD_EXP);
    await sleep(HOLD_MS);
    await typeText(elInv, WORD_INV);
    // stop here—no erase, no loop
  })();
});


// ------- Stats counter on view -------
(function () {
  const DURATION = 2500; // ms

  function animateCount(el, to, suffix = "") {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const p = Math.min((now - startTime) / DURATION, 1);
      const val = Math.round(start + (to - start) * p);
      el.textContent = String(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const items = document.querySelectorAll(".stat");
  if (!items.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stat = entry.target;
      const valueEl = stat.querySelector(".stat-value");
      const target = parseInt(stat.getAttribute("data-target"), 10) || 0;
      const suffix = stat.getAttribute("data-suffix") || "";
      animateCount(valueEl, target, suffix);
      obs.unobserve(stat); // run once
    });
  }, { threshold: 0.35 });

  items.forEach((el) => io.observe(el));
})();


// Reveal on scroll (fade-slide for text, zoom-fade for images) with slight stagger
(function () {
  const toReveal = document.querySelectorAll('.fade-slide, .zoom-fade');
  if (!toReveal.length) return;

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Stagger siblings a bit for a smoother feel
      const el = entry.target;
      const parent = el.closest('.vm-row');
      const index = parent ? Array.from(parent.children).indexOf(el) : 0;

      setTimeout(() => {
        el.classList.add('visible');
      }, index * 120); // 120ms stagger

      observer.unobserve(el); // run once
    });
  }, { threshold: 0.18 });

  toReveal.forEach((el) => obs.observe(el));
})();

// Reveal Team section when it enters the viewport
(function () {
  const section = document.querySelector('.team-section.reveal-on-scroll');
  if (!section) return;

  // Fallback if IntersectionObserver unsupported
  if (!('IntersectionObserver' in window)) {
    section.classList.add('is-visible');
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      section.classList.add('is-visible');  // triggers CSS transitions
      obs.unobserve(section);               // run once
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  io.observe(section);
})();
