document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  
  // Initialize header functionality immediately since it's already in the DOM
  initHeader(header);
});

function initHeader(host) {
  const btn   = host.querySelector(".mobile-menu-icon");
  const links = host.querySelector(".nav-links");

  if (!btn || !links) return;

  function openMenu(open) {
    links.classList.toggle("active", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("no-scroll", open);
  }

  btn.addEventListener("click", () => {
    openMenu(!links.classList.contains("active"));
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });

  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => openMenu(false))
  );

  document.addEventListener("click", (e) => {
    if (!host.contains(e.target)) openMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") openMenu(false);
  });

  const mq = window.matchMedia("(min-width: 992px)");
  mq.addEventListener?.("change", (ev) => { if (ev.matches) openMenu(false); });
}
