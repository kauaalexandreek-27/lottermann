/* ============================================================
   BOOKING.JS — lógica do sistema de agendamento em etapas
   Etapas: 1 Barbeiro · 2 Serviço · 3 Data · 4 Horário · 5 Confirmação
   ============================================================ */

const TOTAL_STEPS = 5;

const state = {
  step: 1,
  barberId: null,
  serviceId: null,
  dateISO: null, // "AAAA-MM-DD"
  time: null,
  clientName: "",
  clientPhone: ""
};

const calState = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth() // 0-11
};

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  readBarberFromURL();
  renderBarberStep();
  renderServiceStep();
  renderCalendar();
  bindGlobalActions();
  goToStep(1, { skipScroll: true });
});

/* -------------------------------------------------- Navegação */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function readBarberFromURL() {
  const params = new URLSearchParams(window.location.search);
  const barberId = params.get("barbeiro");
  if (barberId && BARBERS.some(b => b.id === barberId)) {
    state.barberId = barberId;
  }
}

function goToStep(step, opts = {}) {
  state.step = step;

  document.querySelectorAll(".stage-panel").forEach(panel => {
    panel.classList.toggle("active", Number(panel.dataset.panel) === step);
  });

  document.querySelectorAll(".progress-step").forEach(el => {
    const n = Number(el.dataset.step);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
  });

  const fillPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  document.getElementById("progress-bar-fill").style.width = fillPct + "%";

  if (step === 5) renderSummary("summary-card");

  if (!opts.skipScroll) {
    document.getElementById("booking-flow").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function bindGlobalActions() {
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => goToStep(Math.max(1, state.step - 1)));
  });

  const nextDateBtn = document.querySelector("[data-next-date]");
  if (nextDateBtn) {
    nextDateBtn.addEventListener("click", () => {
      if (!state.dateISO) return;
      renderSlotsStep();
      goToStep(4);
    });
  }

  const form = document.getElementById("booking-form");
  form.addEventListener("submit", handleFormSubmit);

  document.getElementById("new-booking-btn").addEventListener("click", resetBooking);
}

/* -------------------------------------------------- ETAPA 1: Barbeiro */
function renderBarberStep() {
  const list = document.getElementById("barber-list");
  list.innerHTML = BARBERS.map(
    b => `
    <div class="barber-card selectable-card ${state.barberId === b.id ? "selected" : ""}" data-barber-id="${b.id}" tabindex="0" role="button" aria-pressed="${state.barberId === b.id}">
      <div class="barber-photo">
        ${b.photo ? `<img src="${b.photo}" alt="Foto de ${b.name}">` : `<span class="initials">${getInitials(b.name)}</span>`}
      </div>
      <div class="barber-info">
        <h3>${b.name}</h3>
        <span class="role">${b.role}</span>
        <button type="button" class="btn btn-outline btn-sm btn-block">Escolher</button>
      </div>
    </div>`
  ).join("");

  list.querySelectorAll(".barber-card").forEach(card => {
    const select = () => {
      state.barberId = card.dataset.barberId;
      // se a data já foi escolhida, os horários dependem do barbeiro: zera o horário
      state.time = null;
      list.querySelectorAll(".barber-card").forEach(c => {
        c.classList.remove("selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
      setTimeout(() => goToStep(2), 180);
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
    });
  });
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* -------------------------------------------------- ETAPA 2: Serviço */
function renderServiceStep() {
  const list = document.getElementById("service-list");
  list.innerHTML = SERVICES.map(
    s => `
    <div class="service-card selectable-card ${state.serviceId === s.id ? "selected" : ""}" data-service-id="${s.id}" tabindex="0" role="button" aria-pressed="${state.serviceId === s.id}">
      <h3>${s.name}</h3>
      <p class="desc">${s.desc}</p>
      <div class="service-foot">
        <span class="service-price"><sup>R$</sup>${formatPrice(s.price)}</span>
        <button type="button" class="btn btn-outline btn-sm">Selecionar</button>
      </div>
    </div>`
  ).join("");

  list.querySelectorAll(".service-card").forEach(card => {
    const select = () => {
      state.serviceId = card.dataset.serviceId;
      list.querySelectorAll(".service-card").forEach(c => {
        c.classList.remove("selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
      setTimeout(() => goToStep(3), 180);
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
    });
  });
}

/* -------------------------------------------------- ETAPA 3: Data */
function renderCalendar() {
  const cal = document.getElementById("calendar");
  const today = stripTime(new Date());
  const y = calState.viewYear, m = calState.viewMonth;

  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const isCurrentMonthView = y === today.getFullYear() && m === today.getMonth();

  let daysHTML = "";
  for (let i = 0; i < startWeekday; i++) daysHTML += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = stripTime(new Date(y, m, d));
    const iso = toISODate(thisDate);
    const isPast = thisDate < today;
    const isToday = thisDate.getTime() === today.getTime();
    const isSelected = state.dateISO === iso;

    daysHTML += `
      <button type="button"
        class="cal-day ${isPast ? "disabled" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}"
        ${isPast ? "disabled" : ""}
        data-date="${iso}">${d}</button>`;
  }

  cal.innerHTML = `
    <div class="calendar-head">
      <button type="button" class="cal-nav-btn" id="cal-prev" ${isCurrentMonthView ? "disabled" : ""} aria-label="Mês anterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h3>${MONTH_LABELS[m]} ${y}</h3>
      <button type="button" class="cal-nav-btn" id="cal-next" aria-label="Próximo mês">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div class="cal-weekdays">${WEEKDAY_LABELS.map(w => `<span>${w}</span>`).join("")}</div>
    <div class="cal-days">${daysHTML}</div>
  `;

  document.getElementById("cal-prev").addEventListener("click", () => shiftMonth(-1));
  document.getElementById("cal-next").addEventListener("click", () => shiftMonth(1));

  cal.querySelectorAll(".cal-day[data-date]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.dateISO = btn.dataset.date;
      state.time = null;
      renderCalendar();
      document.querySelector("[data-next-date]").removeAttribute("disabled");
    });
  });
}

function shiftMonth(delta) {
  calState.viewMonth += delta;
  if (calState.viewMonth > 11) { calState.viewMonth = 0; calState.viewYear++; }
  if (calState.viewMonth < 0) { calState.viewMonth = 11; calState.viewYear--; }
  renderCalendar();
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatDateBR(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/* -------------------------------------------------- ETAPA 4: Horário */
function renderSlotsStep() {
  const list = document.getElementById("slots-list");
  const sub = document.getElementById("slots-sub");

  if (!state.barberId || !state.dateISO) {
    list.innerHTML = `<p class="empty-note">Selecione um barbeiro e uma data primeiro.</p>`;
    return;
  }

  const barber = BARBERS.find(b => b.id === state.barberId);
  sub.textContent = `Horários de ${barber ? barber.name : ""} para ${formatDateBR(state.dateISO)}.`;

  const slots = getAvailableSlots(state.barberId, state.dateISO);

  if (slots.length === 0) {
    list.innerHTML = `<p class="empty-note">Nenhum horário cadastrado para este barbeiro.</p>`;
    return;
  }

  list.innerHTML = slots.map(s => `
    <button type="button"
      class="slot-btn ${state.time === s.time ? "selected" : ""}"
      ${s.available ? "" : "disabled"}
      data-time="${s.time}">${s.time}</button>
  `).join("");

  list.querySelectorAll(".slot-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      state.time = btn.dataset.time;
      list.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      setTimeout(() => goToStep(5), 180);
    });
  });
}

