// Появление блоков при скролле
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Лёгкая каскадная задержка для карточек/шагов/статов
document.querySelectorAll(".cards, .steps__grid, .stats").forEach((group) => {
  group.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });
});

// Анимация счётчиков
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat__num").forEach((el) => countObserver.observe(el));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Живой мокап чата с ботом =====
const chatBody = document.getElementById("chatBody");
const dialog = [
  { who: "bot", text: "Привет! Я бот Vladimir AI 👋" },
  { who: "bot", text: "Что хотите автоматизировать?" },
  { who: "user", text: "Заявки из Telegram и ответы клиентам" },
  { who: "bot", text: "Отлично! Соберём бота-агента за пару дней ⚡" },
  { who: "bot", text: "Заполните анкету — и стартуем 🚀" },
];

function addBubble(who, text) {
  const el = document.createElement("div");
  el.className = `bubble bubble--${who}`;
  el.textContent = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addTyping() {
  const el = document.createElement("div");
  el.className = "bubble bubble--bot bubble--typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
  return el;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function playChat() {
  if (!chatBody) return;
  while (true) {
    chatBody.innerHTML = "";
    for (const msg of dialog) {
      if (msg.who === "bot") {
        const typing = addTyping();
        await wait(reduceMotion ? 0 : 900);
        typing.remove();
      } else {
        await wait(reduceMotion ? 0 : 500);
      }
      addBubble(msg.who, msg.text);
      await wait(reduceMotion ? 200 : 800);
    }
    await wait(reduceMotion ? 600 : 3500);
  }
}

// Запускаем чат, когда он попал в зону видимости
let chatStarted = false;
const chatEl = document.getElementById("chat");
if (chatEl) {
  const chatObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !chatStarted) {
      chatStarted = true;
      playChat();
    }
  }, { threshold: 0.3 });
  chatObs.observe(chatEl);
}

// ===== 3D-наклон карточек =====
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

// ===== Свечение и параллакс орбов за курсором =====
const orbsWrap = document.querySelector(".bg-orbs");
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    if (orbsWrap) {
      const cx = (e.clientX / window.innerWidth - 0.5) * 26;
      const cy = (e.clientY / window.innerHeight - 0.5) * 26;
      orbsWrap.style.transform = `translate(${cx}px, ${cy}px)`;
    }
  });
}

// ===== Кнопка наверх =====
const toTop = document.getElementById("toTop");
if (toTop) {
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("is-shown", window.scrollY > 600);
  });
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
