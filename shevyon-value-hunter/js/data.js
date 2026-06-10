// ===== CONFIG =====
const TOTAL = 100000;
const TIMER_SEC = 90;
const API_BASE = "";

const STORAGE_KEY = "shevyon_value_hunter_runs_v1";
const TEAM_PROGRESS_KEY = "shevyon_value_hunter_progress_v1";
const ADMIN_OPEN_STEP_KEY = "shevyon_value_hunter_open_step";

const TEAMS = [
  { id: 1, n: "צוות ערך", e: "💎" },
  { id: 2, n: "צוות צמיחה", e: "🚀" },
  { id: 3, n: "צוות חפיר", e: "🛡️" },
  { id: 4, n: "צוות חדשות", e: "📰" },
  { id: 5, n: "צוות סבלנות", e: "⏳" },
  { id: 6, n: "צוות שוק", e: "📈" },
  { id: 7, n: "צוות משקיעות", e: "👩‍💼" }
];

const COMPANIES = [
  {
    key: "nova",
    name: "NovaTech",
    icon: "🚀",
    type: "חברת צמיחה",
    color: "var(--purple)",
    bg: "rgba(168,85,247,.14)",
    moat: "חזק מאוד",
    debt: "גבוה",
    management: "יציבה ומנוסה",
    story: "משקיעה הרבה בפיתוח מוצרים חדשים. כרגע הרווחיות חלשה, אבל יש לה טכנולוגיה שקשה למתחרים להעתיק."
  },
  {
    key: "prime",
    name: "Prime Holdings",
    icon: "🏛️",
    type: "חברה יציבה",
    color: "var(--blue)",
    bg: "rgba(59,130,246,.14)",
    moat: "טוב",
    debt: "נמוך",
    management: "יציבה",
    story: "חברה ותיקה ומבוססת. לא צפויה לצמוח במהירות, אך מייצרת הכנסות ורווחים בצורה עקבית."
  },
  {
    key: "fast",
    name: "FastWave",
    icon: "⚡",
    type: "נראית מבטיחה",
    color: "var(--orange)",
    bg: "rgba(249,115,22,.14)",
    moat: "בינוני",
    debt: "נמוך",
    management: "בינונית",
    story: "מציגה תוצאות חזקות וצומחת מהר, אך פועלת בתחום שבו התחרות הולכת וגוברת."
  }
];

const TRAINING_YEAR = {
  step: "training",
  label: "שנת ניסיון",
  title: "שנת ניסיון — לומדות לתפעל",
  lesson: "זו הייתה רק שנת ניסיון. עכשיו המשחק האמיתי מתחיל: בכל שנה תצטרכו להחליט אם הכותרת היא סימן חשוב או רק רעש.",
  companies: {
    nova: { revenue: "₪500M", profit: "₪-20M", headline: "החברה מגדילה השקעות בפיתוח. המשקיעים חוששים מהרווחיות הנמוכה.", price: 100 },
    prime: { revenue: "₪900M", profit: "₪120M", headline: "Prime ממשיכה להציג יציבות ורווחיות גבוהה.", price: 100 },
    fast: { revenue: "₪700M", profit: "₪90M", headline: "FastWave מכה את התחזיות ומושכת עניין רב.", price: 100 }
  }
};