/* -------------------------------------------------- ETAPA 5: Resumo + Form */
function renderSummary(targetId) {
  const el = document.getElementById(targetId);
  const barber = BARBERS.find(b => b.id === state.barberId);
  const service = SERVICES.find(s => s.id === state.serviceId);

  el.innerHTML = `
    <div class="summary-row"><span class="k">Barbeiro</span><span class="v">${barber ? barber.name : "—"}</span></div>
    <div class="summary-row"><span class="k">Serviço</span><span class="v">${service ? service.name : "—"}</span></div>
    <div class="summary-row"><span class="k">Data</span><span class="v">${state.dateISO ? formatDateBR(state.dateISO) : "—"}</span></div>
    <div class="summary-row"><span class="k">Horário</span><span class="v">${state.time || "—"}</span></div>
    <div class="summary-row total"><span class="k">Valor</span><span class="v">R$ ${service ? formatPrice(service.price) : "0,00"}</span></div>
  `;
}

function handleFormSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");
  const nameField = document.getElementById("field-name");
  const phoneField = document.getElementById("field-phone");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  const nameValid = name.length >= 3 && name.includes(" ");
  const phoneValid = phone.replace(/\D/g, "").length >= 10;

  nameField.classList.toggle("has-error", !nameValid);
  phoneField.classList.toggle("has-error", !phoneValid);

  if (!nameValid || !phoneValid) return;

  state.clientName = name;
  state.clientPhone = phone;

  showSuccess();
}

/* -------------------------------------------------- Sucesso */
function showSuccess() {
  document.querySelector(".booking-header").style.display = "none";
  document.querySelector(".booking-stage").style.display = "none";
  const success = document.getElementById("success-screen");
  success.style.display = "block";
  renderSummary("final-summary");
  success.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetBooking() {
  state.barberId = null;
  state.serviceId = null;
  state.dateISO = null;
  state.time = null;
  state.clientName = "";
  state.clientPhone = "";

  document.getElementById("booking-form").reset();
  document.getElementById("field-name").classList.remove("has-error");
  document.getElementById("field-phone").classList.remove("has-error");
  document.querySelector("[data-next-date]").setAttribute("disabled", "true");

  document.querySelector(".booking-header").style.display = "";
  document.querySelector(".booking-stage").style.display = "";
  document.getElementById("success-screen").style.display = "none";

  renderBarberStep();
  renderServiceStep();
  renderCalendar();
  goToStep(1);
}