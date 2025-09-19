// ---- TOP of animations.js ----
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.gsap) {
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  } else if (window.TextPlugin) {
    gsap.registerPlugin(TextPlugin);
  }
}

/*
// Skip intro loader on Safari or Mobile (slow performance)
if (window.matchMedia("(max-width: 768px)").matches) {
  const loader = document.getElementById("intro-loader");
  if (loader) loader.style.display = "none";
}
*/

// Hero Section animation (lighter for Safari)
if (!isSafari) {
  gsap.from(".hero h1", { opacity: 0, y: 50, duration: 1, delay: 0.2 });
  gsap.from(".hero p", { opacity: 0, y: 50, duration: 1, delay: 0.5 });
  gsap.from(".hero-buttons", { opacity: 0, y: 30, duration: 1, delay: 0.8 });
} else {
  // Instantly visible on Safari (faster load, avoids lag)
  document.querySelectorAll(".hero h1, .hero p, .hero-buttons")
    .forEach(el => el.style.opacity = "1");
}


function animateOnceOnView(target, vars) {
  // Skip heavy scroll work on Safari or when reduced motion is requested
  if (isSafari || prefersReduced || !window.ScrollTrigger) return;

  gsap.from(target, {
    ...vars,
    scrollTrigger: {
      trigger: target,
      start: "top 85%",
      toggleActions: "play none none none", // run once
      once: true
    }
  });
}

// Replace these:
// gsap.from(".about-text", { scrollTrigger: ".about-text", x: -100, opacity: 0, duration: 1 });
// gsap.from(".about-image", { scrollTrigger: ".about-image", x: 100, opacity: 0, duration: 1 });

// With these:
if (document.querySelector(".about-text")) {
  animateOnceOnView(".about-text", { x: -60, opacity: 0, duration: 0.8, ease: "power2.out", force3D: true });
}
if (document.querySelector(".about-image")) {
  animateOnceOnView(".about-image", { x: 60, opacity: 0, duration: 0.8, ease: "power2.out", force3D: true });
}

// Same idea for value boxes + CTA overlay (run once, lighter distance)
gsap.utils.toArray(".value-box-inner").forEach((box) => {
  animateOnceOnView(box, { y: 40, opacity: 0, duration: 0.6, ease: "power2.out", force3D: true });
});

if (document.querySelector(".cta-overlay")) {
  animateOnceOnView(".cta-overlay", { opacity: 0, scale: 0.95, duration: 0.8, ease: "power2.out" });
}


gsap.registerPlugin(TextPlugin);

const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

tl.to("#line1", {
  duration: 2,
  text: "Empowering Innovation.",
  ease: "none"
})
.to("#line2", {
  duration: 2,
  text: "Building Future-Ready Products.",
  ease: "none"
})
.to("#line1", {
  duration: 0.5,
  text: "",
  delay: 1,
  ease: "none"
})
.to("#line2", {
  duration: 0.5,
  text: "",
  ease: "none"
});

window.addEventListener("load", () => {
  const introPlayed = sessionStorage.getItem("introPlayed");

  if (introPlayed) {
    // Skip animation and hide intro immediately
    const loader = document.getElementById("intro-loader");
    if (loader) loader.style.display = "none";
    return;
  }

  // Mark as played
  sessionStorage.setItem("introPlayed", "true");

  // Run animation only once
  const tl = gsap.timeline();

  tl.to(".intro-logo", {
    duration: 1,
    opacity: 1,
    ease: "power2.out"
  });

  tl.to(".intro-words", {
    duration: 0.5,
    opacity: 1,
    delay: 0.2
  });

  tl.to(".word", {
    x: 0,
    opacity: 1,
    stagger: 0.15,
    duration: 0.4,
    ease: "power2.out"
  });

  tl.to("#intro-loader", {
    opacity: 0,
    duration: 0.8,
    delay: 0.5,
    onComplete: () => {
      document.getElementById("intro-loader").style.display = "none";
    }
  });
});





