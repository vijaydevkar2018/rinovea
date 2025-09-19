//card scroll animation
(function () {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) return; // Skip animation for Safari

  const row = document.getElementById('iv2Row');
  if (!row) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // keep it static for accessibility

  // Tweak speeds here
  let SPEED = 0.02;                   // px per frame on desktop
  if (window.matchMedia('(max-width: 768px)').matches) SPEED = 0.1; // slightly gentler on mobile

  // 1) Clone children to enable a seamless loop (row width ~= 2x viewport)
  const originals = Array.from(row.children);
  const trackWidth = () =>
    Array.from(row.children).reduce((w, el) => w + el.getBoundingClientRect().width, 0);

  while (trackWidth() < row.clientWidth * 2.2) {
    originals.forEach(card => row.appendChild(card.cloneNode(true)));
  }

  let paused = false;
let rafId;

function tick() {
  if (!paused) {
    row.scrollLeft += SPEED;
    const halfWidth = trackWidth() / 2;   // calculate half of total track width
    if (row.scrollLeft >= halfWidth) {
      row.scrollLeft -= halfWidth;
    }
  }
  rafId = requestAnimationFrame(tick);
}

// Run only when visible
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    tick(); // start animation
  } else {
    cancelAnimationFrame(rafId); // stop when offscreen
  }
});
observer.observe(row);


  // Pause on hover / user touch or drag
  row.addEventListener('mouseenter', () => { paused = true; });
  row.addEventListener('mouseleave', () => { paused = false; });
  row.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  row.addEventListener('touchend',   () => { paused = false; }, { passive: true });

  // Optional: desktop drag-to-scroll (doesn’t break the loop)
  let isDown = false, startX = 0, scrollStart = 0;
  row.addEventListener('mousedown', (e) => { isDown = true; paused = true; startX = e.pageX; scrollStart = row.scrollLeft; });
  row.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    row.scrollLeft = scrollStart - (e.pageX - startX) * 1.4;
  });
  ['mouseup','mouseleave'].forEach(evt => row.addEventListener(evt, () => { isDown = false; paused = false; }));


  // Clean up if this page is navigated away
  window.addEventListener('pagehide', () => cancelAnimationFrame(rafId));
})();


// industries.js — slower, softer reveal
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // TUNABLES — make it slower/smoother here
  const DURATION = 1.6;         // ↑ longer = slower (try 1.4–2.0)
  const EASE = 'power1.out';    // softer than power2
  const DIST = 80;              // slide distance in px (keep this; change duration to slow)
  const MOBILE_Y = 24;          // slight rise on mobile

  gsap.utils.toArray('.industry-block').forEach((block, i) => {
    const content = block.querySelector('.ib-content');
    const media   = block.querySelector('.ib-media');
    const isEven  = i % 2 === 0;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    const fromXContent = isMobile ? 0 : (isEven ? -DIST : DIST);
    const fromXMedia   = isMobile ? 0 : (isEven ?  DIST : -DIST);
    const fromY        = isMobile ? MOBILE_Y : 0;

    if (content) {
      gsap.from(content, {
        x: fromXContent, y: fromY, opacity: 0,
        duration: DURATION, ease: EASE,
        scrollTrigger: { trigger: block, start: 'top 75%', once: true }
      });
    }

    if (media) {
      gsap.from(media, {
        x: fromXMedia, y: fromY, opacity: 0,
        duration: DURATION, delay: 0.2, ease: EASE, // a touch of delay
        scrollTrigger: { trigger: block, start: 'top 75%', once: true }
      });
    }
  });

  // Recompute after images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
});

