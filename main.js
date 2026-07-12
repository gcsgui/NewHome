/* =========================================================
   Chá de Casa Nova — Vanilla JS
   ========================================================= */

(function () {
  "use strict";

  // ---------- Dados dos presentes ----------
  const GIFTS = window.GIFTS_DATABASE || {};
  const RESERVADOS = window.PRESENTES_RESERVADOS || [];

  // ---------- Renderização de presentes ----------
  const grid = document.getElementById("gift-grid");
  const tabs = document.querySelectorAll(".tab");

  function renderGifts(category) {
    const items = GIFTS[category] || [];
    grid.innerHTML = items
      .map((g) => {
        const isReserved = RESERVADOS.includes(g.id);

        return `
        <article class="card ${isReserved ? "is-chosen" : ""}" data-id="${g.id}">
          <span class="card__label">${labelFor(category)}</span>
          <h3 class="card__title">${g.title}</h3>
          <p class="card__desc">${g.desc}</p>
          <div class="card__foot">
            <span class="card__price">${g.price}</span>
            <button class="card__cta" data-choose="${g.id}" data-cat="${category}" ${isReserved ? "disabled" : ""}>
              ${isReserved ? "Reservado" : "Escolher"}
            </button>
          </div>
        </article>`;
      })
      .join("");
  }

  function labelFor(cat) {
    return {
      eletros: "Eletros",
      cozinha: "Cozinha",
      cama: "Cama, Mesa & Banho",
      decor: "Décor",
    }[cat];
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderGifts(tab.dataset.tab);
    });
  });

  renderGifts("eletros");

  // ---------- Modal ----------
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalConfirm = document.getElementById("modal-confirm");
  let currentGiftId = null;

  function openModal(giftId, cat) {
    const gift = GIFTS[cat].find((g) => g.id === giftId);
    if (!gift) return;
    currentGiftId = giftId;
    modalTitle.textContent = gift.title;
    modalDesc.textContent = gift.desc;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    currentGiftId = null;
  }

  document.addEventListener("click", (e) => {
    const chooseBtn = e.target.closest("[data-choose]");
    if (chooseBtn) {
      const id = chooseBtn.dataset.choose;
      const cat = chooseBtn.dataset.cat;
      const gift = GIFTS[cat].find((g) => g.id === id);

      if (gift && !RESERVADOS.includes(id)) {
        openModal(id, cat);
      }
      return;
    }
    if (e.target.matches("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  modalConfirm.addEventListener("click", () => {
    if (!currentGiftId) return;

    let foundGift = null;
    let foundCat = null;
    for (const cat in GIFTS) {
      const item = GIFTS[cat].find((g) => g.id === currentGiftId);
      if (item) {
        foundGift = item;
        foundCat = cat;
        break;
      }
    }

    if (foundGift) {
      const seuTelefone = "5551981292237";
      const mensagemTexto = `Olá! Gostaria de reservar um presente da categoria *${labelFor(foundCat)}* para o Chá de Casa Nova.\n\nCódigo de validação do item: \`${foundGift.id}\`\n\nPodem confirmar para mim a reserva? Muito obrigado!`;
      const urlWhatsapp = `https://api.whatsapp.com/send?phone=${seuTelefone}&text=${encodeURIComponent(mensagemTexto)}`;
      window.open(urlWhatsapp, "_blank");
    }

    closeModal();
  });

  // ---------- Nav on scroll ----------
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Form RSVP ----------
  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("is-success");

    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.nome || data.nome.trim().length < 2) {
      status.textContent = "Por favor, informe seu nome completo.";
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) {
      status.textContent = "Informe um e-mail válido.";
      return;
    }

    // Persistência local (sem backend)
    const rsvps = JSON.parse(localStorage.getItem("rsvps") || "[]");
    rsvps.push({ ...data, at: new Date().toISOString() });
    localStorage.setItem("rsvps", JSON.stringify(rsvps));

    status.classList.add("is-success");

    if (data.presenca === "sim") {
      status.textContent = `Obrigado, ${data.nome.split(" ")[0]}. Sua presença foi confirmada.`;
      window.open("https://chat.whatsapp.com/Hej1c1GLZk58fIlOXJ2LcF", "_blank", "noopener,noreferrer");
    } else {
      status.textContent = "Sentiremos sua falta. Obrigado por avisar.";
    }

    form.reset();
  });
})();