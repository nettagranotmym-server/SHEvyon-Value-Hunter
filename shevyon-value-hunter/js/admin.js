let ADMIN_PASS = null;

function requirePassword() {
  const pass = prompt("הכניסי סיסמה למסך המנהלת:");
  if (pass !== "8114") {
    alert("סיסמה שגויה.");
    window.location.href = "index.html";
    return false;
  }
  ADMIN_PASS = pass;
  return true;
}

function renderAdminCompanies() {
  const wrap = document.getElementById("adminCompanyCards");
  wrap.innerHTML = COMPANIES.map(c => `
    <article class="admin-company-card">
      <div class="company-top">
        <span class="company-icon" style="background:${c.bg};color:${c.color}">${c.icon}</span>
        <div>
          <strong>${c.name}</strong>
          <small>${c.type}</small>
        </div>
      </div>
      <div class="mini-grid">
        <div><span>חפיר</span><b>${c.moat}</b></div>
        <div><span>חוב</span><b>${c.debt}</b></div>
        <div><span>הנהלה</span><b>${c.management}</b></div>
      </div>
      <p>${c.story}</p>
    </article>
  `).join("");
}

async function renderStepControl() {
  const openStep = await serverGetOpenStep();
  const status = document.getElementById("stepStatus");
  status.textContent = `פתוח עד: ${STEPS.find(s => s.step === openStep)?.label || openStep}`;

  document.getElementById("stepButtons").innerHTML = STEPS.map(s => `
    <button class="kbtn ${stepIndex(s.step) <= stepIndex(openStep) ? "open" : ""}" data-step="${s.step}">
      ${stepIndex(s.step) <= stepIndex(openStep) ? "✅ פתוח" : "פתחי"} ${s.label}
    </button>
  `).join("");

  document.querySelectorAll("[data-step]").forEach(btn => {
    btn.disabled = stepIndex(btn.dataset.step) <= stepIndex(openStep);
    btn.addEventListener("click", async () => {
      try {
        btn.textContent = "שומרת...";
        await serverSetOpenStep(btn.dataset.step, ADMIN_PASS);
        await renderStepControl();
        await renderLessonCard();
      } catch (e) {
        alert("שגיאה: " + e.message);
      }
    });
  });
}

async function renderLessonCard() {
  const openStep = await serverGetOpenStep();
  const data = getStepData(openStep);
  const card = document.getElementById("lessonCard");
  if (!data) return;
  card.innerHTML = `
    <div class="lesson-year">${openStep === "training" ? "🧪" : "📅"} ${STEPS.find(s => s.step === openStep).label}</div>
    <div class="lesson-title">${data.title}</div>
    <div class="lesson-text">${data.lesson}</div>
  `;
}

async function renderAdminTable() {
  const summary = document.getElementById("adminSummary");
  const wrap = document.getElementById("adminTableWrap");

  const years = YEARS.map(y => y.year);
  wrap.innerHTML = `
    <table class="admin_tbl">
      <thead>
        <tr>
          <th>קבוצה</th>
          ${years.map(y => `<th>שנה ${y}</th>`).join("")}
          <th>סופי</th>
        </tr>
      </thead>
      <tbody>
        ${TEAMS.map(t => `
          <tr id="row_${t.id}">
            <td><span class="admin_badge"><span>${t.e}</span><span>${t.n}</span></span></td>
            ${years.map(() => "<td>—</td>").join("")}
            <td>—</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  try {
    const [runs, progressArr] = await Promise.all([
      serverGetAllRuns(ADMIN_PASS),
      serverGetAllProgress(ADMIN_PASS)
    ]);

    const openStep = await serverGetOpenStep();
    summary.textContent = `${runs.length} תוצאות סופיות · ${progressArr.length} מצבי ביניים · פתוח עד ${STEPS.find(s => s.step === openStep)?.label}`;

    const latestRuns = new Map();
    runs.forEach(r => latestRuns.set(r.teamId, r));

    const progressByTeam = new Map();
    progressArr.forEach(p => progressByTeam.set(p.teamId, p));

    TEAMS.forEach(t => {
      const row = document.getElementById(`row_${t.id}`);
      if (!row) return;

      const prog = progressByTeam.get(t.id);
      const fin = latestRuns.get(t.id);
      const src = prog || fin;
      const byYear = new Map();

      if (src && Array.isArray(src.yearTotals)) {
        src.yearTotals.forEach(y => byYear.set(y.year, y.totalAfter));
      }

      const cells = row.querySelectorAll("td");
      cells[0].innerHTML = `<span class="admin_badge"><span>${t.e}</span><span>${t.n}</span></span>`;

      years.forEach((y, i) => {
        const val = byYear.get(y);
        cells[i + 1].textContent = typeof val === "number" ? fmt(val) : "—";
      });

      cells[years.length + 1].innerHTML = fin
        ? `<span class="final-money">${fmt(fin.finalTotal)}</span>`
        : "—";
    });
  } catch (e) {
    summary.textContent = "שגיאה בטעינת נתונים";
  }
}

function bindAdminButtons() {
  document.getElementById("btnRefresh").addEventListener("click", async () => {
    await renderStepControl();
    await renderLessonCard();
    await renderAdminTable();
  });

  document.getElementById("btnClear").addEventListener("click", async () => {
    if (!confirm("לאפס את כל הנתונים?")) return;
    try {
      await serverClearAll(ADMIN_PASS);
      await renderStepControl();
      await renderLessonCard();
      await renderAdminTable();
    } catch (e) {
      alert("שגיאה באיפוס: " + e.message);
    }
  });
}

(async function initAdmin() {
  if (!requirePassword()) return;
  bindAdminButtons();
  renderAdminCompanies();
  await renderStepControl();
  await renderLessonCard();
  await renderAdminTable();
  setInterval(renderAdminTable, 5000);
})();