//card scroll
// ===== INDUSTRIES: scroll-controlled active card (no click, no autoplay) =====
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.industries-carousel');
  const cards = Array.from(document.querySelectorAll('.industry-card'));
  if (!track || cards.length === 0) return;

  cards.forEach(el => {
    el.removeAttribute('onclick');
    el.addEventListener('click', e => e.preventDefault(), { passive: true });
  });

  gsap.registerPlugin(ScrollTrigger);

  const setActive = (i) => {
    cards.forEach((c, idx) => c.classList.toggle('is-active', idx === i));
  };

  // Create a ScrollTrigger that maps scroll progress (0→1) to card index (0→N-1)
  ScrollTrigger.create({
    trigger: track,
    start: "top bottom",     // when the carousel enters viewport
    end: "bottom top",       // until it leaves
    scrub: 1,                // tie updates smoothly to scroll
    onUpdate: self => {
      const n = cards.length;
      // Progress 0..1 mapped across n cards
      let i = Math.floor(self.progress * n);
      if (i < 0) i = 0;
      if (i > n - 1) i = n - 1;
      setActive(i);
    },
    onEnter: () => setActive(0),
    onLeaveBack: () => setActive(0)
  });
});

/* === Industries ROW: auto-scroll left->right, pause on hover, stop on click === */
document.addEventListener('DOMContentLoaded', () => {
  const row = document.querySelector('.industries-row');
  if (!row) return;

  let timer = null;
  let paused = false;
  let stopped = false;

  const STEP_PX = 1;   // tweak speed
  const TICK_MS = 16;  // ~60fps

  function atEnd() {
    return row.scrollLeft + row.clientWidth >= row.scrollWidth - 1;
  }

  function start() {
    if (timer || stopped) return;
    timer = setInterval(() => {
      if (paused || stopped) return;
      row.scrollLeft += STEP_PX;
      if (atEnd()) row.scrollLeft = 0; // loop
    }, TICK_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  row.addEventListener('mouseenter', () => { paused = true; });
  row.addEventListener('mouseleave', () => { paused = false; if (!stopped) start(); });
  row.addEventListener('click', function () {
  stopped = !stopped; // Toggle the stopped state (true -> false, false -> true)

  if (stopped) {
    stop();  // Pause the auto-scroll
  } else {
    start(); // Resume the auto-scroll
  }
});


  // Mobile pause while swiping
  row.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  row.addEventListener('touchend',   () => { paused = false; if (!stopped) start(); }, { passive: true });

  // Optional: drag-to-scroll on desktop
  let isDown = false, startX = 0, scrollLeft = 0;
  row.addEventListener('mousedown', (e) => {
    isDown = true; paused = true;
    startX = e.pageX - row.offsetLeft;
    scrollLeft = row.scrollLeft;
  });
  row.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - row.offsetLeft;
    row.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
  ['mouseleave','mouseup'].forEach(evt => row.addEventListener(evt, () => {
    isDown = false; paused = false; if (!stopped) start();
  }));

  start();
});

(function(){
  function init(){
    var row = document.getElementById('iv2Row');
    if (!row) return;

    var timer = null, paused = false, stopped = false;
    var STEP = 1;    // pixels per tick
    var TICK = 16;   // ~60fps

    function hasOverflow(){ return row.scrollWidth > row.clientWidth + 2; }
    function atEnd(){ return row.scrollLeft + row.clientWidth >= row.scrollWidth - 1; }

    function start(){
      if (timer || stopped || !hasOverflow()) return;
      timer = setInterval(function(){
        if (paused || stopped) return;
        row.scrollLeft += STEP;
        if (atEnd()) row.scrollLeft = 0;  // loop to start
      }, TICK);
    }
    function stop(){ if (timer){ clearInterval(timer); timer = null; } }

    // pause/resume
    row.addEventListener('mouseenter', function(){ paused = true; });
    row.addEventListener('mouseleave', function(){ paused = false; if (!stopped) start(); });

row.addEventListener('click', function () {
  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // On both desktop and mobile: toggle pause/resume
  stopped = !stopped;
  if (stopped) {
    stop();   // pause auto-scroll
  } else {
    start();  // resume auto-scroll
  }
});


    // touch: pause while swiping
    row.addEventListener('touchstart', function(){ paused = true; }, { passive:true });
    row.addEventListener('touchend',   function(){ paused = false; if (!stopped) start(); }, { passive:true });

    // optional: desktop drag-to-scroll
    var isDown=false, startX=0, scrollLeft=0;
    row.addEventListener('mousedown', function(e){
      isDown = true; paused = true;
      startX = e.pageX - row.offsetLeft;
      scrollLeft = row.scrollLeft;
    });
    row.addEventListener('mousemove', function(e){
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - row.offsetLeft;
      row.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
    ['mouseleave','mouseup'].forEach(function(evt){
      row.addEventListener(evt, function(){ isDown=false; paused=false; if(!stopped) start(); });
    });

    start();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




