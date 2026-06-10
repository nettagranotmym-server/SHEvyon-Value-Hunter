let S = {
  team: null,
  alloc: { nova: 34, prime: 33, fast: 33 },
  prevAlloc: { nova: 34, prime: 33, fast: 33 },
  portfolio: { nova: 34000, prime: 33000, fast: 33000 },
  total: TOTAL,
  currentStep: "training",
  history: [],
  avgAllocSamples: [],
  timer: null,
  timeLeft: TIMER_SEC,
  _pollInterval: null
};

function show(id) {
  document.querySelectorAll(".sc").forEach(s => s.classList.remove("on"));
  document.getElementById(id).classList.add("on");
  window.scrollTo(0, 0);
}

async function renderTeams() {
  const grid = document.getElementById("teamGrid");
  const taken = await serverGetTakenTeams();

  grid.innerHTML = TEAMS.map(t => {
    const isTaken = !!taken[t.id];

    return `
      <button class="tb ${isTaken ? "tb-taken" : ""}" data-id="${t.id}" ${isTaken ? "disabled" : ""}>
        <span class="te">${isTaken ? "🔒" : t.e}</span>
        <span>${t.n}</span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".tb:not(.tb-taken)").forEach(btn => {
    btn.addEventListener("click", () => selectTeam(parseInt(btn.dataset.id)));
  });
}

async function selectTeam(id) {
  const taken = await serverGetTakenTeams();
  if (taken[id]) return renderTeams();

  S.team = TEAMS.find(t => t.id === id);

  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  document.querySelector(`.tb[data-id="${id}"]`).classList.add("sel");

  document.getElementById("startBtn").classList.add("en");
}

function renderCompanyIntro() {
  const wrap = document.getElementById("companyIntroCards");

  wrap.innerHTML = COMPANIES.map(c => `
    <article class="intro-company">
      <div class="company-top">
        <span class="company-icon" style="background:${c.bg};color:${c.color}">
          ${c.icon}
        </span>

        <div>
          <strong>${c.name}</strong>
          <small>${c.type}</small>
        </div>
      </div>

      <div class="mini-grid">
        <div>
          <span>חפיר</span>
          <b>${c.moat}</b>
        </div>

        <div>
          <span>חוב</span>
          <b>${c.debt}</b>
        </div>

        <div>
          <span>הנהלה</span>
          <b>${c.management}</b>
        </div>
      </div>

      <p>${c.story}</p>
    </article>
  `).join("");
}

function bindButtons() {
  document.getElementById("startBtn").addEventListener("click", () => {
    if (!S.team) return;
    show("scrIntro");
  });

  document.getElementById("goCompaniesBtn").addEventListener("click", () => {
    renderCompanyIntro();
    show("scrCompanies");
  });

  document.getElementById("goToGameBtn").addEventListener("click", async () => {
    if (!S.team) return;

    const ok = await serverClaimTeam(S.team.id, S.team.n);

    if (!ok) {
      alert("הצוות כבר נתפס. בחרי צוות אחר.");
      S.team = null;
      document.getElementById("startBtn").classList.remove("en");
      show("scrWelcome");
      renderTeams();
      return;
    }

    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", restart);
}

function startGame() {
  S.alloc = { nova: 34, prime: 33, fast: 33 };
  S.prevAlloc = { ...S.alloc };
  S.portfolio = { nova: 34000, prime: 33000, fast: 33000 };
  S.total = TOTAL;
  S.currentStep = "training";
  S.history = [];
  S.avgAllocSamples = [];

  show("scrGame");

  document.getElementById("gTeam").innerHTML = `<span>${S.team.e}</span> ${S.team.n}`;
  document.getElementById("gBal").textContent = fmt(S.total);

  renderDecisionScreen();
}

function startTimer() {
  clearInterval(S.timer);

  S.timeLeft = TIMER_SEC;
  updateTimer();

  S.timer = setInterval(() => {
    S.timeLeft -= 1;
    updateTimer();

    if (S.timeLeft <= 0) {
      clearInterval(S.timer);
      confirmDecision();
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(S.timeLeft / 60);
  const s = S.timeLeft % 60;

  document.getElementById("gTime").textContent = `${m}:${String(s).padStart(2, "0")}`;
  document.getElementById("gBar").style.width = `${(S.timeLeft / TIMER_SEC) * 100}%`;
}

function renderDecisionScreen() {
  const data = getStepData(S.currentStep);
  const isTraining = S.currentStep === "training";

  document.getElementById("gStep").textContent = isTraining
    ? "שנת ניסיון"
    : `שנה ${data.year} מתוך 5`;

  document.getElementById("gTitle").textContent = data.title;

  const cards = COMPANIES.map(c => {
    const d = data.companies[c.key];

    return `
      <article class="company-card">
        <div class="company-head">
          <span class="company-icon" style="background:${c.bg};color:${c.color}">
            ${c.icon}
          </span>

          <div>
            <strong>${c.name}</strong>
            <small>${c.type}</small>
          </div>
        </div>

        <div class="metrics">
          <div>
            <span>הכנסות</span>
            <b>${d.revenue}</b>
          </div>

          <div>
            <span>רווח</span>
            <b>${d.profit}</b>
          </div>
        </div>

        <div class="news-card">
          <div>📰 כותרת</div>
          <p>${d.headline}</p>
        </div>

        <div class="slider-row">
          <div class="slider-top">
            <span>אחוז בתיק</span>
            <strong class="pct-val" id="pct_${c.key}">
              ${S.alloc[c.key]}%
            </strong>
          </div>

          <input
            class="alloc-slider"
            id="sl_${c.key}"
            data-key="${c.key}"
            type="range"
            min="0"
            max="100"
            step="5"
            value="${S.alloc[c.key]}"
          />
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("gContent").innerHTML = `
    ${isTraining ? `
      <div class="training-note">
        זו שנת תרגול בלבד — התוצאה לא תשפיע על המשחק.
      </div>
    ` : ""}

    <div class="companies-grid">
      ${cards}
    </div>

    <div class="alloc-warning" id="allocWarn"></div>

    <button class="cbtn" id="confirmBtn">
      ${isTraining ? "סיימנו תרגול ➡️" : "אישור החלטה ➡️"}
    </button>
  `;

  document.querySelectorAll(".alloc-slider").forEach(slider => {
    slider.addEventListener("input", () => {
      const key = slider.dataset.key;
      S.alloc[key] = parseInt(slider.value, 10);
      refreshAllocUI();
    });
  });

  document.getElementById("confirmBtn").addEventListener("click", confirmDecision);

  refreshAllocUI();
  startTimer();
}

function refreshAllocUI() {
  COMPANIES.forEach(c => {
    const pctEl = document.getElementById(`pct_${c.key}`);
    const slEl = document.getElementById(`sl_${c.key}`);

    if (pctEl) pctEl.textContent = S.alloc[c.key] + "%";

    if (slEl && parseInt(slEl.value, 10) !== S.alloc[c.key]) {
      slEl.value = S.alloc[c.key];
    }
  });

  const sum = COMPANIES.reduce((s, c) => s + S.alloc[c.key], 0);
  const warn = document.getElementById("allocWarn");
  const btn = document.getElementById("confirmBtn");

  if (sum === 100) {
    warn.textContent = "";
    btn.disabled = false;
  } else if (sum > 100) {
    warn.textContent = `⚠️ חרגתן: ${sum}%. צריך להוריד ${sum - 100}%`;
    btn.disabled = true;
  } else {
    warn.textContent = `⚠️ חסר: ${sum}%. צריך להוסיף ${100 - sum}%`;
    btn.disabled = true;
  }
}

function confirmDecision() {
  const sum = COMPANIES.reduce((s, c) => s + S.alloc[c.key], 0);
  if (sum !== 100) return;

  clearInterval(S.timer);

  if (S.currentStep === "training") {
    S.alloc = { nova: 34, prime: 33, fast: 33 };
    S.prevAlloc = { ...S.alloc };
    S.currentStep = "year1";
    waitOrOpenStep("year1");
    return;
  }

  applyCurrentYear();
}

function applyCurrentYear() {
  const current = getStepData(S.currentStep);
  const previousStep = S.history.length === 0
    ? TRAINING_YEAR
    : YEARS[S.history.length - 1];

  COMPANIES.forEach(c => {
    S.portfolio[c.key] = S.total * S.alloc[c.key] / 100;
  });

  let newTotal = 0;
  const details = [];

  COMPANIES.forEach(c => {
    const from = previousStep.companies[c.key].price;
    const to = current.companies[c.key].price;
    const ret = (to / from) - 1;

    const before = S.portfolio[c.key];
    const after = before * (1 + ret);

    S.portfolio[c.key] = after;
    newTotal += after;

    details.push({
      ...c,
      ret,
      before,
      after
    });
  });

  const oldTotal = S.total;
  S.total = newTotal;

  COMPANIES.forEach(c => {
    S.alloc[c.key] = Math.round((S.portfolio[c.key] / S.total) * 100);
  });

  fixAllocRounding();

  S.avgAllocSamples.push({ ...S.prevAlloc });
  S.prevAlloc = { ...S.alloc };

  S.history.push({
    step: current.step,
    year: current.year,
    totalBefore: oldTotal,
    totalAfter: S.total,
    allocation: { ...S.avgAllocSamples[S.avgAllocSamples.length - 1] }
  });

  upsertTeamProgress({
    ts: Date.now(),
    teamId: S.team.id,
    teamName: S.team.n,
    teamEmoji: S.team.e,
    currentStep: current.step,
    totalNow: S.total,
    yearTotals: S.history.map(h => ({
      year: h.year,
      totalAfter: h.totalAfter
    }))
  });

  showYearResult(current, details, oldTotal);
}

function fixAllocRounding() {
  const sum = COMPANIES.reduce((s, c) => s + S.alloc[c.key], 0);

  if (sum !== 100) {
    S.alloc[COMPANIES[0].key] += (100 - sum);
  }
}

function showYearResult(yearData, details, oldTotal) {
  const change = ((S.total - oldTotal) / oldTotal) * 100;
  const positive = change >= 0;

  document.getElementById("gBal").textContent = fmt(S.total);

  document.getElementById("gContent").innerHTML = `
    <div class="yrc">
      <div class="yr-title">סיכום השנה בתיק שלכן</div>

      <div class="yr-i">
        ${positive ? "📈" : "📉"}
      </div>

      <div class="yr-ch ${positive ? "pos" : "neg"}">
        ${positive ? "+" : ""}${change.toFixed(1)}%
      </div>

      <div class="yr-ex">
        ${yearData.lesson}
      </div>

      <div class="yr-bd">
        ${details.map(d => `
          <div class="yr-ar">
            <span>${d.icon} ${d.name}</span>
            <span class="${d.ret >= 0 ? "pos" : "neg"}">
              ${d.ret >= 0 ? "+" : ""}${(d.ret * 100).toFixed(0)}%
            </span>
          </div>
        `).join("")}
      </div>

      <div class="yr-bal">
        <div class="yr-bl">שווי התיק</div>
        <div class="yr-bv">${fmt(S.total)}</div>
      </div>

      <button class="nbtn" id="nextBtn">
        ${yearData.year >= 5 ? "לתוצאות הסופיות 🏆" : "לשנה הבאה ➡️"}
      </button>
    </div>
  `;

  document.getElementById("nextBtn").addEventListener("click", nextStep);
}

async function nextStep() {
  const idx = stepIndex(S.currentStep);
  const next = STEPS[idx + 1];

  if (!next) {
    showResults();
    return;
  }

  S.currentStep = next.step;
  await waitOrOpenStep(next.step);
}

async function waitOrOpenStep(step) {
  const openStep = await serverGetOpenStep();

  if (stepIndex(step) > stepIndex(openStep)) {
    showWaiting(step);
    return;
  }

  renderDecisionScreen();
}

function showWaiting(step) {
  const label = STEPS.find(s => s.step === step).label;

  document.getElementById("gContent").innerHTML = `
    <div class="evc wait-card">
      <div class="evi">⏳</div>

      <div class="evt">
        ממתינות לפתיחת ${label}
      </div>

      <div class="evd">
        המנהלת תפתח את השלב הבא בקרוב.<br>
        אין צורך לרענן את הדף.
      </div>

      <div id="waitDots" class="admin-muted">
        בודקות...
      </div>
    </div>
  `;

  let dots = 0;
  clearInterval(S._pollInterval);

  S._pollInterval = setInterval(async () => {
    dots = (dots + 1) % 4;

    const el = document.getElementById("waitDots");
    if (el) el.textContent = "בודקות" + ".".repeat(dots + 1);

    const openStep = await serverGetOpenStep();

    if (stepIndex(step) <= stepIndex(openStep)) {
      clearInterval(S._pollInterval);
      S._pollInterval = null;
      renderDecisionScreen();
    }
  }, 3000);
}

function showResults() {
  show("scrResults");

  const finalTotal = S.total;
  const totalReturn = ((finalTotal - TOTAL) / TOTAL) * 100;
  const positive = totalReturn >= 0;

  document.getElementById("rTeam").textContent = `${S.team.e} ${S.team.n}`;
  document.getElementById("rAmount").textContent = fmt(finalTotal);

  const rReturn = document.getElementById("rReturn");
  rReturn.textContent = `${positive ? "+" : ""}${totalReturn.toFixed(0)}% תשואה כוללת`;
  rReturn.className = `fr ${positive ? "pos" : "neg"}`;

  const avg = {};

  COMPANIES.forEach(c => {
    avg[c.key] = Math.round(
      S.avgAllocSamples.reduce((s, a) => s + (a[c.key] || 0), 0) /
      Math.max(1, S.avgAllocSamples.length)
    );
  });

  const perf = COMPANIES.map(c => {
    const start = TRAINING_YEAR.companies[c.key].price;
    const end = YEARS[YEARS.length - 1].companies[c.key].price;

    return {
      ...c,
      perf: (end / start - 1) * 100
    };
  }).sort((a, b) => b.perf - a.perf);

  document.getElementById("winnerCard").innerHTML = `
    <div class="bonus-title">החברה שיצרה הכי הרבה ערך</div>

    <div class="bonus-val">
      ${perf[0].icon} ${perf[0].name}
    </div>

    <div class="bonus-text">
      למרות הכותרות המפחידות בתחילת הדרך, העסק התחזק לאורך זמן.
    </div>
  `;

  document.getElementById("rDetails").innerHTML = `
    <div class="det-t">החזקה ממוצעת לאורך המשחק:</div>

    ${COMPANIES.map(c => `
      <div class="det-r">
        <span>${c.icon} ${c.name}</span>
        <b>${avg[c.key]}%</b>
      </div>
    `).join("")}

    <div class="det-t">מה קרה בפועל לחברות:</div>

    ${perf.map(c => `
      <div class="det-r">
        <span>${c.icon} ${c.name}</span>
        <b class="${c.perf >= 0 ? "pos" : "neg"}">
          ${c.perf >= 0 ? "+" : ""}${c.perf.toFixed(0)}%
        </b>
      </div>
    `).join("")}
  `;

  saveRun({
    ts: Date.now(),
    teamId: S.team.id,
    teamName: S.team.n,
    teamEmoji: S.team.e,
    finalTotal,
    totalReturn,
    avgAllocation: avg,
    yearTotals: S.history.map(h => ({
      year: h.year,
      totalAfter: h.totalAfter
    }))
  });
}

function restart() {
  clearInterval(S._pollInterval);
  clearInterval(S.timer);

  S.team = null;

  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  document.getElementById("startBtn").classList.remove("en");

  show("scrWelcome");
  renderTeams();
}

function startTeamPolling() {
  setInterval(renderTeams, 6000);
}

(function init() {
  renderTeams();
  bindButtons();
  startTeamPolling();
  show("scrWelcome");
})();