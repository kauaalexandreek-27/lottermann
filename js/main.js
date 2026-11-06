/* ============================================================
   MAIN.JS — comportamento da página inicial
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initReveal();
  renderServicesPreview();
  renderBarbersPreview();
  initYear();
});

/* Menu mobile */
function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

/* Animações suaves ao rolar a página */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach(i => i.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach(item => observer.observe(item));
}

/* Ícones simples em SVG usados nos cards de serviço */
function getServiceIcon(name) {
  const icons = {
    scissors: '<path d="M6 6l12 12M18 6L6 18M9 9a2 2 0 100-4 2 2 0 000 4zm0 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    razor: '<path d="M4 16l8-10 8 4-8 10-8-4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    combo: '<path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
    clean: '<path d="M12 3c3 4 6 7 6 11a6 6 0 11-12 0c0-4 3-7 6-11z" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    fade: '<path d="M4 18c4-10 12-10 16-14M4 14c3-6 9-7 13-9M4 10c2-3 6-4 9-5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
    comb: '<path d="M4 5h16v3H4zM6 8v11M9 8v11M12 8v11M15 8v11M18 8v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>'
  };
  return icons[name] || icons.scissors;
}

/* Renderiza os primeiros serviços na página inicial (usa dados de services.js) */
function renderServicesPreview() {
  const wrap = document.querySelector("[data-services-preview]");
  if (!wrap || typeof SERVICES === "undefined") return;

  const preview = SERVICES.slice(0, 6);
  wrap.innerHTML = preview
    .map(
      s => `
      <div class="service-card reveal">
        <div class="service-icon">
          <svg width="22" height="22" viewBox="0 0 24 24">${getServiceIcon(s.icon)}</svg>
        </div>
        <h3>${s.name}</h3>
        <p class="desc">${s.desc}</p>
        <div class="service-foot">
          <span class="service-price"><sup>R$</sup>${formatPrice(s.price)}</span>
        </div>
      </div>`
    )
    .join("");

  initReveal();
}

/* Renderiza os barbeiros na página inicial (usa dados de barbers.js) */
function renderBarbersPreview() {
  const wrap = document.querySelector("[data-barbers-preview]");
  if (!wrap || typeof BARBERS === "undefined") return;

  wrap.innerHTML = BARBERS.map(
    b => `
    <div class="barber-card reveal">
      <div class="barber-photo">
        ${
          b.photo
            ? `<img src="${b.photo}" alt="Foto de ${b.name}">`
            : `<span class="initials">${getInitials(b.name)}</span>`
        }
      </div>
      <div class="barber-info">
        <h3>${b.name}</h3>
        <span class="role">${b.role}</span>
        <a class="btn btn-outline btn-sm btn-block" href="agendamento.html?barbeiro=${b.id}">Escolher</a>
      </div>
    </div>`
  ).join("");

  initReveal();
}

function getInitials(name) {
  return name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function initYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
}