const YEARS = [
  {
    step: "year1",
    year: 1,
    title: "שנה 1 — הכותרות מתחילות",
    lesson: "FastWave נראית נוצצת, NovaTech עדיין נראית חלשה. אבל שנה אחת לא מספרת את כל הסיפור.",
    companies: {
      nova: { revenue: "₪620M", profit: "₪-10M", headline: "כותרות שליליות: החברה עדיין לא מצליחה להציג רווח משמעותי.", price: 95 },
      prime: { revenue: "₪950M", profit: "₪130M", headline: "החברה מעלה תחזית שנתית ומחלקת דיבידנד.", price: 110 },
      fast: { revenue: "₪880M", profit: "₪130M", headline: "אנליסטים מעלים המלצות בעקבות צמיחה מהירה.", price: 120 }
    }
  },
  {
    step: "year2",
    year: 2,
    title: "שנה 2 — מי באמת מתחזקת?",
    lesson: "FastWave שוב נראית מצוין, אבל מופיע סימן קטן: מתחרים נכנסים לשוק.",
    companies: {
      nova: { revenue: "₪760M", profit: "₪5M", headline: "אנליסטים חלוקים: האם החברה יקרה מדי ביחס לרווחים?", price: 90 },
      prime: { revenue: "₪1.0B", profit: "₪142M", headline: "ביצועים עקביים, אך חלק מהאנליסטים טוענים שהמניה יקרה.", price: 120 },
      fast: { revenue: "₪1.05B", profit: "₪170M", headline: "החברה מציגה שיאים חדשים, אך מתחרים חדשים נכנסים לשוק.", price: 145 }
    }
  },
  {
    step: "year3",
    year: 3,
    title: "שנה 3 — רעש או שינוי אמיתי?",
    lesson: "NovaTech מתחילה להראות סימני שיפור. ב-FastWave כבר רואים שהרווחיות רגישה לתחרות.",
    companies: {
      nova: { revenue: "₪940M", profit: "₪35M", headline: "המוצר החדש מתחיל לצבור לקוחות, אך השוק עדיין סקפטי.", price: 105 },
      prime: { revenue: "₪1.06B", profit: "₪155M", headline: "החברה ממשיכה לצמוח לאט אך בעקביות.", price: 132 },
      fast: { revenue: "₪980M", profit: "₪80M", headline: "סדקים ראשונים: ירידה ברווחיות בעקבות מלחמת מחירים.", price: 90 }
    }
  },
  {
    step: "year4",
    year: 4,
    title: "שנה 4 — הערך מתחיל להיחשף",
    lesson: "כאן מתגלה ההבדל בין עסק עם חפיר לבין חברה שנראתה טוב בעיקר בגלל מומנטום.",
    companies: {
      nova: { revenue: "₪1.3B", profit: "₪140M", headline: "החברה מדווחת על פריצה משמעותית במכירות המוצר החדש.", price: 170 },
      prime: { revenue: "₪1.12B", profit: "₪168M", headline: "ההנהלה שומרת על מדיניות שמרנית ועל רווחיות יציבה.", price: 145 },
      fast: { revenue: "₪760M", profit: "₪-30M", headline: "החברה מאבדת נתח שוק והמנכ״לית פורשת במפתיע.", price: 40 }
    }
  },
  {
    step: "year5",
    year: 5,
    title: "שנה 5 — התמונה המלאה",
    lesson: "בסוף רואים: כותרות יכולות להבהיל או להלהיב, אבל איכות העסק היא מה שקובע לאורך זמן.",
    companies: {
      nova: { revenue: "₪1.8B", profit: "₪310M", headline: "NovaTech הופכת למובילת שוק בתחומה.", price: 250 },
      prime: { revenue: "₪1.2B", profit: "₪182M", headline: "עוד שנה יציבה לחברה הוותיקה.", price: 160 },
      fast: { revenue: "₪620M", profit: "₪-90M", headline: "FastWave מתקשה להתאושש מול תחרות חזקה.", price: 25 }
    }
  }
];

const STEPS = [
  { step: "training", label: "שנת ניסיון" },
  { step: "year1", label: "שנה 1" },
  { step: "year2", label: "שנה 2" },
  { step: "year3", label: "שנה 3" },
  { step: "year4", label: "שנה 4" },
  { step: "year5", label: "שנה 5" }
];

function fmt(n) {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

function stepIndex(step) {
  return STEPS.findIndex(s => s.step === step);
}

function getStepData(step) {
  if (step === "training") return TRAINING_YEAR;
  return YEARS.find(y => y.step === step);
}

function getAdminOpenStep() {
  return localStorage.getItem(ADMIN_OPEN_STEP_KEY) || "training";
}

function setAdminOpenStep(step) {
  localStorage.setItem(ADMIN_OPEN_STEP_KEY, step);
}

async function serverGetTakenTeams() {
  try {
    const res = await fetch(`${API_BASE}/api/teams`);
    return await res.json();
  } catch {
    return {};
  }
}

async function serverClaimTeam(teamId, teamName) {
  try {
    const res = await fetch(`${API_BASE}/api/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, teamName })
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function serverGetOpenStep() {
  try {
    const res = await fetch(`${API_BASE}/api/step`);
    const data = await res.json();
    return typeof data.openStep === "string" ? data.openStep : "training";
  } catch {
    return getAdminOpenStep();
  }
}

async function serverSetOpenStep(step, pass) {
  const res = await fetch(`${API_BASE}/api/step?pass=${encodeURIComponent(pass)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step })
  });
  if (!res.ok) throw new Error("Unauthorized");
  setAdminOpenStep(step);
  return res.json();
}

async function serverGetAllRuns(pass) {
  const res = await fetch(`${API_BASE}/api/runs?pass=${encodeURIComponent(pass)}`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

async function serverGetAllProgress(pass) {
  const res = await fetch(`${API_BASE}/api/progress?pass=${encodeURIComponent(pass)}`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

async function serverClearAll(pass) {
  const res = await fetch(`${API_BASE}/api/runs?pass=${encodeURIComponent(pass)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

function upsertTeamProgress(prog) {
  fetch(`${API_BASE}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prog)
  }).catch(() => {});
}

function saveRun(run) {
  fetch(`${API_BASE}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run)
  }).catch(() => {});
}
