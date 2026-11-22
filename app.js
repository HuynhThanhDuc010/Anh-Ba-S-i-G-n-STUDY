(function () {
  var s = localStorage.getItem("vocabflow_theme");
  var x =
    s ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  document.documentElement.setAttribute("data-theme", x);
})();


const STORAGE_KEY = "vocabflow_sets_v1",
  DAILY_KEY = "anhba_daily_v7",
  SCHEMA = 8,
  DAY = 86400000;
let sets = loadSets(),
  preview = [],
  learnSession = null,
  flashSession = null,
  testSession = null,
  manageId = null,
  historyId = null;
let daily = loadDaily();
const POS = [
  ["verb", "Verb · Động từ"],
  ["noun", "Noun · Danh từ"],
  ["adjective", "Adjective · Tính từ"],
  ["adverb", "Adverb · Trạng từ"],
  ["preposition", "Preposition · Giới từ"],
  ["conjunction", "Conjunction · Liên từ"],
  ["pronoun", "Pronoun · Đại từ"],
  ["phrase", "Phrase · Cụm từ"],
  ["other", "Other · Khác"],
];
const KNOWN = {
  implement: "verb",
  declare: "verb",
  define: "verb",
  access: "verb",
  allocate: "verb",
  debug: "verb",
  install: "verb",
  compile: "verb",
  execute: "verb",
  deploy: "verb",
  optimize: "verb",
  evaluate: "verb",
  import: "verb",
  export: "verb",
  create: "verb",
  delete: "verb",
  update: "verb",
  search: "verb",
  filter: "verb",
  sort: "verb",
  parse: "verb",
  render: "verb",
  fetch: "verb",
  store: "verb",
  process: "verb",
  connect: "verb",
  encrypt: "verb",
  decrypt: "verb",
  validate: "verb",
  algorithm: "noun",
  framework: "noun",
  dependency: "noun",
  variable: "noun",
  function: "noun",
  method: "noun",
  class: "noun",
  object: "noun",
  array: "noun",
  vector: "noun",
  pointer: "noun",
  reference: "noun",
  recursion: "noun",
  database: "noun",
  server: "noun",
  client: "noun",
  network: "noun",
  protocol: "noun",
  interface: "noun",
  compiler: "noun",
  memory: "noun",
  exception: "noun",
  package: "noun",
  module: "noun",
  library: "noun",
  parameter: "noun",
  argument: "noun",
  syntax: "noun",
  queue: "noun",
  stack: "noun",
  graph: "noun",
  node: "noun",
  edge: "noun",
  repository: "noun",
  efficient: "adjective",
  recursive: "adjective",
  dynamic: "adjective",
  static: "adjective",
  secure: "adjective",
  scalable: "adjective",
  reliable: "adjective",
  available: "adjective",
  quickly: "adverb",
  efficiently: "adverb",
  automatically: "adverb",
  dynamically: "adverb",
};
const WORD_CONTEXTS = {
  implement: [
    "The development team plans to _____ the new feature next week.",
    "Engineers must _____ the algorithm before testing the program.",
  ],
  declare: [
    "You must _____ the variable before using it in the program.",
    "Passengers have to _____ certain goods at customs.",
  ],
  define: [
    "The documentation should clearly _____ what each parameter means.",
    "The teacher asked students to _____ the key term in their own words.",
  ],
  access: [
    "Only authorized users can _____ the private database.",
    "Students can _____ the learning materials through the website.",
  ],
  allocate: [
    "The operating system must _____ enough memory for the program.",
    "The manager decided to _____ more resources to the project.",
  ],
  debug: [
    "The developer stayed late to _____ the program before release.",
    "Use the debugger to _____ the code and find the error.",
  ],
  compile: [
    "You must _____ the source code before running the program.",
    "The IDE can _____ the project and report syntax errors.",
  ],
  deploy: [
    "The team will _____ the new version to production tonight.",
    "Developers should test the application before they _____ it.",
  ],
  optimize: [
    "We need to _____ the code to improve performance.",
    "The engineer tried to _____ the query so it would run faster.",
  ],
  algorithm: [
    "The programmer designed an efficient _____ to solve the problem.",
    "This sorting _____ has a time complexity of O(n log n).",
  ],
  framework: [
    "The team chose a modern _____ for building the web application.",
    "This _____ provides reusable tools for application development.",
  ],
  variable: [
    "The program stores the user's age in a _____.",
    "Each _____ has a name and a value.",
  ],
  function: [
    "The programmer wrote a _____ to calculate the total price.",
    "Call this _____ whenever you need to validate the input.",
  ],
  database: [
    "The application stores customer information in a _____.",
    "The server retrieves the requested records from the _____.",
  ],
  server: [
    "The client sends a request to the _____ and waits for a response.",
    "The website became unavailable because the _____ stopped working.",
  ],
  efficient: [
    "We need a more _____ algorithm to process the large dataset.",
    "This solution is simple and _____ enough for the application.",
  ],
};
const CTX = {
  verb: [
    "The team decided to _____ the task before the deadline.",
    "To complete the project, we need to _____ this part carefully.",
    "The developer will _____ the required change in the next version.",
  ],
  noun: [
    "The teacher explained the _____ during today's lesson.",
    "Understanding the _____ is important for completing this task correctly.",
    "The team discussed the _____ before starting the next stage.",
  ],
  adjective: [
    "A good solution should be _____ enough for this situation.",
    "The instructor said that this approach was _____ for the task.",
    "The final result looks _____ after the latest improvement.",
  ],
  adverb: [
    "The student completed the task _____ and then checked the result.",
    "The system processed the request _____ during the demonstration.",
  ],
  phrase: [
    "Complete the instruction by using the phrase: We need to _____ before continuing.",
  ],
  other: [
    "Complete the sentence with the correct vocabulary item: We studied _____ in class.",
  ],
};
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function norm(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fmt(t) {
  return t
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(t))
    : "Chưa có";
}
function posLabel(p) {
  return (POS.find((x) => x[0] === p) || ["", "Other · Khác"])[1];
}
function inferPOS(word, meaning = "") {
  let raw = norm(word),
    w = raw.replace(/[^a-z'-]/g, ""),
    m = norm(meaning);
  if (!w) return "other";
  if (raw.includes(" ")) return "phrase";
  if (KNOWN[w]) return KNOWN[w];
  if (w.endsWith("ly") || /một cách|nhanh chóng|tự động/.test(m))
    return "adverb";
  if (/(able|ible|al|ful|ic|ive|less|ous|ent|ant)$/.test(w)) return "adjective";
  if (
    /(tion|sion|ment|ness|ity|ance|ence|ship|ism|ist|er|or|age|ure)$/.test(w) ||
    /sự |việc |hệ thống|thuật toán|thư viện|biến |hàm |lớp |dữ liệu/.test(m)
  )
    return "noun";
  if (
    /(ize|ise|ify|ate|en)$/.test(w) ||
    /cài đặt|khai báo|định nghĩa|truy cập|cấp phát|gỡ lỗi|tối ưu|tạo|xóa|thêm|sửa|đọc|ghi|lưu|gửi|nhận|kết nối|sắp xếp|tìm kiếm|lọc|kiểm tra|triển khai|thực thi|biên dịch/.test(
      m,
    )
  )
    return "verb";
  return "noun";
}
function upgradeWord(w) {
  let now = Date.now(),
    correct = Math.max(0, Number(w.correct) || 0),
    wrong = Math.max(0, Number(w.wrong) || 0),
    cleanWord = sanitizeWordText(w.word || ""),
    cleanMeaning = String(w.meaning || "").trim(),
    cleanIpa = String(w.ipa || "").trim(),
    mistakeCount = Number.isFinite(Number(w.mistakeCount)) ? Math.max(0, Number(w.mistakeCount)) : wrong,
    mistakeHistory = Array.isArray(w.mistakeHistory)
      ? w.mistakeHistory.slice(-10).filter(x => x && typeof x.result === "string")
      : [],
    mistakeSources = {
      writing: 0,
      test: 0,
      listening: 0,
      flashcard: 0,
      periodic: 0,
      skip: 0,
      ...(w.mistakeSources || {}),
    };
  return {
    ...w,
    word: cleanWord,
    ipa: cleanIpa,
    meaning: cleanMeaning,
    id: w.id || uid(),
    pos: w.pos || inferPOS(cleanWord, cleanMeaning),
    correct,
    wrong,
    mastered: !!w.mastered,
    favorite: !!w.favorite,
    status:
      w.status ||
      (w.mastered
        ? "mastered"
        : wrong > correct && wrong >= 2
          ? "hard"
          : correct + wrong
            ? "learning"
            : "new"),
    srsLevel: Number.isFinite(w.srsLevel) ? w.srsLevel : w.mastered ? 4 : 0,
    dueAt: Number(w.dueAt) || now,
    lastReviewedAt: Number(w.lastReviewedAt) || null,
    streak: Math.max(0, Number(w.streak) || 0),
    example: w.example || "",
    mistakeCount,
    mistakeHistory,
    mistakeSources,
    mistakeRecoveryStreak: Number.isFinite(w.mistakeRecoveryStreak)
      ? w.mistakeRecoveryStreak
      : 0,
    lastMistakeAt: w.lastMistakeAt || null,
    mistakePracticeDueAt: w.mistakePracticeDueAt || 0,
    periodicTestCount: Number.isFinite(w.periodicTestCount) ? w.periodicTestCount : 0,
    periodicWrongCount: Number.isFinite(w.periodicWrongCount) ? w.periodicWrongCount : 0,
    periodicLastTestAt: w.periodicLastTestAt || null,
  };
}
function upgradeSet(s = {}) {
  if (!s || typeof s !== "object") s = {};
  let now = Date.now();
  return {
    ...s,
    id: typeof s.id === "string" && s.id ? s.id : uid(),
    name: typeof s.name === "string" && s.name.trim() ? s.name.trim() : "Bộ từ",
    schemaVersion: SCHEMA,
    createdAt: Number(s.createdAt) || now,
    updatedAt: Number(s.updatedAt) || now,
    lastStudiedAt: Number(s.lastStudiedAt) || null,
    totalAttempts: Math.max(0, Number(s.totalAttempts) || 0),
    // Không cho lịch sử test tăng vô hạn sau nhiều năm sử dụng.
    testHistory: Array.isArray(s.testHistory) ? s.testHistory.slice(0, 100) : [],
    folder: typeof s.folder === "string" && s.folder.trim() ? s.folder.trim() : "Chưa phân loại",
    words: Array.isArray(s.words)
      ? s.words.filter(w => w && typeof w === "object").map(upgradeWord)
      : [],
  };
}

let storageWarningShown = false;
function safeStorageSet(key,value,label="dữ liệu"){
  try{
    localStorage.setItem(key,value);
    return true;
  }catch(err){
    console.error("Storage write failed:",key,err);
    if(!storageWarningShown){
      storageWarningShown=true;
      alert(
        `Không thể lưu ${label}. Bộ nhớ trình duyệt có thể đã gần đầy.\n\n`+
        `Dữ liệu đang mở vẫn còn trong phiên này, nhưng bạn nên Full Backup ngay và không đóng app trước khi sao lưu.`
      );
    }
    return false;
  }
}
function dailyWordCount(d){
  return Array.isArray(d?.wordIds) && d.wordIds.length
    ? d.wordIds.length
    : Math.max(0,Number(d?.wordCount)||0);
}
function dailyNewCount(d){
  return Array.isArray(d?.newIds) && d.newIds.length
    ? d.newIds.length
    : Math.max(0,Number(d?.newCount)||0);
}
function dailyReviewCount(d){
  return Array.isArray(d?.reviewIds) && d.reviewIds.length
    ? d.reviewIds.length
    : Math.max(0,Number(d?.reviewCount)||0);
}
function dailyHasActivity(d){
  return !!(d && (dailyWordCount(d) || Number(d.tests)||0 || d.activity===true));
}
function compactDailyHistory(){
  if(!daily?.days||typeof daily.days!=="object")return;
  let cutoff=Date.now()-180*DAY;
  Object.entries(daily.days).forEach(([key,d])=>{
    if(!d||typeof d!=="object")return;
    let ts=new Date(key+"T12:00:00").getTime();
    if(!Number.isFinite(ts)||ts>=cutoff)return;
    let wc=dailyWordCount(d),nc=dailyNewCount(d),rc=dailyReviewCount(d);
    d.wordCount=wc;
    d.newCount=nc;
    d.reviewCount=rc;
    d.activity=dailyHasActivity(d);
    // Sau 180 ngày không cần giữ hàng trăm ID từng từ để vẽ thống kê.
    d.wordIds=[];
    d.newIds=[];
    d.reviewIds=[];
  });
}
function storageUsageEstimate(){
  try{
    let chars=0;
    for(let i=0;i<localStorage.length;i++){
      let k=localStorage.key(i)||"",v=localStorage.getItem(k)||"";
      chars+=k.length+v.length;
    }
    return chars*2;
  }catch{return 0}
}

function loadSets() {
  try {
    let raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return [];
    let x=JSON.parse(raw) || [];
    let arr=Array.isArray(x) ? x : Array.isArray(x.sets) ? x.sets : [];
    return arr.filter(s=>s&&typeof s==="object").map(upgradeSet);
  } catch (err) {
    console.error("Không đọc được kho từ:",err);
    // Quan trọng: KHÔNG ghi đè storage tại đây. File hỏng vẫn còn để người dùng có cơ hội phục hồi.
    setTimeout(()=>alert("Không đọc được dữ liệu kho từ hiện tại. App sẽ không tự ghi đè dữ liệu này. Hãy dùng Full Restore nếu bạn có bản backup."),0);
    return [];
  }
}
function persist() {
  return safeStorageSet(STORAGE_KEY, JSON.stringify(sets), "kho từ");
}
function dayKey(ts = Date.now()) {
  let d = new Date(ts),
    y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function loadDaily() {
  try {
    let raw=localStorage.getItem(DAILY_KEY);
    if(!raw)return { goals: { newWords: 10, reviews: 20, tests: 1 }, days: {} };
    let x=JSON.parse(raw) || {},
        goals=x.goals&&typeof x.goals==="object"?x.goals:{},
        days=x.days&&typeof x.days==="object"&&!Array.isArray(x.days)?x.days:{};
    return {
      goals: {
        newWords:Math.max(1,Number(goals.newWords)||10),
        reviews:Math.max(1,Number(goals.reviews)||20),
        tests:Math.max(0,Number(goals.tests)||0),
      },
      days,
    };
  } catch (err) {
    console.error("Không đọc được Daily:",err);
    setTimeout(()=>alert("Dữ liệu Daily có dấu hiệu bị hỏng. App sẽ không tự ghi đè file Daily cũ cho đến khi bạn thực hiện hoạt động học mới."),0);
    return { goals: { newWords: 10, reviews: 20, tests: 1 }, days: {} };
  }
}
function saveDaily() {
  compactDailyHistory();
  return safeStorageSet(DAILY_KEY, JSON.stringify(daily), "lịch sử Daily");
}
function ensureDailyDay(key = dayKey()) {
  if (!daily.days[key])
    daily.days[key] = {
      wordIds: [],
      newIds: [],
      reviewIds: [],
      attempts: 0,
      correct: 0,
      tests: 0,
      periodicDue: false,
      periodicCompleted: false,
      periodicScore: null,
    };
  let d = daily.days[key];
  d.wordIds = Array.isArray(d.wordIds) ? d.wordIds : [];
  d.newIds = Array.isArray(d.newIds) ? d.newIds : [];
  d.reviewIds = Array.isArray(d.reviewIds) ? d.reviewIds : [];
  d.attempts = Math.max(0,Number(d.attempts)||0);
  d.correct = Math.max(0,Number(d.correct)||0);
  d.tests = Math.max(0,Number(d.tests)||0);
  d.wordCount = Math.max(Number(d.wordCount)||0,d.wordIds.length);
  d.newCount = Math.max(Number(d.newCount)||0,d.newIds.length);
  d.reviewCount = Math.max(Number(d.reviewCount)||0,d.reviewIds.length);
  d.periodicDue = !!d.periodicDue;
  d.periodicCompleted = !!d.periodicCompleted;
  d.periodicScore = Number.isFinite(d.periodicScore) ? d.periodicScore : null;
  return d;
}
function recordDailyWord(w, wasNew, rating) {
  let d = ensureDailyDay();
  if (w?.id && !d.wordIds.includes(w.id)) d.wordIds.push(w.id);
  if (w?.id && wasNew && !d.newIds.includes(w.id)) d.newIds.push(w.id);
  if (w?.id && !wasNew && !d.reviewIds.includes(w.id)) d.reviewIds.push(w.id);
  d.wordCount=Math.max(d.wordCount||0,d.wordIds.length);
  d.newCount=Math.max(d.newCount||0,d.newIds.length);
  d.reviewCount=Math.max(d.reviewCount||0,d.reviewIds.length);
  d.activity=true;
  d.attempts++;
  if (rating !== "again") d.correct++;
  saveDaily();
}
function recordDailyTest() {
  let d = ensureDailyDay();
  d.tests++;
  saveDaily();
}
function activityForDate(key) {
  return daily.days?.[key] || null;
}
function dateKeysLast(n) {
  let a = [];
  let now = new Date();
  now.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    let d = new Date(now);
    d.setDate(now.getDate() - i);
    a.push(dayKey(d.getTime()));
  }
  return a;
}
function calcStreak() {
  let today = new Date();
  today.setHours(12, 0, 0, 0);
  let cursor = new Date(today),
    todayData = daily.days[dayKey(cursor.getTime())],
    activeToday = dailyHasActivity(todayData);
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 500; i++) {
    let k = dayKey(cursor.getTime()),
      d = daily.days[k];
    if (dailyHasActivity(d)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}
function dailyAccuracy(d) {
  return d.attempts ? Math.round((d.correct / d.attempts) * 100) : 0;
}
function pct(a, b) {
  return b ? Math.min(100, Math.round((a / b) * 100)) : 100;
}
function saveDailyGoals() {
  daily.goals.newWords = Math.max(
    1,
    +document.getElementById("goalNew").value || 10,
  );
  daily.goals.reviews = Math.max(
    1,
    +document.getElementById("goalReview").value || 20,
  );
  daily.goals.tests = Math.max(
    0,
    +document.getElementById("goalTest").value || 0,
  );
  saveDaily();
  renderDailyDashboard();
}
function renderSpark(id, n) {
  let keys = dateKeysLast(n),
    vals = keys.map((k) => dailyWordCount(daily.days[k])),
    max = Math.max(1, ...vals);
  let el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = keys
    .map((k, i) => {
      let v = vals[i],
        h = Math.max(v ? 7 : 2, Math.round((v / max) * 100));
      return `<div class="barwrap" title="${k}: ${v} từ"><div class="bar" style="height:${h}%"></div></div>`;
    })
    .join("");
  let total = vals.reduce((a, b) => a + b, 0),
    active = vals.filter(Boolean).length,
    avg = active ? Math.round(total / active) : 0;
  let sum = document.getElementById(id === "chart7" ? "sum7" : "sum30"),
    summary = document.getElementById(
      id === "chart7" ? "chart7Summary" : "chart30Summary",
    );
  if (sum) sum.textContent = `${total} lượt từ`;
  if (summary)
    summary.innerHTML = `<span>📅 ${active}/${n} ngày có học</span><span>📚 TB ${avg} từ/ngày học</span>`;
}
function renderDailyDashboard() {
  let d = ensureDailyDay(),
    g = daily.goals,
    streak = calcStreak();
  let newDone = d.newIds.length,
    reviewDone = d.reviewIds.length,
    testDone = d.tests;
  let availableNew = allWords().filter(
    (w) => !w.lastReviewedAt || w.status === "new",
  ).length;
  let due = dueWords().length,
    hard = allWords()
      .filter((w) => w.status === "hard")
      .sort((a, b) => b.wrong - a.wrong);
  let completed =
    newDone >= g.newWords && reviewDone >= g.reviews && testDone >= g.tests;
  let overview = document.getElementById("dailyOverview");
  if (overview)
    overview.innerHTML = `
  <div class="card daily-card ${newDone >= g.newWords ? "today-complete" : ""}"><div class="daily-icon">🌱</div><div class="daily-value">${newDone}/${g.newWords}</div><div class="daily-label">Từ mới hôm nay · còn ${availableNew} từ mới trong kho</div></div>
  <div class="card daily-card ${reviewDone >= g.reviews ? "today-complete" : ""}"><div class="daily-icon">🧠</div><div class="daily-value">${reviewDone}/${g.reviews}</div><div class="daily-label">Từ đã ôn hôm nay · ${due} từ đang đến hạn</div></div>
  <div class="card daily-card"><div class="daily-icon">🔥</div><div class="daily-value">${streak}</div><div class="daily-label">Ngày streak liên tiếp</div></div>
  <div class="card daily-card ${completed ? "today-complete" : ""}"><div class="daily-icon">${completed ? "✅" : "🎯"}</div><div class="daily-value">${dailyAccuracy(d)}%</div><div class="daily-label">${completed ? "Đã hoàn thành mục tiêu hôm nay" : "Độ chính xác hôm nay"} · ${testDone}/${g.tests} bài test</div></div>`;
  let badge = document.getElementById("streakBadge");
  if (badge) badge.textContent = `${streak} ngày`;
  let label = document.getElementById("todayLabel");
  if (label)
    label.textContent = new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date());
  let plan = document.getElementById("dailyPlan");
  if (plan)
    plan.innerHTML = `
  <div class="daily-task"><div class="daily-task-head"><div class="daily-task-title">🌱 Học từ mới</div><div class="daily-task-count">${newDone}/${g.newWords}</div></div><div class="mini-progress"><div style="width:${pct(newDone, g.newWords)}%"></div></div><div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn sec" onclick="startDailyNew()">Học từ mới</button></div></div>
  <div class="daily-task"><div class="daily-task-head"><div class="daily-task-title">🧠 Ôn từ đến hạn</div><div class="daily-task-count">${reviewDone}/${g.reviews} · hiện ${due} đến hạn</div></div><div class="mini-progress"><div style="width:${pct(reviewDone, g.reviews)}%"></div></div><div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn sec" onclick="startDueReview()">Ôn SRS</button></div></div>
  <div class="daily-task"><div class="daily-task-head"><div class="daily-task-title">🔥 Từ hay sai</div><div class="daily-task-count">${hard.length} từ khó</div></div>${
    hard.length
      ? `<div class="hard-list">${hard
          .slice(0, 6)
          .map(
            (w) =>
              `<span class="hard-chip">${esc(w.word)} · sai ${w.wrong}</span>`,
          )
          .join("")}</div>`
      : '<div class="small">Chưa có từ nào bị đánh dấu khó.</div>'
  }<div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn ghost" onclick="startHardReview()" ${hard.length ? "" : "disabled"}>Ôn từ hay sai</button></div></div>
  <div class="daily-task"><div class="daily-task-head"><div class="daily-task-title">📝 Bài kiểm tra</div><div class="daily-task-count">${testDone}/${g.tests}</div></div><div class="mini-progress"><div style="width:${pct(testDone, g.tests)}%"></div></div><div class="small" style="margin-top:8px">Chọn một bộ trong Kho bộ đề để làm test 10–50 câu.</div><div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn ghost" onclick="showScreen('library')">Chọn bộ kiểm tra</button></div></div>`;
  let gn = document.getElementById("goalNew"),
    gr = document.getElementById("goalReview"),
    gt = document.getElementById("goalTest");
  if (gn) gn.value = g.newWords;
  if (gr) gr.value = g.reviews;
  if (gt) gt.value = g.tests;
  renderSpark("chart7", 7);
  renderSpark("chart30", 30);
  renderHeatmap();
  renderProductDashboard();
}
function startDailyNew() {
  let choices = sets
    .map((s) => ({
      s,
      ws: s.words.filter((w) => !w.lastReviewedAt || w.status === "new"),
    }))
    .filter((x) => x.ws.length)
    .sort((a, b) => b.ws.length - a.ws.length);
  if (!choices.length) {
    alert("Bạn không còn từ mới trong kho. Hãy tạo thêm bộ từ mới nhé.");
    return;
  }
  let { s, ws } = choices[0],
    mode = localStorage.getItem("vocabflow_learn_mode") || "vi-en";
  ensureWritingProgress(s);
  s.lastStudiedAt = Date.now();
  persist();
  learnSession = {
    setId: s.id,
    queue: ws.slice(0, 5),
    idx: 0,
    wrongQueue: [],
    answered: 0,
    dueOnly: false,
    mode,
    dailySpecial: "new",
  };
  document.getElementById("learnTitle").textContent =
    s.name + " · Từ mới hôm nay";
  showScreen("learn");
  renderLearn();
}
function weakWordsForSet(s, mode = "both") {
  if (!s) return [];
  let words = s.words.filter((w) => {
    let isWrong = (w.wrong || 0) > 0;
    let isHard = w.status === "hard";
    return mode === "wrong"
      ? isWrong
      : mode === "hard"
        ? isHard
        : isWrong || isHard;
  });
  return words.sort((a, b) => {
    let ah = a.status === "hard" ? 1 : 0,
      bh = b.status === "hard" ? 1 : 0;
    return bh - ah || (b.wrong || 0) - (a.wrong || 0);
  });
}
function populateWeakSetSelect(preferId = "") {
  let el = document.getElementById("weakSetSelect");
  if (!el) return;
  let eligible = sets.filter((s) => weakWordsForSet(s, "both").length);
  el.innerHTML = eligible.length
    ? eligible
        .map(
          (s) =>
            `<option value="${s.id}">${esc(s.name)} · ${weakWordsForSet(s, "both").length} từ Sai/Khó</option>`,
        )
        .join("")
    : '<option value="">Chưa có bộ nào có từ Sai/Khó</option>';
  if (preferId && eligible.some((s) => s.id === preferId)) el.value = preferId;
}
function renderWeakReviewPreview() {
  let sel = document.getElementById("weakSetSelect"),
    mode = document.getElementById("weakModeSelect")?.value || "both";
  if (!sel) return;
  let s = sets.find((x) => x.id === sel.value),
    stats = document.getElementById("weakPreviewStats"),
    wordsEl = document.getElementById("weakPreviewWords");
  if (!s) {
    if (stats)
      stats.innerHTML =
        '<div class="empty" style="grid-column:1/-1">Chưa có từ Sai/Khó để ôn.</div>';
    if (wordsEl) wordsEl.innerHTML = "";
    return;
  }
  let wrong = s.words.filter((w) => (w.wrong || 0) > 0),
    hard = s.words.filter((w) => w.status === "hard"),
    pool = weakWordsForSet(s, mode);
  document.getElementById("weakPreviewTitle").textContent = s.name;
  document.getElementById("weakPreviewCount").textContent =
    `${pool.length} từ phù hợp`;
  stats.innerHTML = `<div class="weak-stat"><b style="color:#ff8383">${wrong.length}</b><span class="small">Từng trả lời sai</span></div><div class="weak-stat"><b style="color:#ffad4d">${hard.length}</b><span class="small">Đang ở trạng thái Khó</span></div><div class="weak-stat"><b style="color:#69a5ff">${pool.length}</b><span class="small">Sẽ dùng để ôn</span></div>`;
  wordsEl.innerHTML = pool.length
    ? pool
        .slice(0, 18)
        .map(
          (w) =>
            `<span class="weak-chip ${w.status === "hard" ? "hard" : "wrong"}">${esc(w.word)} · sai ${w.wrong || 0}${w.status === "hard" ? " · Khó" : ""}</span>`,
        )
        .join("")
    : '<span class="small">Không có từ phù hợp với lựa chọn này.</span>';
}
function startSelectedWeakReview() {
  let id = document.getElementById("weakSetSelect")?.value,
    mode = document.getElementById("weakModeSelect")?.value || "both",
    count = +(document.getElementById("weakCountSelect")?.value || 5);
  let s = sets.find((x) => x.id === id);
  if (!s) return alert("Hãy chọn một bộ đề.");
  let pool = weakWordsForSet(s, mode);
  if (!pool.length)
    return alert("Bộ đề này không có từ phù hợp với nhóm bạn chọn.");
  let learnMode = localStorage.getItem("vocabflow_learn_mode") || "vi-en";
  let queue = count >= 9999 ? pool : pool.slice(0, count);
  learnSession = {
    setId: s.id,
    queue,
    idx: 0,
    wrongQueue: [],
    answered: 0,
    dueOnly: true,
    mode: learnMode,
    dailySpecial: "weak",
    weakType: mode,
  };
  s.lastStudiedAt = Date.now();
  persist();
  let label =
    mode === "wrong" ? "Từ sai" : mode === "hard" ? "Từ khó" : "Từ sai & khó";
  document.getElementById("learnTitle").textContent = `${s.name} · Ôn ${label}`;
  showScreen("learn");
  renderLearn();
}
function startHardReview(setId = "") {
  showScreen("review");
  setTimeout(() => {
    populateWeakSetSelect(setId);
    if (document.getElementById("weakModeSelect"))
      document.getElementById("weakModeSelect").value = "both";
    renderWeakReviewPreview();
    document
      .getElementById("weakSetSelect")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 0);
}


const FREQUENT_MISTAKE_THRESHOLD = 3;
const FREQUENT_MISTAKE_RECOVERY = 5;

function normalizeMistakeMeta(w){
  if(!w)return;
  if(!Number.isFinite(w.mistakeCount))w.mistakeCount=w.wrong||0;
  if(!Array.isArray(w.mistakeHistory))w.mistakeHistory=[];
  if(!w.mistakeSources||typeof w.mistakeSources!=="object")w.mistakeSources={};
  ["writing","test","listening","flashcard","periodic","skip"].forEach(k=>{
    if(!Number.isFinite(w.mistakeSources[k]))w.mistakeSources[k]=0;
  });
  if(!Number.isFinite(w.mistakeRecoveryStreak))w.mistakeRecoveryStreak=0;
}
function recordWordLearningOutcome(w,result,source="writing"){
  if(!w)return;
  normalizeMistakeMeta(w);
  let now=Date.now();
  let isMistake=result==="wrong"||result==="skip";

  w.mistakeHistory.push({result:isMistake?result:"correct",source,at:now});
  w.mistakeHistory=w.mistakeHistory.slice(-10);

  if(isMistake){
    w.mistakeCount++;
    w.lastMistakeAt=now;
    w.mistakeRecoveryStreak=0;
    w.mistakePracticeDueAt=now;
    let key=result==="skip"?"skip":source;
    if(!Number.isFinite(w.mistakeSources[key]))w.mistakeSources[key]=0;
    w.mistakeSources[key]++;
  }else{
    w.mistakeRecoveryStreak++;
    // Sau khi trả lời đúng, Smart Daily chờ ít nhất 1 ngày trước khi
    // ưu tiên lại từ Hay Sai này. Ôn theo Folder vẫn có thể gọi bất cứ lúc nào.
    w.mistakePracticeDueAt=now+DAY;
  }
}
function recentMistakeCount(w){
  normalizeMistakeMeta(w);
  return w.mistakeHistory.filter(x=>x.result==="wrong"||x.result==="skip").length;
}
function isFrequentMistake(w){
  normalizeMistakeMeta(w);
  let recent=recentMistakeCount(w);
  // Sau 5 lần đúng liên tiếp, lỗi cũ sẽ dần được hạ ưu tiên khi ra khỏi 10 lượt gần nhất.
  return recent>=FREQUENT_MISTAKE_THRESHOLD ||
    (w.mistakeCount>=FREQUENT_MISTAKE_THRESHOLD &&
      w.mistakeRecoveryStreak<FREQUENT_MISTAKE_RECOVERY);
}
function frequentMistakeScore(w){
  normalizeMistakeMeta(w);
  return recentMistakeCount(w)*100 +
    (w.mistakeCount||0)*10 +
    (w.status==="hard"?5:0) +
    Math.min(4,Math.floor((w.lastMistakeAt||0)/1e13));
}
function frequentMistakeWordsForSet(s){
  return (s?.words||[])
    .filter(isFrequentMistake)
    .sort((a,b)=>
      recentMistakeCount(b)-recentMistakeCount(a) ||
      (b.mistakeCount||0)-(a.mistakeCount||0) ||
      (b.lastMistakeAt||0)-(a.lastMistakeAt||0)
    );
}
function frequentMistakeWordsInFolder(folder){
  let out=[];
  sets.forEach(s=>{
    if((s.folder||"Chưa phân loại")!==folder)return;
    frequentMistakeWordsForSet(s).forEach(w=>out.push({s,w}));
  });
  return out.sort((a,b)=>
    recentMistakeCount(b.w)-recentMistakeCount(a.w) ||
    (b.w.mistakeCount||0)-(a.w.mistakeCount||0) ||
    (b.w.lastMistakeAt||0)-(a.w.lastMistakeAt||0)
  );
}
function frequentMistakeFolders(){
  return folderNames()
    .filter(f=>f!=="Tất cả"&&frequentMistakeWordsInFolder(f).length);
}
function mistakeSourceSummary(w){
  normalizeMistakeMeta(w);
  let labels={writing:"Luyện viết",test:"Test",listening:"Nghe",flashcard:"Flashcard",periodic:"Kiểm tra định kỳ",skip:"Bỏ qua"};
  return Object.entries(w.mistakeSources)
    .filter(([,n])=>n>0)
    .map(([k,n])=>`${labels[k]||k}: ${n}`)
    .join(" · ");
}

function dueWords(set = null) {
  let now = Date.now(),
    ws = set ? set.words : sets.flatMap((s) => s.words);

  // "Cần ôn SRS" chỉ gồm từ ĐÃ HỌC và thật sự đến hạn.
  // Từ mới có dueAt mặc định = thời điểm tạo nên trước đây bị đếm nhầm là SRS.
  return ws.filter((w) =>
    !!w.lastReviewedAt &&
    w.status !== "new" &&
    (w.dueAt || 0) <= now
  );
}
function allWords() {
  return sets.flatMap((s) => s.words);
}
function reviewWord(w, rating) {
  let now = Date.now(),
    wasNew = !w.lastReviewedAt || w.status === "new";
  w.lastReviewedAt = now;
  if (rating === "again") {
    w.wrong++;
    w.srsLevel = 0;
    w.streak = 0;
    w.status = "hard";
    w.mastered = false;
    w.dueAt = now + 10 * 60 * 1000;
  } else if (rating === "hard") {
    w.correct++;
    w.srsLevel = Math.max(1, w.srsLevel);
    w.streak++;
    w.status = "learning";
    w.dueAt = now + DAY;
  } else if (rating === "good") {
    w.correct++;
    w.srsLevel = Math.min(6, (w.srsLevel || 0) + 1);
    w.streak++;
    w.status = w.srsLevel >= 4 ? "mastered" : "learning";
    w.mastered = w.srsLevel >= 4;
    let d = [1, 2, 4, 7, 14, 30, 60][w.srsLevel] || 60;
    w.dueAt = now + d * DAY;
  } else {
    w.correct++;
    w.srsLevel = Math.min(7, (w.srsLevel || 0) + 2);
    w.streak++;
    w.status = w.srsLevel >= 4 ? "mastered" : "learning";
    w.mastered = w.srsLevel >= 4;
    let d = [2, 4, 7, 14, 30, 60, 90, 120][w.srsLevel] || 120;
    w.dueAt = now + d * DAY;
  }
  recordDailyWord(w, wasNew, rating);
}

function fillPracticeSetSelect() {
  let el = document.getElementById("practiceSetSelect");
  if (!el) return;
  let old = el.value;
  el.innerHTML = sets.length
    ? sets
        .map(
          (s) =>
            `<option value="${s.id}">${esc(s.name)} · ${s.words.length} từ</option>`,
        )
        .join("")
    : '<option value="">Chưa có bộ từ</option>';
  if (old && sets.some((s) => s.id === old)) el.value = old;
}
function openPracticeChooser() {
  showScreen("library");
  setTimeout(() => {
    fillPracticeSetSelect();
    let box = document.getElementById("practiceChooser");
    if (box) {
      box.style.display = "block";
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 0);
}
function startChosenPractice(mode) {
  let sel = document.getElementById("practiceSetSelect");
  if (!sel || !sel.value) {
    openPracticeChooser();
    return;
  }
  let id = sel.value,
    s = sets.find((x) => x.id === id);
  if (!s) return alert("Hãy chọn một bộ đề để luyện.");
  if (mode === "write") startLearn(id);
  else if (mode === "flash") startFlash(id);
  else if (mode === "test") openTest(id);
  else if (mode === "listening") {
    showScreen("listening");
    setTimeout(() => {
      let ls = document.getElementById("listenSet");
      if (ls) {
        ls.value = id;
        startListening();
      }
    }, 0);
  }
}
function toggleSideGroup(subId, parentId, keepOpen = false) {
  let sub = document.getElementById(subId),
    parent = document.getElementById(parentId);
  if (!sub || !parent) return;
  let willOpen = keepOpen ? true : !sub.classList.contains("open");
  sub.classList.toggle("open", willOpen);
  parent.classList.toggle("open", willOpen);
  safeStorageSet("anhba_sidebar_" + subId, willOpen ? "1" : "0","trạng thái menu");
}
function restoreSidebarGroups() {
  [
    ["dailySub", "dailyParent"],
    ["practiceSub", "practiceParent"],
    ["librarySub", "libraryParent"],
  ].forEach(([id, parent]) => {
    let open = localStorage.getItem("anhba_sidebar_" + id) === "1";
    document.getElementById(id)?.classList.toggle("open", open);
    document.getElementById(parent)?.classList.toggle("open", open);
  });
}
function runAppMotion(id){
 const s=document.getElementById(id);if(!s)return;
 s.classList.remove('ab-page-in','ab-home-in');void s.offsetWidth;
 s.classList.add('ab-page-in');
 if(id==='home'){s.classList.add('ab-home-in');setTimeout(()=>s.classList.remove('ab-home-in'),950)}
 setTimeout(()=>s.classList.remove('ab-page-in'),520);
}

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((x) => x.classList.toggle("active", x.id === id));
  document
    .querySelectorAll(".nav")
    .forEach((x) => x.classList.toggle("active", x.dataset.screen === id));
  if (id === "home") renderHome();
  if (id === "library") renderLibrary();
  if (id === "review") renderReview();
  if (id === "listening") renderListeningSetup();
  if (id === "stats") renderStats();
  scrollTo({ top: 0, behavior: "smooth" });

  requestAnimationFrame(()=>runAppMotion(id));
}
document.querySelectorAll(".nav").forEach((b) => {
  if (!b.classList.contains("nav-parent"))
    b.onclick = () => showScreen(b.dataset.screen);
});
function stripLeadingNumber(line) {
  let s = String(line || "")
    .replace(/\u00a0/g, " ")
    .trim();

  // Tự loại STT phổ biến: 1. / 1) / (1) / 1: / 1- / 1 – / 1 — / 1、 / 1．
  // Không đụng vào từ thật bắt đầu bằng số nếu không có dấu phân cách, ví dụ 3D.
  s = s.replace(
    /^\s*(?:\(\s*\d{1,5}\s*\)|\d{1,5})\s*(?:[.．。)、:：;\-–—|/]\s*|\s{1,})/,
    "",
  );

  // Loại bullet do copy từ Word/PDF.
  s = s.replace(/^\s*[•·●▪◦]\s*/, "");

  return s.trim();
}

function sanitizeWordText(word) {
  let s = stripLeadingNumber(word);
  // Loại dấu phân cách còn sót ở đầu/cuối nhưng giữ dấu - bên trong từ.
  s = s.replace(/^[\s:：|;–—]+/, "").replace(/[\s:：|;–—]+$/, "");
  return s.replace(/\s+/g, " ").trim();
}

function cleanMeaningLine(s) {
  return stripLeadingNumber(String(s || "").trim())
    .replace(/^[:\-–—|;•·]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}
function cleanWordPart(s) {
  return sanitizeWordText(
    String(s || "")
      .trim()
      .replace(/^(?:[•·●▪◦]|[-–—](?=\s))\s*/, "")
      .replace(/[\s:：|;,\-–—]+$/, ""),
  );
}
function looksVietnamese(s) {
  s = String(s || "").toLowerCase();
  return (
    /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i.test(
      s,
    ) ||
    /\b(là|và|của|cho|trong|một|các|sự|việc|người|được|để|với|hoặc|từ|nghĩa|truy cập|thuật toán|khai báo|định nghĩa|cài đặt)\b/i.test(
      s,
    )
  );
}
function looksLikeEnglishWordLine(s) {
  let x = stripLeadingNumber(String(s || "").trim());
  if (!x) return false;
  if (/\/[^/]+\//.test(x)) return true;
  if (looksVietnamese(x)) return false;
  return /^[A-Za-z][A-Za-z0-9'’\- ]{0,80}[:\-–—]?$/.test(x);
}
function extractInlineParts(line) {
  let x = stripLeadingNumber(String(line || "").trim()),
    word = "",
    ipa = "",
    meaning = "";
  let im = x.match(/\/[^/]+\//);
  if (im) {
    ipa = im[0];
    word = cleanWordPart(x.slice(0, im.index));
    meaning = cleanMeaningLine(x.slice(im.index + im[0].length));
    return { word, ipa, meaning };
  }
  let sep = x.includes("|")
    ? "|"
    : x.includes("\t")
      ? "\t"
      : x.includes(";")
        ? ";"
        : null;
  if (sep) {
    let p = x
      .split(sep)
      .map((v) => v.trim())
      .filter(Boolean);
    if (p.length >= 3)
      return {
        word: cleanWordPart(p[0]),
        ipa: p[1],
        meaning: cleanMeaningLine(p.slice(2).join(" - ")),
      };
  }
  let dash = x
    .split(/\s+[-–—]\s+/)
    .map((v) => v.trim())
    .filter(Boolean);
  if (dash.length >= 3)
    return {
      word: cleanWordPart(dash[0]),
      ipa: dash[1],
      meaning: cleanMeaningLine(dash.slice(2).join(" - ")),
    };
  return { word: "", ipa: "", meaning: "" };
}
function parseVocabulary(raw) {
  let words = [],
    errors = [];

  let lines = String(raw || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  function pushWord(word, ipa, meaning) {
    word = sanitizeWordText(word);
    ipa = String(ipa || "").trim();
    meaning = cleanMeaningLine(meaning);
    if (!word || !ipa || !meaning) return false;

    words.push(
      upgradeWord({
        word,
        ipa,
        meaning,
        pos: inferPOS(word, meaning),
      }),
    );
    return true;
  }

  for (let i = 0; i < lines.length; i++) {
    let original = lines[i];
    let line = stripLeadingNumber(original);

    // A. Dòng có IPA: English /IPA/ Nghĩa
    // Hỗ trợ cả -, :, |, ; hoặc không có dấu phân cách.
    let ipaMatch = line.match(/\/[^/\n]+\/|\/[^/\n]+\/(?:\s*\([^)]+\))?/);
    if (ipaMatch) {
      let before = line.slice(0, ipaMatch.index);
      let after = line.slice(ipaMatch.index + ipaMatch[0].length);

      let word = cleanWordPart(before);
      let ipa = ipaMatch[0].trim();
      let meaning = cleanMeaningLine(after);

      // Nếu nghĩa không nằm cùng dòng, lấy dòng kế tiếp miễn nó không phải mục mới có IPA.
      if (!meaning) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length && !/\/[^/\n]+\//.test(lines[j])) {
          meaning = cleanMeaningLine(lines[j]);
          if (meaning) i = j;
        }
      }

      if (pushWord(word, ipa, meaning)) continue;
    }

    // B. 3 dòng:
    // 1. Apple
    // /ˈæp.əl/
    // Táo
    let candidateWord = cleanWordPart(line);
    if (candidateWord && i + 1 < lines.length) {
      let next = stripLeadingNumber(lines[i + 1]);
      let nextIpa = next.match(/\/[^/\n]+\//);
      if (nextIpa) {
        let ipa = nextIpa[0];
        let afterIpa = cleanMeaningLine(
          next.slice(nextIpa.index + nextIpa[0].length),
        );
        let meaning = afterIpa;

        if (!meaning && i + 2 < lines.length) {
          let maybeMeaning = lines[i + 2];
          if (!/\/[^/\n]+\//.test(maybeMeaning)) {
            meaning = cleanMeaningLine(maybeMeaning);
            if (pushWord(candidateWord, ipa, meaning)) {
              i += 2;
              continue;
            }
          }
        }

        if (meaning && pushWord(candidateWord, ipa, meaning)) {
          i += 1;
          continue;
        }
      }
    }

    // C. Dạng cột: English | IPA | Nghĩa ; hoặc tab.
    let sepParts = line.includes("|")
      ? line.split("|")
      : line.includes("\t")
        ? line.split("\t")
        : line.includes(";")
          ? line.split(";")
          : null;

    if (sepParts) {
      let p = sepParts.map((x) => x.trim()).filter(Boolean);
      if (p.length >= 3 && pushWord(p[0], p[1], p.slice(2).join(" - "))) {
        continue;
      }
    }

    errors.push(i + 1);
  }

  // Loại từ trùng sau khi đã làm sạch STT.
  let seen = new Set();
  words = words.filter((w) => {
    let key = norm(w.word) + "|" + norm(w.meaning);
    if (!w.word || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { words, errors };
}
function previewVocabulary() {
  let r = parseVocabulary(document.getElementById("rawVocabulary").value);
  preview = r.words;
  document.getElementById("previewCount").textContent = `${r.words.length} từ`;
  document.getElementById("parseMsg").innerHTML =
    (r.words.length
      ? `<div class="alert okay">Đã nhận diện ${r.words.length} từ.</div>`
      : "") +
    (r.errors.length
      ? `<div class="alert err">Không đọc được dòng: ${r.errors.slice(0, 8).join(", ")}</div>`
      : "");
  let a = document.getElementById("previewArea");
  if (!r.words.length) {
    a.className = "empty";
    a.innerHTML = '<div class="emo">⚠️</div>Chưa có từ hợp lệ.';
    return;
  }
  a.className = "tablewrap";
  a.innerHTML = `<table class="table"><thead><tr><th>#</th><th>English</th><th>IPA</th><th>Nghĩa</th><th>Loại từ</th></tr></thead><tbody>${r.words.map((w, i) => `<tr><td>${i + 1}</td><td><b>${esc(w.word)}</b></td><td>${esc(w.ipa)}</td><td>${esc(w.meaning)}</td><td><select onchange="preview[${i}].pos=this.value">${POS.map(([v, l]) => `<option value="${v}" ${w.pos === v ? "selected" : ""}>${l}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table>`;
}
function saveSet() {
  let name = document.getElementById("setName").value.trim(),
    raw = document.getElementById("rawVocabulary").value,
    r = parseVocabulary(raw);
  if (!name) return alert("Hãy nhập tên bộ từ.");
  if (!r.words.length) return alert("Không có từ hợp lệ.");
  let words = r.words.map((w, i) => ({
    ...w,
    pos: preview[i]?.word === w.word ? preview[i].pos : w.pos,
  }));
  let now = Date.now();
  sets.unshift(
    upgradeSet({ id: uid(), name, createdAt: now, updatedAt: now, words }),
  );
  persist();
  document.getElementById("setName").value = "";
  document.getElementById("rawVocabulary").value = "";
  preview = [];
  showScreen("home");
}
function fillDemo() {
  document.getElementById("setName").value = "English IT - Demo";
  document.getElementById("rawVocabulary").value =
    `implement - /ˈɪmplɪment/ - cài đặt, hiện thực\ndeclare - /dɪˈkleə(r)/ - khai báo\ndefine - /dɪˈfaɪn/ - định nghĩa\naccess - /ˈækses/ - truy cập\nallocate - /ˈæləkeɪt/ - cấp phát\ndebug - /ˌdiːˈbʌɡ/ - gỡ lỗi\nalgorithm - /ˈælɡərɪðəm/ - thuật toán\nframework - /ˈfreɪmwɜːk/ - khung phát triển\nefficient - /ɪˈfɪʃənt/ - hiệu quả\ndatabase - /ˈdeɪtəbeɪs/ - cơ sở dữ liệu`;
  previewVocabulary();
}
function aggregate() {
  let ws = allWords(),
    c = ws.reduce((a, w) => a + w.correct, 0),
    wr = ws.reduce((a, w) => a + w.wrong, 0),
    m = ws.filter((w) => w.mastered).length,
    h = ws.filter((w) => w.status === "hard").length;
  return {
    total: ws.length,
    c,
    wr,
    m,
    h,
    due: dueWords().length,
    acc: c + wr ? Math.round((c / (c + wr)) * 100) : 0,
  };
}


function accurateLearningStats() {
  let ws=allWords(),
      total=ws.length,
      learned=ws.filter(w=>!!w.lastReviewedAt || (w.correct||0)+(w.wrong||0)>0).length,
      mastered=ws.filter(w=>
        (!!w.lastReviewedAt || (w.correct||0)+(w.wrong||0)>0) &&
        ((w.srsLevel||0)>=4 || w.mastered===true)
      ).length,
      due=ws.filter(w=>!!w.lastReviewedAt && w.status!=="new" && (w.dueAt||0)<=Date.now()).length,
      frequent=ws.filter(isFrequentMistake).length,
      hard=ws.filter(w=>!!w.lastReviewedAt && w.status==="hard").length,
      fresh=ws.filter(w=>!w.lastReviewedAt || w.status==="new").length,
      correct=ws.reduce((n,w)=>n+(w.correct||0),0),
      wrong=ws.reduce((n,w)=>n+(w.wrong||0),0),
      attempts=correct+wrong,
      accuracy=attempts?Math.round(correct/attempts*100):0,
      normalTests=sets.reduce((n,s)=>n+(Array.isArray(s.testHistory)?s.testHistory.length:0),0),
      periodicTests=(loadPeriodicReview().history||[]).length,
      activeDays=activeStudyDayKeys().length;

  return {
    total,learned,mastered,due,frequent,hard,fresh,
    correct,wrong,attempts,accuracy,
    normalTests,periodicTests,totalTests:normalTests+periodicTests,
    activeDays,
    learnedPct:total?Math.round(learned/total*100):0,
    masteredPct:learned?Math.round(mastered/learned*100):0,
  };
}

function toggleGoalEditor() {
  let e = document.getElementById("goalEditor");
  if (e) e.style.display = e.style.display === "none" ? "block" : "none";
}
function greetingText() {
  let h = new Date().getHours();
  return h < 11
    ? "Chào buổi sáng! ☀️"
    : h < 14
      ? "Chào buổi trưa! 👋"
      : h < 18
        ? "Chào buổi chiều! 🌤️"
        : "Chào buổi tối! 👋";
}

/* ================= Periodic Review · every 3 active study days ================= */
const PERIODIC_REVIEW_KEY = "anhba_periodic_review_v1";
const PERIODIC_REVIEW_CYCLE = 3;
const PERIODIC_REVIEW_COUNT = 40;
const PERIODIC_REVIEW_PASS = 50;

function activeStudyDayKeys(){
  return Object.keys(daily.days||{})
    .filter(k=>{
      let d=daily.days[k];
      return dailyHasActivity(d);
    })
    .sort();
}
function loadPeriodicReview(){
  let activeCount=activeStudyDayKeys().length,
      raw=null;
  try{
    raw=localStorage.getItem(PERIODIC_REVIEW_KEY);
    if(raw){
      let x=JSON.parse(raw);
      if(x&&typeof x==="object"){
        return {
          baselineActiveCount:
            x.baselineActiveCount !== null && x.baselineActiveCount !== undefined &&
            Number.isFinite(Number(x.baselineActiveCount))
              ? Number(x.baselineActiveCount) : activeCount,
          lastCompletedActiveCount:
            x.lastCompletedActiveCount !== null && x.lastCompletedActiveCount !== undefined &&
            Number.isFinite(Number(x.lastCompletedActiveCount))
              ? Number(x.lastCompletedActiveCount) : null,
          pending:!!x.pending,
          dueDayKey:typeof x.dueDayKey==="string"?x.dueDayKey:"",
          history:Array.isArray(x.history)?x.history.slice(-50):[],
        };
      }
    }
  }catch(err){
    console.error("Không đọc được trạng thái kiểm tra định kỳ:",err);
    // Nếu dữ liệu cũ bị hỏng, không tự ghi đè nó chỉ vì app vừa mở.
    return {
      baselineActiveCount:activeCount,lastCompletedActiveCount:null,
      pending:false,dueDayKey:"",history:[]
    };
  }
  let fresh={
    baselineActiveCount:activeCount,
    lastCompletedActiveCount:null,
    pending:false,
    dueDayKey:"",
    history:[]
  };
  // Trường hợp hoàn toàn chưa có state: cần lưu baseline một lần để chu kỳ 3 ngày có thể chạy.
  safeStorageSet(PERIODIC_REVIEW_KEY,JSON.stringify(fresh),"chu kỳ kiểm tra định kỳ");
  return fresh;
}
function savePeriodicReview(x){
  return safeStorageSet(PERIODIC_REVIEW_KEY,JSON.stringify(x),"chu kỳ kiểm tra định kỳ");
}
function learnedPeriodicEntries(){
  let out=[];
  sets.forEach(s=>{
    s.words.forEach(w=>{
      if(w.lastReviewedAt||(w.correct||0)+(w.wrong||0)>0){
        out.push({s,w});
      }
    });
  });
  return out;
}
function periodicDifficultyScore(entry){
  let {w}=entry,now=Date.now(),score=0;
  normalizeMistakeMeta(w);
  if(isFrequentMistake(w))score+=120;
  if(w.status==="hard")score+=80;
  score+=Math.min(60,(w.mistakeCount||0)*8);
  score+=Math.min(40,(w.wrong||0)*5);
  let attempts=(w.correct||0)+(w.wrong||0);
  if(attempts){
    let acc=(w.correct||0)/attempts;
    score+=(1-acc)*70;
  }
  if((w.dueAt||0)<=now)score+=35;
  if(w.lastReviewedAt){
    let days=(now-w.lastReviewedAt)/DAY;
    score+=Math.min(45,days*2.5);
  }
  // Recently tested words are slightly deprioritized unless they are still weak.
  if(w.periodicLastTestAt&&!isFrequentMistake(w)){
    let days=(now-w.periodicLastTestAt)/DAY;
    if(days<6)score-=35;
  }
  score+=Math.min(25,(w.periodicWrongCount||0)*6);
  return score;
}
function updatePeriodicSchedule(){
  let state=loadPeriodicReview(),
      activeCount=activeStudyDayKeys().length,
      base=state.lastCompletedActiveCount??state.baselineActiveCount;

  if(!state.pending&&activeCount-base>=PERIODIC_REVIEW_CYCLE){
    state.pending=true;
    state.dueDayKey=dayKey();
    ensureDailyDay().periodicDue=true;
    saveDaily();
    savePeriodicReview(state);
  }
  return state;
}
function periodicStatusForDay(key){
  let state=loadPeriodicReview(),
      history=(state.history||[]).filter(x=>x.completedDayKey===key),
      completed=history[history.length-1];
  if(completed){
    return completed.score>=PERIODIC_REVIEW_PASS?"pass":"fail";
  }
  if(state.pending&&state.dueDayKey===key)return "pending";
  return "";
}
function periodicLearnedCount(){
  return learnedPeriodicEntries().length;
}
function selectPeriodicEntries(){
  let all=learnedPeriodicEntries();
  if(all.length<20)return null;

  let ranked=[...all].sort((a,b)=>periodicDifficultyScore(b)-periodicDifficultyScore(a));
  let hardPool=ranked.slice(0,Math.max(1,Math.ceil(ranked.length*.7)));
  let easyPool=ranked.slice(Math.max(1,Math.floor(ranked.length*.55))).reverse();

  let picked=[],usage=new Map();
  function take(pool,count,maxUses=1){
    let candidates=shuffle(pool);
    // priority ordering is restored with small randomization to avoid predictable tests
    candidates.sort((a,b)=>periodicDifficultyScore(b)-periodicDifficultyScore(a)+(Math.random()-.5)*18);
    for(let pass=1;pass<=maxUses&&picked.length<PERIODIC_REVIEW_COUNT;pass++){
      for(let e of candidates){
        if(count<=0)break;
        let n=usage.get(e.w.id)||0;
        if(n>=pass)continue;
        picked.push(e);usage.set(e.w.id,n+1);count--;
      }
      if(count<=0)break;
    }
    return count;
  }

  let hardNeed=28,easyNeed=12;
  hardNeed=take(hardPool,hardNeed,1);
  easyNeed=take(easyPool.filter(e=>!(usage.get(e.w.id)||0)),easyNeed,1);

  // If fewer than 40 unique learned words, allow at most two appearances,
  // primarily for weak words. Never use a word more than twice.
  if(hardNeed>0)hardNeed=take(hardPool,hardNeed,2);
  if(easyNeed>0)easyNeed=take(easyPool,easyNeed,2);

  let remaining=PERIODIC_REVIEW_COUNT-picked.length;
  if(remaining>0)take(ranked,remaining,2);

  if(picked.length<PERIODIC_REVIEW_COUNT)return null;

  // Mark exactly 28 high-priority + 12 easy slots.
  return picked.slice(0,PERIODIC_REVIEW_COUNT).map((e,i)=>({
    ...e,
    difficultyGroup:i<28?"hard":"easy"
  }));
}
function uniqueChoiceValues(values,correct){
  let seen=new Set([norm(correct)]),out=[correct];
  for(let v of values){
    if(out.length>=4)break;
    if(!v||seen.has(norm(v)))continue;
    seen.add(norm(v));out.push(v);
  }
  return shuffle(out);
}
function periodicGlobalWordChoices(entry,pool){
  return uniqueChoiceValues(
    shuffle(pool.filter(x=>x.w.id!==entry.w.id)).map(x=>x.w.word),
    entry.w.word
  );
}
function periodicGlobalMeaningChoices(entry,pool){
  return uniqueChoiceValues(
    shuffle(pool.filter(x=>x.w.id!==entry.w.id)).map(x=>x.w.meaning),
    entry.w.meaning
  );
}
function buildPeriodicQuestion(entry,type,i,pool){
  let {s,w,difficultyGroup}=entry,
      q={
        id:uid(),periodic:true,type,setId:s.id,wordId:w.id,
        word:w.word,meaning:w.meaning,ipa:w.ipa,pos:w.pos,
        difficultyGroup,answer:"",playCount:0,
        skill:type==="listen"||type==="listenMeaning"?"listening":
          type==="viwrite"?"writing":
          type==="cloze"?"context":"vocabulary"
      };

  if(type==="listen"){
    q.prompt="Nghe phát âm và viết chính xác từ tiếng Anh.";
    q.correct=w.word;
  }else if(type==="listenMeaning"){
    q.prompt="Nghe từ và chọn nghĩa tiếng Việt phù hợp.";
    q.correct=w.meaning;
    q.choices=periodicGlobalMeaningChoices(entry,pool);
  }else if(type==="viwrite"){
    q.prompt=`Viết từ tiếng Anh có nghĩa là “${w.meaning}”.`;
    q.correct=w.word;
  }else if(type==="en2vi"){
    q.prompt=`“${w.word}” có nghĩa là gì?`;
    q.correct=w.meaning;
    q.choices=periodicGlobalMeaningChoices(entry,pool);
  }else if(type==="vi2en"){
    q.prompt=`Từ tiếng Anh nào có nghĩa là “${w.meaning}”?`;
    q.correct=w.word;
    q.choices=periodicGlobalWordChoices(entry,pool);
  }else{
    q.type="cloze";
    q.skill="context";
    q.prompt=contextFor(w,i);
    q.correct=w.word;
  }
  return q;
}
function generatePeriodicReviewQuestions(){
  let entries=selectPeriodicEntries();
  if(!entries)return null;

  // Exact 40-question composition:
  // 10 listen-write, 5 listen-meaning, 9 Vietnamese->write English,
  // 5 English->Vietnamese, 5 Vietnamese->English, 6 context cloze.
  let types=[
    ...Array(10).fill("listen"),
    ...Array(5).fill("listenMeaning"),
    ...Array(9).fill("viwrite"),
    ...Array(5).fill("en2vi"),
    ...Array(5).fill("vi2en"),
    ...Array(6).fill("cloze"),
  ];
  types=shuffle(types);
  return entries.map((entry,i)=>buildPeriodicQuestion(entry,types[i],i,entries));
}
function renderPeriodicReviewBanner(){
  let el=document.getElementById("periodicReviewBanner");
  if(!el)return;
  let state=updatePeriodicSchedule(),
      learned=periodicLearnedCount(),
      last=state.history?.[state.history.length-1];

  if(!state.pending){
    let activeCount=activeStudyDayKeys().length,
        base=state.lastCompletedActiveCount??state.baselineActiveCount,
        left=Math.max(0,PERIODIC_REVIEW_CYCLE-(activeCount-base));
    el.innerHTML=last
      ?`<div class="periodic-mini"><span>⭐ Kiểm tra định kỳ gần nhất: <b>${last.score}%</b></span><span>Còn ${left} ngày học để mở lượt tiếp theo</span></div>`
      :"";
    return;
  }

  el.innerHTML=`
    <div class="card periodic-banner">
      <div class="periodic-badge">⭐ KIỂM TRA ĐỊNH KỲ 3 NGÀY</div>
      <div class="periodic-banner-grid">
        <div>
          <h2>Đến lúc kiểm tra trí nhớ</h2>
          <p>40 câu được trộn từ tất cả những bộ bạn đã học. Không hiện đáp án cho đến khi nộp.</p>
          <div class="periodic-stats">
            <span>🔥 28 câu ưu tiên yếu</span>
            <span>🌱 12 câu củng cố dễ</span>
            <span>🎧 15 câu Listening</span>
            <span>🧩 6 câu ngữ cảnh</span>
          </div>
          ${learned<20?`<div class="periodic-warning">Bạn mới có ${learned} từ đã học. Cần ít nhất 20 từ để tạo đề 40 câu hợp lý.</div>`:""}
        </div>
        <button class="btn pri periodic-start" onclick="openPeriodicReview()" ${learned<20?"disabled":""}>Bắt đầu 40 câu →</button>
      </div>
    </div>`;
}
function openPeriodicReview(){
  let state=updatePeriodicSchedule();
  if(!state.pending)return alert("Chưa đến chu kỳ kiểm tra định kỳ.");
  let questions=generatePeriodicReviewQuestions();
  if(!questions)return alert("Cần ít nhất 20 từ đã học để tạo bài kiểm tra 40 câu.");

  testSession={
    periodic:true,
    started:true,
    count:PERIODIC_REVIEW_COUNT,
    questions,
    idx:0,
    lastWrong:[]
  };
  document.getElementById("testTitle").textContent="⭐ Kiểm tra định kỳ 3 ngày · 40 câu";
  document.getElementById("testConfig").style.display="none";
  document.getElementById("testProgressWrap").style.display="block";
  showScreen("test");
  renderPeriodicTest();
}
function periodicSpeakCurrent(){
  if(!testSession?.periodic)return;
  let q=testSession.questions[testSession.idx];
  if(!q||!(q.type==="listen"||q.type==="listenMeaning"))return;
  if((q.playCount||0)>=3){
    let hint=document.getElementById("periodicPlayHint");
    if(hint)hint.textContent="Đã nghe đủ 3 lần.";
    return;
  }
  q.playCount=(q.playCount||0)+1;
  listeningSpeak(encodeURIComponent(q.word));
  let hint=document.getElementById("periodicPlayHint");
  if(hint)hint.textContent=`Đã nghe ${q.playCount}/3 lần`;
}
function renderPeriodicTest(){
  if(!testSession?.periodic)return;
  let q=testSession.questions[testSession.idx],
      total=testSession.questions.length,
      answered=testSession.questions.filter(x=>norm(x.answer)).length;

  document.getElementById("testProgressText").textContent=
    `⭐ Định kỳ · Câu ${testSession.idx+1}/${total} · Đã trả lời ${answered}`;
  document.getElementById("testBar").style.width=
    `${(testSession.idx/total)*100}%`;

  let labels={
    listen:"🎧 Nghe → Viết",
    listenMeaning:"🔊 Nghe → Chọn nghĩa",
    viwrite:"✍️ Việt → Viết English",
    en2vi:"🇬🇧 → 🇻🇳",
    vi2en:"🇻🇳 → 🇬🇧",
    cloze:"🧩 Điền từ vào câu",
  };
  let body=`<div class="periodic-question-head"><span class="pill">${labels[q.type]}</span><span class="subtle">Kiểm tra trí nhớ · không báo đáp án giữa chừng</span></div>`;

  if(q.type==="listen"||q.type==="listenMeaning"){
    body+=`<div class="testprompt">${esc(q.prompt)}</div>
      <div class="periodic-listen-box">
        <button class="btn sec" onclick="periodicSpeakCurrent()" ${(q.playCount||0)>=3?"disabled":""}>🔊 Nghe từ</button>
        <span id="periodicPlayHint" class="subtle">Đã nghe ${q.playCount||0}/3 lần</span>
      </div>`;
    if(q.type==="listen")
      body+=`<input id="testInput" class="answer" value="${esc(q.answer)}" placeholder="Nhập từ tiếng Anh bạn nghe được...">`;
    else
      body+=`<div class="choices">${q.choices.map(c=>`<button class="choice ${norm(q.answer)===norm(c)?"selected":""}" onclick="chooseTest('${encodeURIComponent(c)}')">${esc(c)}</button>`).join("")}</div>`;
  }else if(q.type==="viwrite"){
    body+=`<div class="testprompt">${esc(q.prompt)}</div><input id="testInput" class="answer" value="${esc(q.answer)}" placeholder="Nhập từ tiếng Anh...">`;
  }else if(q.type==="cloze"){
    body+=`<div class="testprompt">${esc(q.prompt)}</div><div class="help">Gợi ý nghĩa: <b>${esc(q.meaning)}</b> · ${posLabel(q.pos)}</div><input id="testInput" class="answer" value="${esc(q.answer)}" placeholder="Điền từ phù hợp...">`;
  }else{
    body+=`<div class="testprompt">${esc(q.prompt)}</div><div class="choices">${q.choices.map(c=>`<button class="choice ${norm(q.answer)===norm(c)?"selected":""}" onclick="chooseTest('${encodeURIComponent(c)}')">${esc(c)}</button>`).join("")}</div>`;
  }

  body+=`<div class="testnav">
    <button class="btn ghost" onclick="prevTest()" ${testSession.idx===0?"disabled":""}>← Trước</button>
    <span class="subtle">Đáp án chỉ hiện sau khi nộp đủ 40 câu</span>
    ${testSession.idx===total-1?'<button class="btn pri" onclick="submitTest()">Nộp bài</button>':'<button class="btn pri" onclick="nextTest()">Tiếp →</button>'}
  </div>`;
  document.getElementById("testBox").innerHTML=body;

  let input=document.getElementById("testInput");
  if(input){
    input.focus();
    input.oninput=()=>q.answer=input.value;
    input.onkeydown=e=>{if(e.key==="Enter")nextTest()};
  }
}
function periodicSkillLabel(skill){
  return {listening:"🎧 Listening",writing:"✍️ Writing",vocabulary:"🔤 Vocabulary",context:"🧩 Context"}[skill]||skill;
}
function submitPeriodicReview(){
  saveTestInput();
  if(!testSession?.periodic)return;
  let questions=testSession.questions,
      unanswered=questions.filter(q=>!norm(q.answer)).length;
  if(unanswered&&!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`))return;

  let wrong=[],correct=0,
      skills={
        listening:{correct:0,total:0},
        writing:{correct:0,total:0},
        vocabulary:{correct:0,total:0},
        context:{correct:0,total:0}
      },
      touchedSets=new Set();

  questions.forEach(q=>{
    let ok=norm(q.answer)===norm(q.correct);
    q.ok=ok;
    skills[q.skill].total++;
    if(ok){correct++;skills[q.skill].correct++}else wrong.push(q);

    let s=sets.find(x=>x.id===q.setId),
        w=s?.words.find(x=>x.id===q.wordId);
    if(!s||!w)return;
    touchedSets.add(s.id);
    s.totalAttempts++;
    s.lastStudiedAt=Date.now();
    s.updatedAt=Date.now();

    w.periodicTestCount=(w.periodicTestCount||0)+1;
    w.periodicLastTestAt=Date.now();
    if(ok){
      recordWordLearningOutcome(w,"correct","periodic");
      reviewWord(w,"good");
    }else{
      w.periodicWrongCount=(w.periodicWrongCount||0)+1;
      recordWordLearningOutcome(w,"wrong","periodic");
      reviewWord(w,"again");
    }
  });

  let total=questions.length,
      score=Math.round((correct/total)*100),
      state=loadPeriodicReview(),
      today=dayKey(),
      activeCountBefore=activeStudyDayKeys().length;

  let skillResult={};
  Object.entries(skills).forEach(([k,v])=>{
    skillResult[k]={...v,percent:v.total?Math.round(v.correct/v.total*100):0};
  });

  let entry={
    id:uid(),
    completedAt:Date.now(),
    completedDayKey:today,
    score,correct,total,
    wrongCount:wrong.length,
    skills:skillResult,
    hardQuestions:questions.filter(q=>q.difficultyGroup==="hard").length,
    easyQuestions:questions.filter(q=>q.difficultyGroup==="easy").length,
  };
  state.history=[...(state.history||[]),entry].slice(-50);
  state.pending=false;
  state.dueDayKey="";
  state.lastCompletedActiveCount=activeCountBefore;
  savePeriodicReview(state);

  let day=ensureDailyDay();
  day.periodicDue=false;
  day.periodicCompleted=true;
  day.periodicScore=score;
  day.tests++;
  saveDaily();
  persist();

  // Recalculate baseline after the periodic test itself made today an active day.
  state.lastCompletedActiveCount=activeStudyDayKeys().length;
  savePeriodicReview(state);

  document.getElementById("testProgressText").textContent=
    `⭐ Hoàn thành · ${correct}/${total} đúng`;
  document.getElementById("testBar").style.width="100%";

  let weakest=Object.entries(skillResult)
    .sort((a,b)=>a[1].percent-b[1].percent)[0];

  document.getElementById("testBox").innerHTML=`
    <div class="periodic-result-hero">
      <div class="periodic-result-icon">${score>=PERIODIC_REVIEW_PASS?"⭐":"🔄"}</div>
      <h2>${score}%</h2>
      <p>${correct}/40 câu đúng · ${wrong.length} câu cần củng cố</p>
    </div>
    <div class="periodic-skill-grid">
      ${Object.entries(skillResult).map(([k,v])=>`<div class="periodic-skill"><span>${periodicSkillLabel(k)}</span><b>${v.correct}/${v.total}</b><i>${v.percent}%</i></div>`).join("")}
    </div>
    <div class="alert ${score>=PERIODIC_REVIEW_PASS?"okay":"err"}">
      ${score>=PERIODIC_REVIEW_PASS?"⭐ Đạt mốc 50% — ngày hôm nay được đánh dấu ngôi sao.":"🔄 Chưa đạt 50% — các từ sai đã được đẩy trở lại Smart Daily để củng cố."}
      ${weakest?`<br>Kỹ năng yếu nhất: <b>${periodicSkillLabel(weakest[0])} · ${weakest[1].percent}%</b>`:""}
    </div>
    ${wrong.length?`<h3>${wrong.length} câu cần xem lại</h3>${wrong.slice(0,40).map((q,i)=>`
      <div class="review">
        <b>${i+1}. ${esc(q.prompt)}</b><br>
        <span class="subtle">Bạn: ${esc(q.answer||"Chưa trả lời")} · Đúng: <b>${esc(q.correct)}</b> · ${periodicSkillLabel(q.skill)}</span>
      </div>`).join("")}`:'<div class="alert okay">Không có câu sai.</div>'}
    <div class="actions" style="justify-content:center;margin-top:16px">
      ${wrong.length?'<button class="btn sec" onclick="reviewPeriodicWrongNow()">🔥 Ôn ngay các từ sai</button>':""}
      <button class="btn pri" onclick="exitPeriodicReview()">Về trang chủ</button>
    </div>`;

  testSession.lastWrong=wrong;
  testSession.periodicResult=entry;
  updateWeekDots();
}
function reviewPeriodicWrongNow(){
  let wrong=testSession?.lastWrong||[];
  if(!wrong.length)return;
  let grouped=[];
  wrong.forEach(q=>{
    let g=grouped.find(x=>x.setId===q.setId);
    if(!g){g={setId:q.setId,wordIds:[]};grouped.push(g)}
    if(!g.wordIds.includes(q.wordId))g.wordIds.push(q.wordId);
  });
  testSession=null;
  startPeriodicWrongGroup(grouped);
}
function startPeriodicWrongGroup(groups){
  if(!groups?.length){showScreen("home");return}
  let [g,...rest]=groups,
      s=sets.find(x=>x.id===g.setId);
  if(!s)return startPeriodicWrongGroup(rest);
  let queue=g.wordIds.map(id=>s.words.find(w=>w.id===id)).filter(Boolean);
  if(!queue.length)return startPeriodicWrongGroup(rest);
  let mode=localStorage.getItem("vocabflow_learn_mode")||"vi-en";
  learnSession={
    setId:s.id,queue,idx:0,wrongQueue:[],answered:0,dueOnly:true,mode,
    dailySpecial:"review",smartQueue:true,smartPhase:"frequent",
    periodicWrongReview:true,periodicWrongGroups:rest
  };
  document.getElementById("learnTitle").textContent=`🔥 Ôn từ sai · Kiểm tra định kỳ`;
  showScreen("learn");renderLearn();
}
function continuePeriodicWrongReview(){
  let groups=learnSession?.periodicWrongGroups||[];
  learnSession=null;
  startPeriodicWrongGroup(groups);
}
function exitPeriodicReview(){
  testSession=null;
  document.getElementById("testConfig").style.display="flex";
  showScreen("home");
}

function updateWeekDots() {
  let el = document.getElementById("weekDots");
  if (!el) return;
  updatePeriodicSchedule();
  let labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    now = new Date(),
    dow = (now.getDay() + 6) % 7;
  el.innerHTML = labels
    .map((x, i) => {
      let d = new Date(now);
      d.setDate(now.getDate() + (i - dow));
      let key=dayKey(d.getTime()),
          data=daily.days[key],
          active=dailyHasActivity(data),
          periodic=periodicStatusForDay(key),
          cls=periodic==="pass"?"periodic-pass":
              periodic==="fail"?"periodic-fail":
              periodic==="pending"?"periodic-pending":
              active?"active":"",
          mark=periodic==="pass"?"★":
               periodic==="fail"?"↻":
               periodic==="pending"?"✦":
               active?"✓":"";
      let title=periodic==="pass"?"Kiểm tra định kỳ đạt ≥50%":
                periodic==="fail"?"Kiểm tra định kỳ dưới 50%":
                periodic==="pending"?"Có bài kiểm tra định kỳ đang chờ":
                active?"Đã học":"";
      return `<span class="daydot ${cls}" title="${title}"><b>${x}</b><i>${mark}</i></span>`;
    })
    .join("");
}

/* ================= Smart Daily Queue ================= */
const SMART_STUDY_KEY = "anhba_smart_study_v2";

function loadSmartStudy(){
  try{
    let x=JSON.parse(localStorage.getItem(SMART_STUDY_KEY)||"{}");
    return {
      currentSetId: typeof x.currentSetId==="string"?x.currentSetId:"",
      manualCount: Math.max(1,Math.min(100,Number(x.manualCount)||10)),
      manualFolder: typeof x.manualFolder==="string"?x.manualFolder:"",
      manualSetId: typeof x.manualSetId==="string"?x.manualSetId:""
    };
  }catch{
    return {currentSetId:"",manualCount:10,manualFolder:"",manualSetId:""};
  }
}
function saveSmartStudy(patch={}){
  let x={...loadSmartStudy(),...patch};
  safeStorageSet(SMART_STUDY_KEY,JSON.stringify(x),"Smart Daily");
  return x;
}
function smartNewWords(s){
  return (s?.words||[]).filter(w=>!w.lastReviewedAt||w.status==="new");
}
function smartReviewWords(s){
  return dueWords(s)
    .filter(w=>w.lastReviewedAt&&w.status!=="new")
    .sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));
}
function smartFrequentWords(s){
  let dueIds=new Set(smartReviewWords(s).map(w=>w.id)),
      now=Date.now();
  return frequentMistakeWordsForSet(s)
    .filter(w=>!dueIds.has(w.id)&&(w.mistakePracticeDueAt||0)<=now);
}
function smartHardWords(s){
  let dueIds=new Set(smartReviewWords(s).map(w=>w.id));
  let frequentIds=new Set(smartFrequentWords(s).map(w=>w.id));
  return (s?.words||[])
    .filter(w=>w.lastReviewedAt&&w.status==="hard"&&!dueIds.has(w.id)&&!frequentIds.has(w.id))
    .sort((a,b)=>(b.wrong||0)-(a.wrong||0));
}
function smartFolderSequence(){
  let map=new Map();
  sets.forEach(s=>{
    let f=s.folder||"Chưa phân loại";
    let t=s.createdAt||0;
    if(!map.has(f)||t<map.get(f))map.set(f,t);
  });
  return [...map.entries()]
    .sort((a,b)=>{
      if(a[0]==="Chưa phân loại"&&b[0]!=="Chưa phân loại")return 1;
      if(b[0]==="Chưa phân loại"&&a[0]!=="Chưa phân loại")return -1;
      return a[1]-b[1]||a[0].localeCompare(b[0],"vi");
    })
    .map(x=>x[0]);
}
function smartSetSequence(){
  let folders=smartFolderSequence(),out=[];
  folders.forEach(folder=>{
    out.push(...sets
      .filter(s=>(s.folder||"Chưa phân loại")===folder)
      .sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)));
  });
  return out;
}
function ensureSmartCurrentSet(){
  let pref=loadSmartStudy();
  let existing=sets.find(s=>s.id===pref.currentSetId);
  if(existing&&smartNewWords(existing).length)return existing;

  let next=smartSetSequence().find(s=>smartNewWords(s).length);
  saveSmartStudy({currentSetId:next?.id||""});
  return next||null;
}
function smartDailyCounts(){
  let reviewedDue=sets.reduce((n,s)=>n+smartReviewWords(s).length,0);
  let frequent=sets.reduce((n,s)=>n+smartFrequentWords(s).length,0);
  let hard=sets.reduce((n,s)=>n+smartHardWords(s).length,0);
  let fresh=sets.reduce((n,s)=>n+smartNewWords(s).length,0);
  return {reviewedDue,frequent,hard,fresh};
}
function smartRemainingGoals(){
  let d=ensureDailyDay(),g=daily.goals;
  return {
    newLeft:Math.max(0,(g.newWords||0)-d.newIds.length),
    reviewLeft:Math.max(0,(g.reviews||0)-d.reviewIds.length)
  };
}
function getSmartDailyPlan(){
  let goals=smartRemainingGoals();

  // 1) SRS đến hạn luôn ưu tiên cao nhất.
  let reviewSets=sets
    .map(s=>({s,ws:smartReviewWords(s)}))
    .filter(x=>x.ws.length)
    .sort((a,b)=>(a.ws[0]?.dueAt||0)-(b.ws[0]?.dueAt||0));
  if(reviewSets.length){
    let x=reviewSets[0];
    let target=goals.reviewLeft||Math.min(10,x.ws.length);
    return {phase:"review",s:x.s,ws:x.ws,count:Math.min(x.ws.length,Math.max(1,target))};
  }

  // 2) Từ Hay Sai: sai/bỏ qua >=3 lần hoặc >=3 lỗi trong 10 lượt gần nhất.
  let frequentSets=sets
    .map(s=>({s,ws:smartFrequentWords(s)}))
    .filter(x=>x.ws.length)
    .sort((a,b)=>frequentMistakeScore(b.ws[0])-frequentMistakeScore(a.ws[0]));
  if(frequentSets.length){
    let x=frequentSets[0];
    let target=goals.reviewLeft||Math.min(5,x.ws.length);
    return {phase:"frequent",s:x.s,ws:x.ws,count:Math.min(x.ws.length,Math.max(1,target))};
  }

  // 3) Từ Hard còn lại.
  let hardSets=sets
    .map(s=>({s,ws:smartHardWords(s)}))
    .filter(x=>x.ws.length)
    .sort((a,b)=>(b.ws[0]?.wrong||0)-(a.ws[0]?.wrong||0));
  if(hardSets.length){
    let x=hardSets[0];
    let target=goals.reviewLeft||Math.min(5,x.ws.length);
    return {phase:"hard",s:x.s,ws:x.ws,count:Math.min(x.ws.length,Math.max(1,target))};
  }

  // 4) Khi ôn xong, tiếp tục bộ từ đang học.
  let s=ensureSmartCurrentSet();
  if(s){
    let ws=smartNewWords(s);
    let target=goals.newLeft||Math.min(10,ws.length);
    return {phase:"new",s,ws,count:Math.min(ws.length,Math.max(1,target))};
  }
  return null;
}
function smartPhaseLabel(phase){
  return phase==="review"?"Ôn SRS":
    phase==="frequent"?"Từ Hay Sai":
    phase==="hard"?"Từ Khó":"Từ mới";
}
function smartPhaseIcon(phase){
  return phase==="review"?"↻":phase==="frequent"?"🔥":phase==="hard"?"🧠":"🌱";
}
function smartCurrentProgress(){
  let s=ensureSmartCurrentSet();
  if(!s)return null;
  let total=s.words.length,newCount=smartNewWords(s).length;
  return {
    s,
    learned:Math.max(0,total-newCount),
    total,
    percent:total?Math.round(((total-newCount)/total)*100):0,
    folder:s.folder||"Chưa phân loại"
  };
}
function startSmartDailyQueue(){
  let plan=getSmartDailyPlan();
  if(!plan){
    alert("Hôm nay không còn từ mới, từ Sai/Khó hoặc từ SRS cần xử lý. 🎉");
    return;
  }
  startSmartQueueSession(plan.s,plan.ws.slice(0,plan.count),plan.phase,plan.count);
}
function startSmartQueueSession(s,queue,phase,count){
  if(!s||!queue?.length)return alert("Không có từ phù hợp để học.");
  let mode=localStorage.getItem("vocabflow_learn_mode")||"vi-en";
  ensureWritingProgress(s);
  s.lastStudiedAt=Date.now();
  if(phase==="new")saveSmartStudy({currentSetId:s.id});
  persist();

  learnSession={
    setId:s.id,
    queue:[...queue],
    idx:0,
    wrongQueue:[],
    answered:0,
    dueOnly:phase!=="new",
    mode,
    dailySpecial:phase==="new"?"new":"review",
    smartQueue:true,
    smartPhase:phase,
    smartInitialCount:count||queue.length
  };
  document.getElementById("learnTitle").textContent=
    `${s.name} · Smart Daily · ${smartPhaseLabel(phase)}`;
  showScreen("learn");
  renderLearn();
}
function finishSmartQueue(startNext=false){
  learnSession=null;
  showScreen("home");
  if(startNext)setTimeout(startSmartDailyQueue,80);
}
function toggleSmartStudyOptions(force=null){
  let box=document.getElementById("smartStudyOptions");
  if(!box)return;
  let open=force===null?box.style.display==="none":!!force;
  box.style.display=open?"block":"none";
  if(open)renderSmartStudyOptions();
}
function smartManualFolders(){
  return folderNames().filter(f=>f!=="Tất cả"&&sets.some(s=>(s.folder||"Chưa phân loại")===f));
}
function renderSmartStudyOptions(){
  let p=loadSmartStudy(),
      folderSel=document.getElementById("smartManualFolder"),
      setSel=document.getElementById("smartManualSet"),
      count=document.getElementById("smartManualCount");
  if(!folderSel||!setSel||!count)return;

  let folders=smartManualFolders();
  let preferred=folders.includes(p.manualFolder)?p.manualFolder:(ensureSmartCurrentSet()?.folder||folders[0]||"");
  folderSel.innerHTML=folders.map(f=>`<option value="${encodeURIComponent(f)}">${esc(f)}</option>`).join("");
  if(preferred)folderSel.value=encodeURIComponent(preferred);
  count.value=p.manualCount||10;
  renderSmartManualSets(p.manualSetId);
}
function renderSmartManualSets(preferId=""){
  let folderSel=document.getElementById("smartManualFolder"),
      setSel=document.getElementById("smartManualSet");
  if(!folderSel||!setSel)return;
  let folder=decodeURIComponent(folderSel.value||""),
      list=sets.filter(s=>(s.folder||"Chưa phân loại")===folder);
  setSel.innerHTML=list.length
    ?list.map(s=>`<option value="${s.id}">${esc(s.name)} · ${s.words.length} từ</option>`).join("")
    :'<option value="">Không có bộ đề</option>';
  if(preferId&&list.some(s=>s.id===preferId))setSel.value=preferId;
  saveSmartStudy({manualFolder:folder,manualSetId:setSel.value||""});
}
function startManualSmartStudy(){
  let id=document.getElementById("smartManualSet")?.value,
      count=Math.max(1,Math.min(100,Number(document.getElementById("smartManualCount")?.value)||10)),
      s=sets.find(x=>x.id===id);
  if(!s)return alert("Hãy chọn một bộ đề.");

  // Trong bộ được chọn vẫn giữ đúng ưu tiên Smart Queue.
  let review=smartReviewWords(s),frequent=smartFrequentWords(s),hard=smartHardWords(s),fresh=smartNewWords(s);
  let queue=[],seen=new Set();
  [...review,...frequent,...hard,...fresh].forEach(w=>{
    if(queue.length>=count||seen.has(w.id))return;
    seen.add(w.id);queue.push(w);
  });
  if(!queue.length)return alert("Bộ đề này hiện không có từ cần học theo Smart Daily.");

  let phase=review.length?"review":frequent.length?"frequent":hard.length?"hard":"new";
  saveSmartStudy({
    currentSetId:s.id,
    manualCount:count,
    manualFolder:s.folder||"Chưa phân loại",
    manualSetId:s.id
  });
  toggleSmartStudyOptions(false);
  startSmartQueueSession(s,queue,phase,count);
}
function smartGoToCurrentSet(){
  let s=ensureSmartCurrentSet();
  if(!s)return showScreen("library");
  showScreen("library");
  setTimeout(()=>{
    activeFolder=s.folder||"Chưa phân loại";
    renderLibrary();
    document.getElementById("libraryList")?.scrollIntoView({behavior:"smooth",block:"start"});
  },40);
}


const HOME_MISTAKE_FOLDER_KEY = "anhba_home_mistake_folder";
const HOME_MISTAKE_COUNT_KEY = "anhba_home_mistake_count";

function homeMistakeCount(){
  let n=Number(localStorage.getItem(HOME_MISTAKE_COUNT_KEY));
  return Number.isFinite(n)&&n>0?Math.min(100,Math.floor(n)):10;
}
function selectedHomeMistakeFolder(){
  let folders=frequentMistakeFolders();
  let saved=localStorage.getItem(HOME_MISTAKE_FOLDER_KEY)||"";
  return folders.includes(saved)?saved:(folders[0]||"");
}
function updateHomeMistakeCard(){
  let folderSel=document.getElementById("homeMistakeFolder"),
      countInput=document.getElementById("homeMistakeCount"),
      stat=document.getElementById("homeMistakeStat");
  if(!folderSel||!countInput||!stat)return;

  let folder=decodeURIComponent(folderSel.value||"");
  safeStorageSet(HOME_MISTAKE_FOLDER_KEY,folder,"Folder Từ Hay Sai");
  let count=Math.max(1,Math.min(100,Number(countInput.value)||10));
  countInput.value=count;
  safeStorageSet(HOME_MISTAKE_COUNT_KEY,String(count),"số từ ôn Hay Sai");

  let items=folder?frequentMistakeWordsInFolder(folder):[],
      n=items.length,
      preview=items.slice(0,3)
        .map(({w})=>`${esc(w.word)} (${w.mistakeCount||0})`)
        .join(" · ");
  stat.innerHTML=folder
    ?`<b>${n}</b> từ hay sai trong Folder này${preview?`<div class="mistake-preview">Ưu tiên: ${preview}${n>3?" …":""}</div>`:""}`
    :"Chưa có Folder nào có từ hay sai";
}
function startFolderMistakeReview(){
  let folderSel=document.getElementById("homeMistakeFolder"),
      countInput=document.getElementById("homeMistakeCount");
  if(!folderSel)return;
  let folder=decodeURIComponent(folderSel.value||""),
      count=Math.max(1,Math.min(100,Number(countInput?.value)||10));
  if(!folder)return alert("Chưa có Folder nào có từ hay sai.");

  let picked=frequentMistakeWordsInFolder(folder).slice(0,count);
  if(!picked.length)return alert(`Folder "${folder}" hiện không có từ hay sai.`);

  // Chia theo bộ đề để giữ toàn bộ thống kê/SRS đúng bộ gốc.
  let groups=[];
  picked.forEach(({s,w})=>{
    let g=groups.find(x=>x.setId===s.id);
    if(!g){g={setId:s.id,wordIds:[]};groups.push(g)}
    g.wordIds.push(w.id);
  });
  safeStorageSet(HOME_MISTAKE_FOLDER_KEY,folder,"Folder Từ Hay Sai");
  safeStorageSet(HOME_MISTAKE_COUNT_KEY,String(count),"số từ ôn Hay Sai");
  startFolderMistakeGroup(folder,groups);
}
function startFolderMistakeGroup(folder,groups){
  if(!groups?.length){
    alert(`Đã hoàn thành lượt ôn Từ Hay Sai của Folder "${folder}".`);
    showScreen("home");
    return;
  }
  let [first,...rest]=groups,
      s=sets.find(x=>x.id===first.setId);
  if(!s)return startFolderMistakeGroup(folder,rest);
  let queue=first.wordIds
    .map(id=>s.words.find(w=>w.id===id))
    .filter(Boolean);
  if(!queue.length)return startFolderMistakeGroup(folder,rest);

  let mode=localStorage.getItem("vocabflow_learn_mode")||"vi-en";
  learnSession={
    setId:s.id,
    queue,
    idx:0,
    wrongQueue:[],
    answered:0,
    dueOnly:true,
    mode,
    dailySpecial:"review",
    smartQueue:true,
    smartPhase:"frequent",
    mistakeFolderReview:true,
    mistakeFolder:folder,
    mistakeFolderGroups:rest,
  };
  s.lastStudiedAt=Date.now();
  persist();
  document.getElementById("learnTitle").textContent=
    `${s.name} · 🔥 Từ Hay Sai · ${folder}`;
  showScreen("learn");
  renderLearn();
}
function continueFolderMistakeReview(){
  if(!learnSession?.mistakeFolderReview)return;
  let folder=learnSession.mistakeFolder,
      groups=learnSession.mistakeFolderGroups||[];
  learnSession=null;
  startFolderMistakeGroup(folder,groups);
}

function renderProductDashboard() {
  let d = ensureDailyDay(),
    g = daily.goals,
    streak = calcStreak(),
    a = aggregate();
  let newDone = d.newIds.length,
    reviewDone = d.reviewIds.length,
    testDone = d.tests;
  let availableNew = allWords().filter(
    (w) => !w.lastReviewedAt || w.status === "new",
  ).length;
  let hard = allWords()
      .filter((w) => w.status === "hard")
      .sort((x, y) => y.wrong - x.wrong),
    due = dueWords().length;
  let h = document.getElementById("helloTitle");
  if (h) h.textContent = "Học Cùng Anh Ba Sài Gòn Nhen";
  let sn = document.getElementById("streakNum");
  if (sn) sn.textContent = streak;
  let sb = document.getElementById("streakBadge");
  if (sb) sb.textContent = `${streak} ngày`;
  updateWeekDots();
  renderPeriodicReviewBanner();

  let gm = document.getElementById("goalMetrics");
  if (gm)
    gm.innerHTML = `
  <div class="goal-metric"><div class="metric-title">🌱 Từ mới</div><div class="metric-big metric-green">${newDone} / ${g.newWords}</div><div class="metric-track"><i style="width:${pct(newDone, g.newWords)}%;background:#45c477"></i></div></div>
  <div class="goal-metric"><div class="metric-title">📘 Ôn tập (SRS)</div><div class="metric-big metric-blue">${reviewDone} / ${g.reviews}</div><div class="metric-track"><i style="width:${pct(reviewDone, g.reviews)}%;background:#4f91ff"></i></div></div>
  <div class="goal-metric"><div class="metric-title">📝 Kiểm tra</div><div class="metric-big metric-purple">${testDone} / ${g.tests}</div><div class="metric-track"><i style="width:${pct(testDone, g.tests)}%;background:#a356ff"></i></div></div>`;

  let fc = document.getElementById("focusCards");
  if (fc) {
    let smartCounts=smartDailyCounts(),
        plan=getSmartDailyPlan(),
        current=smartCurrentProgress(),
        phase=plan?.phase||"",
        planCount=plan?.count||0;

    fc.innerHTML = `
      <div class="card focus-card smart-daily-card">
        <div class="smart-daily-head">
          <div>
            <div class="pill">⚡ SMART DAILY QUEUE</div>
            <h3>📚 Bài học hôm nay</h3>
            <p>App tự ưu tiên <b>SRS → Từ Hay Sai → Từ Khó → Từ mới</b>. Bạn chỉ cần bấm bắt đầu.</p>
          </div>
          <div class="smart-counts">
            <span>↻ ${smartCounts.reviewedDue} SRS</span>
            <span>🔥 ${smartCounts.frequent} Hay sai</span>
            <span>🧠 ${smartCounts.hard} Khó</span>
            <span>🌱 ${smartCounts.fresh} từ mới</span>
          </div>
        </div>

        ${plan?`
          <div class="smart-next">
            <div class="smart-next-icon">${smartPhaseIcon(phase)}</div>
            <div>
              <div class="small">LƯỢT TIẾP THEO · ${smartPhaseLabel(phase)}</div>
              <b>${esc(plan.s.name)}</b>
              <div class="subtle">📁 ${esc(plan.s.folder||"Chưa phân loại")} · ${planCount} từ trong lượt này</div>
            </div>
          </div>
          <div class="smart-main-actions">
            <button class="btn pri smart-start-btn" onclick="startSmartDailyQueue()">▶ Bắt đầu học</button>
            <button class="btn ghost" onclick="toggleSmartStudyOptions()">⚙ Chọn nội dung</button>
          </div>
        `:`<div class="smart-empty">🎉 Bạn đã xử lý hết nội dung Smart Daily hiện tại.</div>`}

        <div id="smartStudyOptions" class="smart-options" style="display:none">
          <div class="smart-options-title"><b>Chọn nội dung thủ công</b><span class="small">Chỉ dùng khi hôm nay bạn muốn học phần khác.</span></div>
          <div class="smart-options-grid">
            <label>Folder<select id="smartManualFolder" onchange="renderSmartManualSets()"></select></label>
            <label>Bộ đề<select id="smartManualSet"></select></label>
            <label>Số từ<input id="smartManualCount" type="number" min="1" max="100" value="10"></label>
          </div>
          <div class="actions" style="justify-content:flex-start">
            <button class="btn sec" onclick="startManualSmartStudy()">Học nội dung đã chọn</button>
            <button class="btn ghost" onclick="toggleSmartStudyOptions(false)">Đóng</button>
          </div>
        </div>
      </div>

      <div class="card focus-card smart-current-card">
        <h3>Bộ đang học</h3>
        ${current?`
          <div class="smart-folder">📁 ${esc(current.folder)}</div>
          <div class="smart-current-name">${esc(current.s.name)}</div>
          <div class="small">${current.learned}/${current.total} từ đã bắt đầu học</div>
          <div class="metric-track smart-current-track"><i style="width:${current.percent}%;background:#45c477"></i></div>
          <div class="focus-number">${current.percent}%</div>
          <button class="btn ghost" onclick="smartGoToCurrentSet()">Xem bộ đề</button>
        `:`
          <div class="focus-number">🏆</div>
          <div class="small">Không còn bộ từ mới đang chờ.</div>
          <button class="btn ghost" onclick="showScreen('library')">Mở kho từ</button>
        `}
      </div>

      <div class="card focus-card frequent-mistake-card">
        <h3>🔥 Từ Hay Sai</h3>
        <p>Sai hoặc bỏ qua 3 lần sẽ được ưu tiên ghi nhận để ôn lại.</p>
        ${(()=>{
          let folders=frequentMistakeFolders(),
              selected=selectedHomeMistakeFolder();
          return folders.length?`
            <label class="mistake-home-label">Folder
              <select id="homeMistakeFolder" onchange="updateHomeMistakeCard()">
                ${folders.map(f=>`<option value="${encodeURIComponent(f)}" ${f===selected?"selected":""}>${esc(f)}</option>`).join("")}
              </select>
            </label>
            <label class="mistake-home-label">Số từ
              <input id="homeMistakeCount" type="number" min="1" max="100" value="${homeMistakeCount()}" onchange="updateHomeMistakeCard()">
            </label>
            <div id="homeMistakeStat" class="mistake-home-stat"></div>
            <button class="btn mistake-review-btn" onclick="startFolderMistakeReview()">Ôn Từ Hay Sai</button>
          `:`<div class="mistake-empty">Chưa có từ nào đạt ngưỡng Hay Sai. 👍</div>`;
        })()}
      </div>`;
  }

  setTimeout(updateHomeMistakeCard,0);

  let rm = document.getElementById("recentMini");
  if (rm)
    rm.innerHTML = sets.length
      ? sets
          .slice(0, 4)
          .map((s) => {
            let x = statusCounts(s),
              den = Math.max(1, s.words.length),
              pc = Math.round((x.master / den) * 100);
            return `<div class="recent-mini"><b>${esc(s.name)}</b><div class="small">${s.words.length} từ · ${pc}% đã thuộc</div><div class="metric-track"><i style="width:${pc}%;background:#45c477"></i></div><div class="actions" style="justify-content:flex-start;margin-top:9px"><button class="btn ghost" onclick="startLearn('${s.id}')">Học tiếp</button></div></div>`;
          })
          .join("")
      : '<div class="empty">Chưa có bộ từ.</div>';

  let si = document.getElementById("statsInline");
  if (si) {
    let st=accurateLearningStats();
    si.innerHTML = `
      <div class="stats-main">
        <div class="n" style="color:#69a5ff">${st.total}</div>
        <div class="l">Tổng từ</div>
        <div class="stats-detail">${sets.length} bộ đề</div>
      </div>
      <div class="stats-main">
        <div class="n" style="color:#55d581">${st.learned}</div>
        <div class="l">Đã học</div>
        <div class="stats-detail">${st.learnedPct}% kho từ</div>
      </div>
      <div class="stats-main">
        <div class="n" style="color:#53d780">${st.mastered}</div>
        <div class="l">Đã thuộc</div>
        <div class="stats-detail">SRS ≥ 4 · ${st.masteredPct}% từ đã học</div>
      </div>
      <div class="stats-main">
        <div class="n" style="color:#ffad42">${st.accuracy}%</div>
        <div class="l">Độ chính xác</div>
        <div class="stats-detail">${st.correct} đúng · ${st.wrong} sai</div>
      </div>

      <div class="stats-sub"><b>⏰ ${st.due}</b><span>Cần ôn SRS</span></div>
      <div class="stats-sub"><b>🔥 ${st.frequent}</b><span>Từ Hay Sai</span></div>
      <div class="stats-sub"><b>📝 ${st.normalTests}</b><span>Test thường</span></div>
      <div class="stats-sub"><b>⭐ ${st.periodicTests}</b><span>Test định kỳ</span></div>`;
  }

  renderHeatmap();
}
function renderHome() {
  let a = aggregate();
  document.getElementById("homeStats").innerHTML =
    `<div class="card stat"><div class="k">TỔNG TỪ</div><div class="v">${a.total}</div><div class="h">${sets.length} bộ đề</div></div><div class="card stat"><div class="k">CẦN ÔN HÔM NAY</div><div class="v">${a.due}</div><div class="h">Theo lịch Spaced Repetition</div></div><div class="card stat"><div class="k">ĐÃ THUỘC</div><div class="v">${a.m}</div><div class="h">${a.total ? Math.round((a.m / a.total) * 100) : 0}% kho từ</div></div><div class="card stat"><div class="k">ĐỘ CHÍNH XÁC</div><div class="v">${a.acc}%</div><div class="h">${a.c} đúng · ${a.wr} sai</div></div>`;
  document.getElementById("dueHero").innerHTML =
    `<div class="duehero"><div><div class="small">SMART REVIEW</div><div class="big">${a.due ? `${a.due} từ đang chờ bạn` : "Hôm nay đã ổn 🎉"}</div><div class="subtle">Từ sai và từ đến hạn được ưu tiên trước.</div></div>${a.due ? '<button class="btn pri" onclick="startDueReview()">Ôn ngay</button>' : '<button class="btn sec" onclick="showScreen(\'library\')">Chọn bộ để học</button>'}</div>`;
  document.getElementById("setCount").textContent = `${sets.length} bộ`;
  document.getElementById("homeSets").innerHTML = sets.length
    ? sets.slice(0, 6).map(setCard).join("")
    : '<div class="card empty"><div class="emo">📚</div>Chưa có bộ từ. Hãy tạo bộ đầu tiên.</div>';
  renderDailyDashboard();
  renderProductDashboard();
}
function statusCounts(s) {
  return {
    due: dueWords(s).length,
    master: s.words.filter((w) => w.mastered).length,
    hard: s.words.filter((w) => w.status === "hard").length,
  };
}
function setCard(s) {
  let x = statusCounts(s);
  return `<div class="card set"><div><h4>${esc(s.name)}</h4><div class="meta"><span>📘 ${s.words.length} từ</span><span class="pill due">⏰ ${x.due} cần ôn</span><span class="pill master">✅ ${x.master} thuộc</span>${x.hard ? `<span class="pill hard">🔥 ${x.hard} khó</span>` : ""}</div><div class="small" style="margin-top:7px">Học gần nhất: ${fmt(s.lastStudiedAt)} · ${s.testHistory?.length || 0} bài kiểm tra</div></div><div class="actions"><button class="btn sec" onclick="startLearn('${s.id}')">Luyện viết</button><button class="btn ghost" onclick="startFlash('${s.id}')">Flashcard</button><button class="btn pri" onclick="openTest('${s.id}')">Kiểm tra</button></div></div>`;
}

let selectedSetIds = new Set();

function updateBulkSetBar(){
  selectedSetIds = new Set([...selectedSetIds].filter(id=>sets.some(s=>s.id===id)));
  let el=document.getElementById("bulkSetCount");
  if(el)el.textContent=`${selectedSetIds.size} bộ đã chọn`;
}
function toggleSetSelection(id,checked){
  if(checked)selectedSetIds.add(id); else selectedSetIds.delete(id);
  updateBulkSetBar();
}
function visibleLibrarySetIds(){
  let q=norm(document.getElementById("librarySearch")?.value);
  return sets.filter(s=>
    (activeFolder==="Tất cả"||(s.folder||"Chưa phân loại")===activeFolder) &&
    (!q||norm(s.name).includes(q)||s.words.some(w=>norm(w.word).includes(q)||norm(w.meaning).includes(q)))
  ).map(s=>s.id);
}
function selectAllVisibleSets(){
  visibleLibrarySetIds().forEach(id=>selectedSetIds.add(id));
  renderLibrary();
}
function clearSelectedSets(){
  selectedSetIds.clear();
  renderLibrary();
}
function moveSelectedSetsToFolder(){
  if(!selectedSetIds.size)return alert("Hãy chọn ít nhất 1 bộ đề.");
  let existing=folderNames().filter(x=>x!=="Tất cả");
  let hint=existing.length?`\nFolder hiện có: ${existing.join(", ")}`:"";
  let name=prompt(`Nhập tên folder muốn chuyển ${selectedSetIds.size} bộ đề vào:${hint}`,"");
  if(!name?.trim())return;
  name=name.trim();
  registerFolder(name);
  let moved=0,now=Date.now();
  sets.forEach(s=>{
    if(selectedSetIds.has(s.id)){
      s.folder=name;
      s.updatedAt=now;
      moved++;
    }
  });
  persist();
  activeFolder="Tất cả";
  selectedSetIds.clear();
  renderLibrary();
  renderHome();
  alert(`Đã chuyển ${moved} bộ đề vào folder "${name}".`);
}
function toggleBulkAddWords(force=null){
  let box=document.getElementById("bulkAddWordsBox");
  if(!box)return;
  let open=force===null?box.style.display==="none":!!force;
  box.style.display=open?"block":"none";
  if(!open){
    let msg=document.getElementById("bulkAddWordsMsg");
    if(msg)msg.innerHTML="";
  }
  if(open)setTimeout(()=>document.getElementById("bulkAddWordsText")?.focus(),60);
}
function previewBulkAddWords(){
  let r=parseVocabulary(document.getElementById("bulkAddWordsText")?.value||"");
  let s=sets.find(x=>x.id===manageId);
  let existing=new Set((s?.words||[]).map(w=>norm(w.word)+"|"+norm(w.meaning)));
  let fresh=r.words.filter(w=>!existing.has(norm(w.word)+"|"+norm(w.meaning)));
  let duplicates=r.words.length-fresh.length;
  let msg=document.getElementById("bulkAddWordsMsg");
  if(!msg)return;
  msg.innerHTML=
    `<div class="alert ${fresh.length?"okay":"err"}">Nhận diện ${r.words.length} từ · Có thể thêm ${fresh.length} từ mới${duplicates?` · Bỏ qua ${duplicates} từ trùng`:""}.</div>`+
    (r.errors.length?`<div class="alert err">Không đọc được dòng: ${r.errors.slice(0,10).join(", ")}</div>`:"")+
    (fresh.length?`<div class="bulk-preview-list">${fresh.slice(0,20).map(w=>`<span class="bulk-preview-chip">${esc(w.word)} · ${esc(w.meaning)}</span>`).join("")}${fresh.length>20?`<span class="bulk-preview-chip">+${fresh.length-20} từ nữa</span>`:""}</div>`:"");
}
function confirmBulkAddWords(){
  syncManagedInputs();
  let s=sets.find(x=>x.id===manageId);
  if(!s)return;
  let r=parseVocabulary(document.getElementById("bulkAddWordsText")?.value||"");
  if(!r.words.length)return alert("Không có từ hợp lệ để thêm.");
  let existing=new Set(s.words.map(w=>norm(w.word)+"|"+norm(w.meaning)));
  let fresh=r.words.filter(w=>{
    let key=norm(w.word)+"|"+norm(w.meaning);
    if(existing.has(key))return false;
    existing.add(key);
    return true;
  });
  if(!fresh.length)return alert("Các từ nhận diện được đều đã có trong bộ đề.");
  s.words.push(...fresh.map(upgradeWord));
  s.updatedAt=Date.now();
  persist();
  document.getElementById("bulkAddWordsText").value="";
  toggleBulkAddWords(false);
  renderManagedWords();
  renderHome();
  alert(`Đã thêm ${fresh.length} từ vào bộ đề "${s.name}".`);
}
function renderLibrary() {
  let q = norm(document.getElementById("librarySearch")?.value);
  let filtered = sets.filter(
    (s) =>
      (activeFolder === "Tất cả" ||
        (s.folder || "Chưa phân loại") === activeFolder) &&
      (!q ||
        norm(s.name).includes(q) ||
        s.words.some(
          (w) => norm(w.word).includes(q) || norm(w.meaning).includes(q),
        )),
  );
  document.getElementById("libraryCount").textContent =
    `${filtered.length}/${sets.length} bộ`;
  document.getElementById("libraryList").innerHTML = filtered.length
    ? filtered
        .map((s) => {
          let x = statusCounts(s),
            pc = s.words.length
              ? Math.round((x.master / s.words.length) * 100)
              : 0;
          return `<div class="card set"><div style="min-width:240px;flex:1"><div class="set-select-wrap"><input class="set-select" type="checkbox" ${selectedSetIds.has(s.id)?"checked":""} onchange="toggleSetSelection('${s.id}',this.checked)" title="Chọn bộ đề"><span class="pill">📁 ${esc(s.folder || "Chưa phân loại")}</span></div><h4 style="margin-top:10px">${esc(s.name)}</h4><div class="meta"><span>📘 ${s.words.length} từ</span><span>⏰ ${x.due} đến hạn</span><span>✅ ${x.master} thuộc</span><span>🔥 ${frequentMistakeWordsForSet(s).length} hay sai</span><span>🕘 ${fmt(s.lastStudiedAt)}</span></div><div class="metric-track" style="max-width:420px"><i style="width:${pc}%;background:#45c477"></i></div></div><div class="actions"><button class="btn sec" onclick="startLearn('${s.id}')">✎ Luyện viết</button><button class="btn ghost" onclick="startFlash('${s.id}')">▢ Flashcard</button><button class="btn pri" onclick="openTest('${s.id}')">☑ Kiểm tra</button><button class="btn ghost" onclick="moveSetFolder('${s.id}')">📁</button><button class="btn ghost" onclick="manageSet('${s.id}')">✏️</button><button class="btn ghost" onclick="openHistory('${s.id}')">🕘</button><button class="btn danger" onclick="deleteSet('${s.id}')">Xóa</button></div></div>`;
        })
        .join("")
    : '<div class="card empty">Không tìm thấy dữ liệu phù hợp.</div>';
  renderFolderBar();
  fillPracticeSetSelect();

  updateBulkSetBar();
}
function renderReview() {
  let a = aggregate(),
    hard = allWords().filter((w) => w.status === "hard").length,
    wrong = allWords().filter((w) => (w.wrong || 0) > 0).length,
    frequent = allWords().filter(isFrequentMistake).length;
  document.getElementById("reviewSummary").innerHTML =
    `<div class="card stat"><div class="k">ĐẾN HẠN</div><div class="v">${a.due}</div><div class="h">Theo lịch SRS</div></div><div class="card stat"><div class="k">🔥 TỪ HAY SAI</div><div class="v">${frequent}</div><div class="h">Sai/bỏ qua ≥3 lần hoặc 3/10 lượt gần nhất</div></div><div class="card stat"><div class="k">TỪ KHÓ</div><div class="v">${hard}</div><div class="h">Đang cần ưu tiên luyện</div></div>`;
  let ss = sets.filter((s) => dueWords(s).length);
  document.getElementById("reviewSets").innerHTML = ss.length
    ? ss
        .map((s) => {
          let n = dueWords(s).length;
          return `<div class="card set"><div><h4>${esc(s.name)}</h4><div class="meta"><span class="pill due">⏰ ${n} từ đến hạn</span><span>❌ ${s.words.filter((w) => (w.wrong || 0) > 0).length} từng sai</span><span>🔥 ${s.words.filter((w) => w.status === "hard").length} khó</span></div></div><div class="actions"><button class="btn pri" onclick="startLearn('${s.id}',true)">Ôn SRS</button><button class="btn ghost" onclick="startHardReview('${s.id}')">Ôn Sai/Khó</button></div></div>`;
        })
        .join("")
    : '<div class="card empty"><div class="emo">🎉</div>Không còn từ nào đến hạn theo SRS lúc này.</div>';
  let current = document.getElementById("weakSetSelect")?.value || "";
  populateWeakSetSelect(current);
  renderWeakReviewPreview();
}
function startDueReview() {
  let due = [];
  sets.forEach((s) =>
    due.push(...dueWords(s).map((w) => ({ setId: s.id, wordId: w.id }))),
  );
  if (!due.length) return showScreen("review");
  let grouped = due.reduce(
      (m, x) => ((m[x.setId] = (m[x.setId] || 0) + 1), m),
      {},
    ),
    best = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0][0];
  startLearn(best, true);
}

function ensureWritingProgress(s) {
  if (!s.writingProgress || typeof s.writingProgress !== "object")
    s.writingProgress = {};
  if (!Array.isArray(s.writingProgress["vi-en"]))
    s.writingProgress["vi-en"] = [];
  if (!Array.isArray(s.writingProgress["en-vi"]))
    s.writingProgress["en-vi"] = [];
  return s.writingProgress;
}
function writingDoneIds(s, mode) {
  let p = ensureWritingProgress(s);
  return new Set(p[mode] || []);
}
function writingStats(s, mode) {
  let done = writingDoneIds(s, mode);
  let valid = s.words.filter((w) => done.has(w.id)).length;
  return {
    done: valid,
    total: s.words.length,
    remaining: Math.max(0, s.words.length - valid),
  };
}
function markWritingDone(s, w, mode) {
  let p = ensureWritingProgress(s);
  if (!p[mode].includes(w.id)) p[mode].push(w.id);
  s.writingProgressUpdatedAt = Date.now();
}
function pickLearnWords(s, dueOnly = false, mode = "vi-en") {
  if (dueOnly) {
    let pool = dueWords(s);
    if (!pool.length) pool = s.words;
    return shuffle(pool).slice(0, 5);
  }
  let done = writingDoneIds(s, mode);
  return s.words.filter((w) => !done.has(w.id)).slice(0, 5);
}
function startLearn(id, dueOnly = false) {
  let s = sets.find((x) => x.id === id);
  if (!s) return;
  let mode = localStorage.getItem("vocabflow_learn_mode") || "vi-en";
  ensureWritingProgress(s);
  s.lastStudiedAt = Date.now();
  persist();
  learnSession = {
    setId: id,
    queue: pickLearnWords(s, dueOnly, mode),
    idx: 0,
    wrongQueue: [],
    answered: 0,
    dueOnly,
    mode,
  };
  document.getElementById("learnTitle").textContent = s.name + " · Luyện viết";
  showScreen("learn");
  renderLearn();
}
function setLearnMode(mode) {
  if (!learnSession) return;
  learnSession.mode = mode;
  safeStorageSet("vocabflow_learn_mode", mode,"chế độ luyện viết");
  if (learnSession.smartQueue) {
    renderLearn();
    return;
  }
  let s = sets.find((x) => x.id === learnSession.setId);
  learnSession.queue = pickLearnWords(s, learnSession.dueOnly, mode);
  learnSession.idx = 0;
  learnSession.wrongQueue = [];
  renderLearn();
}
function updateLearnModeButtons() {
  if (!learnSession) return;
  let a = document.getElementById("modeViEn"),
    b = document.getElementById("modeEnVi"),
    vi = learnSession.mode !== "en-vi";
  if (a) a.className = "btn " + (vi ? "sec" : "ghost");
  if (b) b.className = "btn " + (!vi ? "sec" : "ghost");
}
function renderLearn() {
  let s = sets.find((x) => x.id === learnSession.setId),
    q = learnSession.queue[learnSession.idx];
  updateLearnModeButtons();
  let st = writingStats(s, learnSession.mode),
    modeName = learnSession.mode === "en-vi" ? "Anh → Việt" : "Việt → Anh";

  if (!q) {
    if (learnSession.wrongQueue.length) {
      learnSession.queue = [...learnSession.wrongQueue];
      learnSession.wrongQueue = [];
      learnSession.idx = 0;
      return renderLearn();
    }

    document.getElementById("learnBar").style.width = "100%";

    if (learnSession.smartQueue) {
      document.getElementById("learnProgressText").textContent = "Hoàn thành Smart Daily";

      if (learnSession.periodicWrongReview) {
        let left=(learnSession.periodicWrongGroups||[]).length;
        document.getElementById("learnBox").innerHTML =
          `<div style="font-size:44px">🔥</div>
           <h2>Đã ôn nhóm từ sai</h2>
           <p class="subtle">Các từ vừa ôn đã được cập nhật lại SRS và Từ Hay Sai.</p>
           <div class="actions" style="justify-content:center">
             ${left?`<button class="btn pri" onclick="continuePeriodicWrongReview()">Tiếp tục bộ tiếp theo →</button>`:""}
             <button class="btn ghost" onclick="finishSmartQueue(false)">Về trang chủ</button>
           </div>`;
        return;
      }

      if (learnSession.mistakeFolderReview) {
        let left=(learnSession.mistakeFolderGroups||[]).length;
        document.getElementById("learnBox").innerHTML =
          `<div style="font-size:44px">🔥</div>
           <h2>Hoàn thành nhóm Từ Hay Sai</h2>
           <p class="subtle">Đã cập nhật lại mức độ ghi nhớ trong Folder <b>${esc(learnSession.mistakeFolder||"")}</b>.</p>
           <div class="actions" style="justify-content:center">
             ${left?`<button class="btn pri" onclick="continueFolderMistakeReview()">Tiếp tục bộ tiếp theo →</button>`:""}
             <button class="btn ghost" onclick="finishSmartQueue(false)">Về trang chủ</button>
           </div>`;
        return;
      }

      let next=getSmartDailyPlan();
      document.getElementById("learnBox").innerHTML =
        `<div style="font-size:44px">✅</div>
         <h2>Hoàn thành lượt Smart Daily</h2>
         <p class="subtle">SRS và tiến độ hôm nay đã được cập nhật tự động.${next?` Lượt tiếp theo sẽ ưu tiên <b>${smartPhaseLabel(next.phase)}</b> trong <b>${esc(next.s.name)}</b>.`:""}</p>
         <div class="actions" style="justify-content:center">
           ${next?'<button class="btn pri" onclick="finishSmartQueue(true)">Tiếp tục bài học hôm nay →</button>':""}
           <button class="btn ghost" onclick="finishSmartQueue(false)">Về trang chủ</button>
         </div>`;
      return;
    }

    let remaining = learnSession.dueOnly ? 0 : st.remaining;
    document.getElementById("learnProgressText").textContent =
      learnSession.dueOnly
        ? "Hoàn thành lượt ôn đến hạn"
        : `${modeName} · Đã luyện ${st.done}/${st.total} từ`;
    if (!learnSession.dueOnly && remaining > 0) {
      document.getElementById("learnBox").innerHTML =
        `<div style="font-size:44px">✅</div><h2>Hoàn thành 5 từ</h2><p class="subtle">Tiến độ ${modeName}: <b>${st.done}/${st.total}</b>. Lần sau mở bộ này, app sẽ tiếp tục từ các từ chưa luyện.</p><div class="actions" style="justify-content:center"><button class="btn pri" onclick="continueWritingBatch()">Học 5 từ kế tiếp →</button><button class="btn ghost" onclick="exitLearn()">Dừng tại đây</button></div>`;
    } else if (!learnSession.dueOnly) {
      document.getElementById("learnBox").innerHTML =
        `<div style="font-size:44px">🏆</div><h2>Đã luyện hết bộ từ</h2><p class="subtle">Bạn đã hoàn thành <b>${st.total}/${st.total}</b> từ ở chế độ ${modeName}. Có thể reset để luyện lại từ đầu.</p><div class="actions" style="justify-content:center"><button class="btn pri" onclick="resetWritingProgress(true)">↺ Reset và học lại</button><button class="btn ghost" onclick="exitLearn()">Về trang chủ</button></div>`;
    } else {
      document.getElementById("learnBox").innerHTML =
        `<div style="font-size:44px">🎯</div><h2>Hoàn thành lượt ôn</h2><p class="subtle">Những từ vừa trả lời đã được cập nhật lịch ôn SRS.</p><div class="actions" style="justify-content:center"><button class="btn pri" onclick="startLearn('${s.id}',true)">Lượt ôn mới</button><button class="btn ghost" onclick="exitLearn()">Về trang chủ</button></div>`;
    }
    return;
  }

  let viEn = learnSession.mode !== "en-vi";
  let batchPos = learnSession.idx + 1;
  document.getElementById("learnProgressText").textContent =
    learnSession.smartQueue
      ? `Smart Daily · ${smartPhaseLabel(learnSession.smartPhase)} · Từ ${batchPos}/${learnSession.queue.length}`
      : learnSession.dueOnly
        ? `Từ ${batchPos}/${learnSession.queue.length} · ${posLabel(q.pos)}`
        : `${modeName} · Đã luyện ${st.done}/${st.total} · Từ ${batchPos}/${learnSession.queue.length}`;

  document.getElementById("learnBar").style.width =
    `${(learnSession.idx / Math.max(1, learnSession.queue.length)) * 100}%`;

  document.getElementById("learnBox").innerHTML = viEn
    ? `<div class="pill">${learnSession.smartQueue?`${smartPhaseIcon(learnSession.smartPhase)} ${smartPhaseLabel(learnSession.smartPhase)} · `:""}🇻🇳 Nghĩa tiếng Việt → viết tiếng Anh</div><div class="meaning">${esc(q.meaning)}</div><input id="learnAnswer" class="answer" autocomplete="off" placeholder="Nhập từ tiếng Anh..."><div id="learnFeedback"></div><div class="actions" style="justify-content:center;margin-top:15px"><button class="btn pri" onclick="checkLearn()">Kiểm tra</button><button class="btn ghost" onclick="skipLearnWord()">⏭ Bỏ qua</button><button class="btn ghost" onclick="speak('${encodeURIComponent(q.word)}')">🔊 Nghe</button></div>`
    : `<div class="pill">${learnSession.smartQueue?`${smartPhaseIcon(learnSession.smartPhase)} ${smartPhaseLabel(learnSession.smartPhase)} · `:""}🇬🇧 Từ tiếng Anh → viết nghĩa tiếng Việt</div><div class="meaning">${esc(q.word)}</div><div class="subtle" style="margin-top:-10px;margin-bottom:15px">${esc(q.ipa || "")}</div><input id="learnAnswer" class="answer" autocomplete="off" placeholder="Nhập nghĩa tiếng Việt..."><div id="learnFeedback"></div><div class="actions" style="justify-content:center;margin-top:15px"><button class="btn pri" onclick="checkLearn()">Kiểm tra</button><button class="btn ghost" onclick="skipLearnWord()">⏭ Bỏ qua</button><button class="btn ghost" onclick="speak('${encodeURIComponent(q.word)}')">🔊 Nghe từ</button></div>`;

  let i = document.getElementById("learnAnswer");
  i.focus();
  i.onkeydown = (e) => {
    if (e.key === "Enter") checkLearn();
  };
}
function continueWritingBatch() {
  let s = sets.find((x) => x.id === learnSession.setId);
  learnSession.queue = pickLearnWords(s, false, learnSession.mode);
  learnSession.idx = 0;
  learnSession.wrongQueue = [];
  renderLearn();
}
function resetWritingProgress(startAgain = false) {
  if (!learnSession) return;
  let s = sets.find((x) => x.id === learnSession.setId);
  if (!s) return;
  let mode = learnSession.mode;
  let label = mode === "en-vi" ? "Anh → Việt" : "Việt → Anh";
  if (
    !confirm(
      `Reset tiến độ Luyện viết ${label}? Các từ sẽ được học lại từ đầu. Thống kê SRS và Flashcard không bị xóa.`,
    )
  )
    return;
  ensureWritingProgress(s)[mode] = [];
  s.writingProgressUpdatedAt = Date.now();
  persist();
  learnSession.queue = pickLearnWords(s, false, mode);
  learnSession.idx = 0;
  learnSession.wrongQueue = [];
  learnSession.dueOnly = false;
  renderLearn();
}
function meaningAnswerOK(input, meaning) {
  let a = norm(input),
    targets = String(meaning || "")
      .split(/[,;/]|(?:\s+\bor\b\s+)/i)
      .map(norm)
      .filter(Boolean);
  if (!a) return false;
  if (a === norm(meaning)) return true;
  return targets.some((x) => a === x);
}
function checkLearn() {
  let s = sets.find((x) => x.id === learnSession.setId),
    w = learnSession.queue[learnSession.idx],
    input = document.getElementById("learnAnswer");
  if (!input) return;
  let viEn = learnSession.mode !== "en-vi";
  let ok = viEn
    ? norm(input.value) === norm(w.word)
    : meaningAnswerOK(input.value, w.meaning);
  s.totalAttempts++;
  if (ok) {
    recordWordLearningOutcome(w, "correct", "writing");
    reviewWord(w, "good");
    if (!learnSession.dueOnly) markWritingDone(s, w, learnSession.mode);
    document.getElementById("learnFeedback").innerHTML =
      `<div class="feedback good"><b>✅ Chính xác!</b><br><b>${esc(w.word)}</b> · ${esc(w.ipa)}<br>${esc(w.meaning)}<br><span class="subtle">Lịch ôn tiếp theo: ${fmt(w.dueAt)}</span></div>`;
  } else {
    recordWordLearningOutcome(w, "wrong", "writing");
    reviewWord(w, "again");
    learnSession.wrongQueue.push(w);
    document.getElementById("learnFeedback").innerHTML =
      `<div class="feedback bad"><b>❌ Chưa đúng</b><br>${viEn ? "Từ tiếng Anh" : "Nghĩa đúng"}: <b>${esc(viEn ? w.word : w.meaning)}</b>${viEn ? " · " + esc(w.ipa) : ""}<br><span class="subtle">${isFrequentMistake(w)?`🔥 Đã ghi nhận vào Từ Hay Sai · ${w.mistakeCount} lần quên/sai.`:"Từ này sẽ quay lại trong lượt sau."}</span></div>`;
  }
  s.updatedAt = Date.now();
  persist();
  input.disabled = true;
  let actions = document.querySelector("#learnBox .actions");
  actions.innerHTML = `<button class="btn pri" onclick="nextLearn()">Tiếp tục →</button><button class="btn ghost" onclick="speak('${encodeURIComponent(w.word)}')">🔊 Phát âm</button><span class="subtle" style="align-self:center">⌨️ Space: từ tiếp theo</span>`;
}

function skipLearnWord(){
  if(!learnSession)return;
  let s=sets.find(x=>x.id===learnSession.setId),
      w=learnSession.queue[learnSession.idx],
      input=document.getElementById("learnAnswer");
  if(!s||!w||!input||input.disabled)return;

  recordWordLearningOutcome(w,"skip","skip");
  reviewWord(w,"again");
  s.totalAttempts++;
  s.updatedAt=Date.now();
  if(!learnSession.wrongQueue.some(x=>x.id===w.id))learnSession.wrongQueue.push(w);
  persist();

  input.disabled=true;
  document.getElementById("learnFeedback").innerHTML=
    `<div class="feedback bad"><b>⏭ Đã bỏ qua</b><br>Đáp án: <b>${esc(learnSession.mode==="en-vi"?w.meaning:w.word)}</b>${learnSession.mode!=="en-vi"?" · "+esc(w.ipa):""}<br><span class="subtle">Bỏ qua được tính là 1 lần quên. ${isFrequentMistake(w)?"🔥 Từ này đang thuộc nhóm Từ Hay Sai.":"Từ này sẽ quay lại trong lượt sau."}</span></div>`;
  let actions=document.querySelector("#learnBox .actions");
  actions.innerHTML=`<button class="btn pri" onclick="nextLearn()">Tiếp tục →</button><button class="btn ghost" onclick="speak('${encodeURIComponent(w.word)}')">🔊 Phát âm</button><span class="subtle" style="align-self:center">⌨️ Space: từ tiếp theo</span>`;
}

function nextLearn() {
  learnSession.idx++;
  renderLearn();
}
function exitLearn() {
  learnSession = null;
  showScreen("home");
}
function startFlash(id) {
  let s = sets.find((x) => x.id === id);
  if (!s) return;
  s.lastStudiedAt = Date.now();
  persist();
  let ws = shuffle(dueWords(s).length ? dueWords(s) : s.words);
  flashSession = {
    setId: id,
    words: ws,
    idx: 0,
    back: false,
    reviewQueue: [],
    round: 1,
  };
  document.getElementById("flashTitle").textContent = s.name + " · Flashcard";
  showScreen("flash");
  renderFlash();
}
function renderFlash() {
  let w = flashSession.words[flashSession.idx];
  if (!w) {
    let n = flashSession.reviewQueue.length;
    document.getElementById("flashBar").style.width = "100%";
    document.getElementById("flashProgress").textContent =
      `Hoàn thành vòng ${flashSession.round}`;
    document.getElementById("flashCard").innerHTML =
      `<div><div style="font-size:44px">${n ? "🔁" : "🌟"}</div><h2>${n ? "Bạn còn " + n + " thẻ cần ôn lại" : "Hoàn thành Flashcard"}</h2><p class="subtle">${n ? "Các thẻ bạn chọn Quên hoặc Khó đã được gom lại để ôn ngay." : "Tuyệt! Không còn thẻ Quên/Khó trong vòng này."}</p></div>`;
    document.getElementById("flashRate").innerHTML = n
      ? `<button class="btn pri" onclick="reviewHardFlash()">🔁 Ôn lại ngay ${n} thẻ</button><button class="btn ghost" onclick="exitFlash()">Kết thúc</button>`
      : '<button class="btn pri" onclick="exitFlash()">Về trang chủ</button>';
    return;
  }
  document.getElementById("flashProgress").textContent =
    `Vòng ${flashSession.round} · Thẻ ${flashSession.idx + 1}/${flashSession.words.length} · ${posLabel(w.pos)}`;
  document.getElementById("flashBar").style.width =
    `${(flashSession.idx / flashSession.words.length) * 100}%`;
  document.getElementById("flashCard").innerHTML = flashSession.back
    ? `<div><div class="meaning2">${esc(w.meaning)}</div><div class="frontword">${esc(w.word)}</div><div class="ipa">${esc(w.ipa)} · ${posLabel(w.pos)}</div>${w.example ? `<div class="example">${esc(w.example)}</div>` : ""}</div><div class="hintflip">Nhấn thẻ để xem mặt trước</div>`
    : `<div><div class="frontword">${esc(w.word)}</div><div class="ipa">${esc(w.ipa)}</div><div style="margin-top:15px"><button class="btn ghost" onclick="event.stopPropagation();speak('${encodeURIComponent(w.word)}')">🔊 Phát âm</button></div></div><div class="hintflip">Nhấn thẻ để xem nghĩa</div>`;
  document.getElementById("flashRate").innerHTML = flashSession.back
    ? `<button class="btn danger" onclick="rateFlash('again')">Quên</button><button class="btn ghost" onclick="rateFlash('hard')">Khó</button><button class="btn sec" onclick="rateFlash('good')">Nhớ</button><button class="btn ok" onclick="rateFlash('easy')">Rất dễ</button>`
    : "";
}
function flipFlash() {
  flashSession.back = !flashSession.back;
  renderFlash();
}
function rateFlash(r) {
  let s = sets.find((x) => x.id === flashSession.setId),
    w = flashSession.words[flashSession.idx];
  if (r === "again") recordWordLearningOutcome(w, "wrong", "flashcard");
  else if (r === "good" || r === "easy") recordWordLearningOutcome(w, "correct", "flashcard");
  reviewWord(w, r);
  if (r === "again" || r === "hard") {
    if (!flashSession.reviewQueue.some((x) => x.id === w.id))
      flashSession.reviewQueue.push(w);
  }
  s.totalAttempts++;
  s.updatedAt = Date.now();
  persist();
  flashSession.idx++;
  flashSession.back = false;
  renderFlash();
}
function reviewHardFlash() {
  if (!flashSession || !flashSession.reviewQueue.length) return;
  flashSession.words = shuffle(flashSession.reviewQueue.slice());
  flashSession.reviewQueue = [];
  flashSession.idx = 0;
  flashSession.back = false;
  flashSession.round = (flashSession.round || 1) + 1;
  renderFlash();
}
function exitFlash() {
  flashSession = null;
  showScreen("home");
}
function contextFor(w, i = 0) {
  let arr = WORD_CONTEXTS[norm(w.word)] || CTX[w.pos] || CTX.other;
  return arr[i % arr.length];
}
function makeWordChoices(s, w) {
  let p = shuffle(s.words.filter((x) => x.id !== w.id))
    .slice(0, 3)
    .map((x) => x.word);
  return shuffle([w.word, ...p]);
}
function makeMeaningChoices(s, w) {
  let p = shuffle(s.words.filter((x) => x.id !== w.id))
    .slice(0, 3)
    .map((x) => x.meaning);
  return shuffle([w.meaning, ...p]);
}
function openTest(id) {
  let s = sets.find((x) => x.id === id);
  if (!s) return;
  document.getElementById("testConfig").style.display = "flex";
  testSession = { setId: id, started: false, count: 40, questions: [], idx: 0 };
  document.getElementById("testTitle").textContent = s.name + " · Kiểm tra";
  document.getElementById("testConfig").innerHTML =
    `<b>Tạo đề mới</b><span class="subtle">Số câu:</span><select id="testCount"><option>10</option><option>20</option><option selected>40</option><option>50</option></select><span class="subtle">Dạng câu:</span><span class="pill">Điền ngữ cảnh</span><span class="pill">Việt → Anh</span><span class="pill">Anh → Việt</span><span class="pill">IPA → Từ</span><span class="pill">Nghe → Viết</span><button class="btn pri" onclick="beginTest()">Bắt đầu</button>`;
  document.getElementById("testBox").innerHTML =
    '<div class="empty"><div class="emo">📝</div>Chọn số câu rồi bắt đầu. Đề sẽ trộn 5 dạng câu hỏi.</div>';
  document.getElementById("testProgressWrap").style.display = "none";
  showScreen("test");
}
function generateTest(s, count) {
  let types = ["cloze", "vi2en", "en2vi", "ipa", "listen"],
    q = [];
  for (let i = 0; i < count; i++) {
    let w = s.words[i % s.words.length],
      type = types[i % types.length],
      o = {
        id: uid(),
        type,
        wordId: w.id,
        correct: type === "en2vi" ? w.meaning : w.word,
        answer: "",
        word: w.word,
        meaning: w.meaning,
        ipa: w.ipa,
        pos: w.pos,
      };
    if (type === "cloze") o.prompt = contextFor(w, i);
    if (type === "vi2en") {
      o.prompt = `Từ tiếng Anh nào có nghĩa là “${w.meaning}”?`;
      o.choices = makeWordChoices(s, w);
    }
    if (type === "en2vi") {
      o.prompt = `“${w.word}” có nghĩa là gì?`;
      o.choices = makeMeaningChoices(s, w);
    }
    if (type === "ipa") {
      o.prompt = `Từ nào có phiên âm ${w.ipa}?`;
      o.choices = makeWordChoices(s, w);
    }
    if (type === "listen") o.prompt = "Nghe phát âm và nhập từ bạn nghe được.";
    q.push(o);
  }
  return shuffle(q);
}
function beginTest() {
  let s = sets.find((x) => x.id === testSession.setId),
    count = +document.getElementById("testCount").value;
  if (!s.words.length) return;
  testSession = {
    ...testSession,
    started: true,
    count,
    questions: generateTest(s, count),
    idx: 0,
  };
  s.lastStudiedAt = Date.now();
  persist();
  document.getElementById("testConfig").style.display = "none";
  document.getElementById("testProgressWrap").style.display = "block";
  renderTest();
}
function renderTest() {
  if (testSession?.periodic) return renderPeriodicTest();
  let q = testSession.questions[testSession.idx],
    total = testSession.questions.length,
    answered = testSession.questions.filter((x) => norm(x.answer)).length;
  document.getElementById("testProgressText").textContent =
    `Câu ${testSession.idx + 1}/${total} · Đã trả lời ${answered}`;
  document.getElementById("testBar").style.width =
    `${(testSession.idx / total) * 100}%`;
  let label = {
      cloze: "✍️ Điền ngữ cảnh",
      vi2en: "🇻🇳 → 🇬🇧",
      en2vi: "🇬🇧 → 🇻🇳",
      ipa: "🔤 IPA → Từ",
      listen: "🔊 Nghe → Viết",
    }[q.type],
    body = `<div class="pill">${label}</div><div class="testprompt">${esc(q.prompt)}</div>`;
  if (q.type === "cloze")
    body += `<div class="help">Gợi ý nghĩa: <b>${esc(q.meaning)}</b> · ${posLabel(q.pos)}</div><input id="testInput" class="answer" value="${esc(q.answer)}" placeholder="Nhập từ còn thiếu...">`;
  else if (q.type === "listen")
    body += `<div style="text-align:center;margin:18px"><button class="btn sec" onclick="speak('${encodeURIComponent(q.word)}')">🔊 Phát âm</button></div><input id="testInput" class="answer" value="${esc(q.answer)}" placeholder="Nhập từ bạn nghe được...">`;
  else
    body += `<div class="choices">${q.choices.map((c) => `<button class="choice ${norm(q.answer) === norm(c) ? "selected" : ""}" onclick="chooseTest('${encodeURIComponent(c)}')">${esc(c)}</button>`).join("")}</div>`;
  body += `<div class="testnav"><button class="btn ghost" onclick="prevTest()" ${testSession.idx === 0 ? "disabled" : ""}>← Trước</button><span class="subtle">Có thể quay lại sửa trước khi nộp</span>${testSession.idx === total - 1 ? '<button class="btn pri" onclick="submitTest()">Nộp bài</button>' : '<button class="btn pri" onclick="nextTest()">Tiếp →</button>'}</div>`;
  document.getElementById("testBox").innerHTML = body;
  let i = document.getElementById("testInput");
  if (i) {
    i.focus();
    i.oninput = () => (q.answer = i.value);
    i.onkeydown = (e) => {
      if (e.key === "Enter") nextTest();
    };
  }
}
function chooseTest(x) {
  testSession.questions[testSession.idx].answer = decodeURIComponent(x);
  renderTest();
}
function saveTestInput() {
  let i = document.getElementById("testInput");
  if (i) testSession.questions[testSession.idx].answer = i.value;
}
function nextTest() {
  saveTestInput();
  if (testSession.idx < testSession.questions.length - 1) {
    testSession.idx++;
    renderTest();
  }
}
function prevTest() {
  saveTestInput();
  if (testSession.idx > 0) {
    testSession.idx--;
    renderTest();
  }
}
function submitTest() {
  if (testSession?.periodic) return submitPeriodicReview();
  saveTestInput();
  let s = sets.find((x) => x.id === testSession.setId),
    wrong = [],
    correct = 0;
  testSession.questions.forEach((q) => {
    let ok = norm(q.answer) === norm(q.correct);
    q.ok = ok;
    if (ok) correct++;
    else wrong.push(q);
    let w = s.words.find((x) => x.id === q.wordId);
    s.totalAttempts++;
    if (ok) {
      recordWordLearningOutcome(w, "correct", "test");
      reviewWord(w, "good");
    } else {
      recordWordLearningOutcome(w, "wrong", "test");
      reviewWord(w, "again");
    }
  });
  let total = testSession.questions.length,
    score = Math.round((correct / total) * 100),
    entry = {
      id: uid(),
      date: Date.now(),
      score,
      correct,
      total,
      wrong: wrong.map((q) => ({
        wordId: q.wordId,
        prompt: q.prompt,
        answer: q.answer,
        correct: q.correct,
        type: q.type,
      })),
    };
  s.testHistory.unshift(entry);
  s.testHistory = s.testHistory.slice(0, 100);
  s.lastStudiedAt = Date.now();
  s.updatedAt = Date.now();
  recordDailyTest();
  persist();
  document.getElementById("testProgressText").textContent =
    `Hoàn thành · ${correct}/${total} đúng`;
  document.getElementById("testBar").style.width = "100%";
  document.getElementById("testBox").innerHTML =
    `<div style="text-align:center"><div style="font-size:48px">${score >= 80 ? "🏆" : score >= 60 ? "🎯" : "📚"}</div><h2>${score}%</h2><p class="subtle">${correct}/${total} câu đúng · ${wrong.length} câu sai</p></div>${
      wrong.length
        ? `<h3>Câu cần xem lại</h3>${wrong
            .slice(0, 20)
            .map(
              (q, i) =>
                `<div class="review"><b>${i + 1}. ${esc(q.prompt)}</b><br><span class="subtle">Bạn: ${esc(q.answer || "Chưa trả lời")} · Đúng: <b>${esc(q.correct)}</b></span></div>`,
            )
            .join("")}`
        : '<div class="alert okay">Xuất sắc! Không có câu sai.</div>'
    }<div class="actions" style="justify-content:center;margin-top:16px">${wrong.length ? '<button class="btn sec" onclick="redoWrong()">🔁 Làm lại câu sai</button>' : ""}<button class="btn pri" onclick="openTest('${s.id}')">Tạo đề mới</button><button class="btn ghost" onclick="exitTest()">Trang chủ</button></div>`;
  testSession.lastWrong = wrong;
}
function redoWrong() {
  let wrong = testSession.lastWrong;
  if (!wrong?.length) return;
  testSession.questions = shuffle(
    wrong.map((q) => ({ ...q, id: uid(), answer: "", ok: false })),
  );
  testSession.idx = 0;
  document.getElementById("testConfig").style.display = "none";
  document.getElementById("testProgressWrap").style.display = "block";
  renderTest();
}
function exitTest() {
  testSession = null;
  document.getElementById("testConfig").style.display = "flex";
  showScreen("home");
}
function manageSet(id) {
  manageId = id;
  let s = sets.find((x) => x.id === id);
  document.getElementById("manageTitle").textContent = "Chỉnh sửa · " + s.name;
  document.getElementById("manageSetName").value = s.name;
  showScreen("manage");
  let bulkBox=document.getElementById("bulkAddWordsBox");
  if(bulkBox)bulkBox.style.display="none";
  let bulkText=document.getElementById("bulkAddWordsText");
  if(bulkText)bulkText.value="";
  renderManagedWords();
}
function renderManagedWords() {
  let s = sets.find((x) => x.id === manageId);
  document.getElementById("manageWords").innerHTML = s.words
    .map(
      (w) =>
        `<div class="wordrow ${isFrequentMistake(w)?"frequent-wordrow":""}" data-id="${w.id}"><input class="mw-word" value="${esc(w.word)}"><input class="mw-ipa" value="${esc(w.ipa)}"><input class="mw-meaning" value="${esc(w.meaning)}"><select class="mw-pos">${POS.map(([v, l]) => `<option value="${v}" ${w.pos === v ? "selected" : ""}>${l}</option>`).join("")}</select><div class="managed-word-actions">${isFrequentMistake(w)?`<span class="frequent-word-badge" title="${esc(mistakeSourceSummary(w)||"Lịch sử cũ")}">🔥 ${w.mistakeCount} sai</span>`:""}<button class="star" onclick="toggleFav('${w.id}')" title="Yêu thích">${w.favorite ? "⭐" : "☆"}</button><button class="btn danger" onclick="removeManagedWord('${w.id}')">Xóa</button></div></div>`,
    )
    .join("");
}
function syncManagedInputs() {
  let s = sets.find((x) => x.id === manageId);
  document.querySelectorAll("#manageWords .wordrow").forEach((r) => {
    let w = s.words.find((x) => x.id === r.dataset.id);
    if (w) {
      w.word = sanitizeWordText(r.querySelector(".mw-word").value);
      w.ipa = r.querySelector(".mw-ipa").value.trim();
      w.meaning = r.querySelector(".mw-meaning").value.trim();
      w.pos = r.querySelector(".mw-pos").value;
    }
  });
}
function saveManagedSet() {
  syncManagedInputs();
  let s = sets.find((x) => x.id === manageId);
  s.name = document.getElementById("manageSetName").value.trim() || s.name;
  s.words = s.words.filter((w) => w.word && w.meaning);
  s.updatedAt = Date.now();
  persist();
  alert("Đã lưu thay đổi.");
  renderManagedWords();
  renderLibrary();
  renderHome();
  renderReview();
  renderStats();
}
function addManagedWord() {
  syncManagedInputs();
  sets
    .find((x) => x.id === manageId)
    .words.push(
      upgradeWord({ word: "new word", ipa: "/.../", meaning: "nghĩa mới" }),
    );
  renderManagedWords();
}
function removeManagedWord(id) {
  syncManagedInputs();
  let s = sets.find((x) => x.id === manageId);
  if (confirm("Xóa từ này?")) {
    s.words = s.words.filter((w) => w.id !== id);
    renderManagedWords();
  }
}
function toggleFav(id) {
  syncManagedInputs();
  let w = sets.find((x) => x.id === manageId).words.find((x) => x.id === id);
  w.favorite = !w.favorite;
  persist();
  renderManagedWords();
}
function openHistory(id) {
  historyId = id;
  let s = sets.find((x) => x.id === id);
  document.getElementById("historyTitle").textContent = "Lịch sử · " + s.name;
  showScreen("history");
  document.getElementById("historyList").innerHTML = s.testHistory.length
    ? s.testHistory
        .map(
          (h) =>
            `<div class="card historyitem"><div><b>${fmt(h.date)}</b><div class="subtle">${h.correct}/${h.total} câu đúng</div></div><div style="font-size:24px;font-weight:900">${h.score}%</div></div>`,
        )
        .join("")
    : '<div class="card empty">Bộ này chưa có bài kiểm tra nào.</div>';
}
function renderStats() {
  let a = accurateLearningStats();
  document.getElementById("statsCards").innerHTML =
    `<div class="card stat"><div class="k">ĐÃ HỌC</div><div class="v">${a.learned}/${a.total}</div><div class="h">${a.learnedPct}% kho từ đã bắt đầu học</div></div><div class="card stat"><div class="k">CHÍNH XÁC</div><div class="v">${a.accuracy}%</div><div class="h">${a.correct} đúng · ${a.wrong} sai</div></div><div class="card stat"><div class="k">🔥 TỪ HAY SAI</div><div class="v">${a.frequent}</div><div class="h">${a.due} từ đang đến hạn SRS</div></div><div class="card stat"><div class="k">ĐÃ THUỘC</div><div class="v">${a.mastered}/${a.learned}</div><div class="h">SRS level ≥ 4 · ${a.masteredPct}% từ đã học</div></div>`;
  let hard = sets
    .flatMap((s) => s.words.map((w) => ({ ...w, setName: s.name })))
    .filter((w) => w.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .slice(0, 25);
  document.getElementById("hardWords").innerHTML = hard.length
    ? `<div class="tablewrap"><table class="table"><thead><tr><th>Từ</th><th>Nghĩa</th><th>Trạng thái</th><th>Đúng</th><th>Sai</th><th>Đến hạn</th><th>Bộ</th></tr></thead><tbody>${hard.map((w) => `<tr><td><b>${esc(w.word)}</b> ${w.favorite ? "⭐" : ""}</td><td>${esc(w.meaning)}</td><td>${esc(w.status)}</td><td>${w.correct}</td><td style="color:var(--bad);font-weight:900">${w.wrong}</td><td>${fmt(w.dueAt)}</td><td>${esc(w.setName)}</td></tr>`).join("")}</tbody></table></div>`
    : '<div class="empty">Chưa có từ sai để thống kê.</div>';
}

let activeFolder = "Tất cả",
  listenSession = null;

const CUSTOM_FOLDERS_KEY = "anhba_custom_folders_v1";

function loadCustomFolders() {
  let folders = [];
  try {
    let saved = JSON.parse(localStorage.getItem(CUSTOM_FOLDERS_KEY) || "[]");
    if (Array.isArray(saved)) folders = saved.filter(x => typeof x === "string" && x.trim()).map(x => x.trim());
  } catch {}

  // Tự nhận lại các folder rỗng đã tạo bằng bản cũ.
  try {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key && key.startsWith("anhba_empty_folder_")) {
        let name = key.slice("anhba_empty_folder_".length).trim();
        if (name) folders.push(name);
      }
    }
  } catch {}

  return [...new Set(folders)];
}

function saveCustomFolders(folders) {
  let clean = [...new Set((folders || []).map(x => String(x || "").trim()).filter(Boolean))];
  return safeStorageSet(CUSTOM_FOLDERS_KEY, JSON.stringify(clean),"danh sách Folder");
}

function registerFolder(name) {
  name = String(name || "").trim();
  if (!name || name === "Tất cả") return;
  let folders = loadCustomFolders();
  if (!folders.includes(name)) {
    folders.push(name);
    saveCustomFolders(folders);
  }
}


const DELETED_FOLDERS_KEY = "anhba_deleted_folders_v1";

function loadDeletedFolders(){
  try{
    let x=JSON.parse(localStorage.getItem(DELETED_FOLDERS_KEY)||"[]");
    return Array.isArray(x)?x.filter(v=>v&&typeof v.name==="string"):[];
  }catch{return[]}
}
function saveDeletedFolders(items){
  let clean=(Array.isArray(items)?items:[])
    .filter(v=>v&&typeof v.name==="string"&&v.name.trim())
    .slice(0,50);
  return safeStorageSet(DELETED_FOLDERS_KEY,JSON.stringify(clean),"Thùng rác Folder");
}
function pushDeletedFolderSnapshot(name,setIds=[]){
  let list=loadDeletedFolders().filter(x=>norm(x.name)!==norm(name));
  list.unshift({
    id:uid(),
    name:String(name||"").trim(),
    setIds:Array.isArray(setIds)?[...new Set(setIds)]:[],
    deletedAt:Date.now()
  });
  saveDeletedFolders(list);
}
function restoreDeletedFolder(snapshotId){
  let list=loadDeletedFolders();
  let snap=list.find(x=>x.id===snapshotId);
  if(!snap)return alert("Không tìm thấy dữ liệu thư mục đã xóa.");

  let name=snap.name.trim();
  if(folderNames().some(f=>norm(f)===norm(name))){
    return alert(`Thư mục "${name}" hiện đã tồn tại.`);
  }

  registerFolder(name);

  let restored=0;
  let idSet=new Set(snap.setIds||[]);
  sets.forEach(s=>{
    if(idSet.has(s.id) && (s.folder||"Chưa phân loại")==="Chưa phân loại"){
      s.folder=name;
      s.updatedAt=Date.now();
      restored++;
    }
  });

  list=list.filter(x=>x.id!==snapshotId);
  saveDeletedFolders(list);
  activeFolder=name;
  persist();
  renderLibrary();
  renderHome();
  renderReview();
  renderStats();
  alert(`Đã khôi phục thư mục "${name}".${restored?` ${restored} bộ đề đã được đưa trở lại thư mục.`:""}`);
}
function permanentlyDeleteFolderSnapshot(snapshotId){
  let list=loadDeletedFolders();
  let snap=list.find(x=>x.id===snapshotId);
  if(!snap)return;
  if(!confirm(`Xóa vĩnh viễn lịch sử khôi phục của thư mục "${snap.name}"?`))return;
  saveDeletedFolders(list.filter(x=>x.id!==snapshotId));
  openFolderTrash();
}
function clearFolderTrash(){
  let list=loadDeletedFolders();
  if(!list.length)return alert("Không có thư mục nào trong thùng rác.");
  if(!confirm(`Xóa vĩnh viễn toàn bộ ${list.length} thư mục trong thùng rác?`))return;
  saveDeletedFolders([]);
  openFolderTrash();
}
function openFolderTrash(){
  let list=loadDeletedFolders();
  let box=document.getElementById("folderTrashBox");
  if(!box)return;
  box.style.display="block";
  box.innerHTML=list.length
    ? `<div class="section" style="margin-top:0"><h3>♻️ Thùng rác thư mục</h3><span>${list.length} thư mục có thể khôi phục</span></div>
       <div class="folder-trash-list">${list.map(x=>`<div class="folder-trash-item">
         <div><b>📁 ${esc(x.name)}</b><div class="small">Đã xóa: ${fmt(x.deletedAt)} · ${x.setIds?.length||0} bộ đề từng nằm trong thư mục</div></div>
         <div class="actions"><button class="btn sec" onclick="restoreDeletedFolder('${x.id}')">↺ Khôi phục</button><button class="btn danger" onclick="permanentlyDeleteFolderSnapshot('${x.id}')">Xóa vĩnh viễn</button></div>
       </div>`).join("")}</div>
       <div class="actions" style="justify-content:flex-end;margin-top:10px"><button class="btn ghost" onclick="clearFolderTrash()">Dọn thùng rác</button><button class="btn ghost" onclick="document.getElementById('folderTrashBox').style.display='none'">Đóng</button></div>`
    : `<div class="empty"><div class="emo">♻️</div>Chưa có thư mục nào bị xóa.<div class="actions" style="justify-content:center;margin-top:10px"><button class="btn ghost" onclick="document.getElementById('folderTrashBox').style.display='none'">Đóng</button></div></div>`;
}

function folderNames() {
  let fromSets = sets.map((s) => s.folder || "Chưa phân loại");
  let custom = loadCustomFolders();
  let merged = [...new Set([...custom, ...fromSets.filter(Boolean)])];

  // Thư mục chỉ để tổ chức kho; thứ tự học do Smart Daily Queue tự quyết định.
  let names = merged
    .filter(f => f !== "Chưa phân loại")
    .sort((a,b)=>a.localeCompare(b,"vi"));
  if (merged.includes("Chưa phân loại")) names.push("Chưa phân loại");
  return ["Tất cả", ...names];
}
function renderFolderBar() {
  let el = document.getElementById("folderBar");
  if (!el) return;
  el.innerHTML = folderNames()
    .map((f) => {
      let encoded = encodeURIComponent(f);
      let canDelete = f !== "Tất cả" && f !== "Chưa phân loại";
      return `<span class="folder-item">
        <button class="folderbtn ${activeFolder === f ? "active" : ""}" onclick="selectFolder('${encoded}')">📁 ${esc(f)}</button>
        ${canDelete ? `<button class="folder-delete" title="Xóa thư mục" onclick="event.stopPropagation();deleteFolder('${encoded}')">×</button>` : ""}
      </span>`;
    })
    .join("");
}
function selectFolder(f) {
  activeFolder = decodeURIComponent(f);
  renderLibrary();
}

function deleteFolder(nameEncoded = null) {
  let name = nameEncoded ? decodeURIComponent(nameEncoded) : activeFolder;
  if (!name || name === "Tất cả" || name === "Chưa phân loại")
    return alert("Thư mục này không thể xóa.");

  let count = sets.filter(s => (s.folder || "Chưa phân loại") === name).length;
  let msg = count
    ? `Thư mục "${name}" đang có ${count} bộ đề.\n\nXóa thư mục sẽ KHÔNG xóa bộ đề. Các bộ đề bên trong sẽ được chuyển sang "Chưa phân loại". Tiếp tục?`
    : `Xóa thư mục "${name}"?`;
  if (!confirm(msg)) return;

  let affectedIds = sets
    .filter(s => (s.folder || "Chưa phân loại") === name)
    .map(s => s.id);

  // Lưu ảnh chụp thư mục để có thể khôi phục nếu xóa nhầm.
  pushDeletedFolderSnapshot(name, affectedIds);

  sets.forEach(s => {
    if ((s.folder || "Chưa phân loại") === name) {
      s.folder = "Chưa phân loại";
      s.updatedAt = Date.now();
    }
  });

  saveCustomFolders(loadCustomFolders().filter(f => norm(f) !== norm(name)));
  try { localStorage.removeItem("anhba_empty_folder_" + name); } catch {}

  activeFolder = "Tất cả";
  persist();
  renderLibrary();
  renderHome();
  renderReview();
  renderStats();
  alert(`Đã xóa thư mục "${name}".${count ? ` ${count} bộ đề đã được chuyển sang "Chưa phân loại".` : ""}`);
}

function createFolder() {
  let name = prompt("Tên thư mục mới (ví dụ: English IT, Food, Travel):");
  if (!name?.trim()) return;
  name = name.trim();

  if (folderNames().some(f => norm(f) === norm(name))) {
    activeFolder = folderNames().find(f => norm(f) === norm(name)) || name;
    renderLibrary();
    return alert(`Thư mục "${activeFolder}" đã tồn tại.`);
  }

  registerFolder(name);
  activeFolder = name;
  renderLibrary();
  alert(`Đã tạo thư mục "${name}".`);
}
function moveSetFolder(id) {
  let s = sets.find((x) => x.id === id);
  if (!s) return;
  let names = folderNames().filter((x) => x !== "Tất cả"),
    name = prompt(
      "Nhập tên thư mục muốn chuyển bộ này vào:",
      s.folder || "Chưa phân loại",
    );
  if (!name?.trim()) return;
  name = name.trim();
  registerFolder(name);
  s.folder = name;
  s.updatedAt = Date.now();
  persist();
  renderLibrary();
}
function renderHeatmap() {
  let el = document.getElementById("studyHeatmap");
  if (!el) return;
  let keys = dateKeysLast(90),
    vals = keys.map(
      (k) =>
        dailyWordCount(daily.days[k]) + (daily.days[k]?.tests || 0) * 5,
    ),
    max = Math.max(1, ...vals);
  el.innerHTML = keys
    .map((k, i) => {
      let v = vals[i],
        r = v / max,
        lv =
          v === 0
            ? ""
            : r < 0.25
              ? "l1"
              : r < 0.5
                ? "l2"
                : r < 0.8
                  ? "l3"
                  : "l4";
      return `<div class="heatcell ${lv}" title="${k}: ${v ? `${dailyWordCount(daily.days[k])} từ · ${daily.days[k]?.tests || 0} test` : "không học"}"></div>`;
    })
    .join("");
  let active = vals.filter(Boolean).length,
    total = vals.reduce((a, b) => a + b, 0),
    info = document.getElementById("heatmapInfo");
  if (info) info.textContent = `${active}/90 ngày có học`;
}
function renderListeningSetup() {
  let sel = document.getElementById("listenSet");
  if (!sel) return;
  let old = sel.value;
  sel.innerHTML = sets.length
    ? sets
        .map(
          (s) =>
            `<option value="${s.id}">${esc(s.name)} · ${s.words.length} từ</option>`,
        )
        .join("")
    : "<option>Chưa có bộ từ</option>";
  if (old && sets.some((s) => s.id === old)) sel.value = old;
  if (sets.length) startListening();
  else
    document.getElementById("listenArea").innerHTML =
      '<div class="empty">Hãy tạo bộ từ trước khi luyện nghe.</div>';
}
function listeningSpeak(word, rateOverride = null) {
  if (!("speechSynthesis" in window))
    return alert("Trình duyệt không hỗ trợ phát âm.");

  let decoded;
  try {
    decoded = decodeURIComponent(String(word || ""));
  } catch {
    decoded = String(word || "");
  }

  // Không bao giờ đọc STT/list prefix trước từ.
  let text = sanitizeWordText(decoded);
  if (!text) return;

  speechSynthesis.cancel();
  let u = new SpeechSynthesisUtterance(text);
  u.lang = document.getElementById("listenVoice")?.value || "en-US";
  u.rate =
    rateOverride !== null
      ? Number(rateOverride)
      : +(document.getElementById("listenRate")?.value || 0.85);

  let voices = speechSynthesis.getVoices();
  let wanted = u.lang.toLowerCase();
  let v =
    voices.find((x) => x.lang.toLowerCase() === wanted) ||
    voices.find((x) => x.lang.toLowerCase().startsWith(wanted.slice(0, 2)));
  if (v) u.voice = v;

  speechSynthesis.speak(u);
}
function startListening() {
  let id = document.getElementById("listenSet")?.value,
    s = sets.find((x) => x.id === id);
  if (!s?.words.length) return;
  listenSession = {
    setId: id,
    words: shuffle(s.words.slice()),
    idx: 0,
    correct: 0,
    answered: false,
  };
  renderListening();
}
function renderListening() {
  let area = document.getElementById("listenArea");
  if (!area || !listenSession) return;
  let s = sets.find((x) => x.id === listenSession.setId),
    w = listenSession.words[listenSession.idx],
    mode = document.getElementById("listenMode")?.value || "write";
  if (!w) {
    area.innerHTML = `<div style="font-size:44px">🎧</div><h2>Hoàn thành</h2><p>Bạn đúng ${listenSession.correct}/${listenSession.words.length} từ.</p><button class="btn pri" onclick="startListening()">Luyện lại</button>`;
    return;
  }
  let choices = mode === "meaning" ? makeMeaningChoices(s, w) : [];
  area.innerHTML = `<div class="small">Câu ${listenSession.idx + 1}/${listenSession.words.length} · ${mode === "write" ? "Nghe → Viết" : "Nghe → Chọn nghĩa"}</div><div class="listen-word">🎧</div><div class="listen-controls"><button class="btn pri" onclick="listeningSpeak('${encodeURIComponent(w.word)}')">🔊 Nghe</button><button class="btn ghost" onclick="listeningSpeak('${encodeURIComponent(w.word)}',.65)">🐢 Nghe chậm</button></div>${mode === "write" ? `<input id="listenAnswer" class="answer" placeholder="Nhập từ tiếng Anh..." onkeydown="if(event.key==='Enter')checkListening()">` : `<div class="listen-choice">${choices.map((c) => `<button class="choice" onclick="checkListening('${encodeURIComponent(c)}')">${esc(c)}</button>`).join("")}</div>`}<div id="listenFeedback" style="margin-top:14px"></div>${mode === "write" ? '<button class="btn sec" style="margin-top:12px" onclick="checkListening()">Kiểm tra</button>' : ""}<button class="btn ghost" style="margin-top:12px;margin-left:6px" onclick="skipListening()">⏭ Bỏ qua</button>`;
}

function skipListening(){
  if(!listenSession||listenSession.answered)return;
  let w=listenSession.words[listenSession.idx],
      s=sets.find(x=>x.id===listenSession.setId);
  if(!w||!s)return;

  listenSession.answered=true;
  recordWordLearningOutcome(w,"skip","skip");
  reviewWord(w,"again");
  s.totalAttempts++;
  s.updatedAt=Date.now();
  persist();

  document.getElementById("listenFeedback").innerHTML=
    `<div class="feedback bad"><b>⏭ Đã bỏ qua</b><br><b>${esc(w.word)}</b> · ${esc(w.ipa)}<br>${esc(w.meaning)}<br><span class="subtle">${isFrequentMistake(w)?`🔥 Đã ghi nhận vào Từ Hay Sai · ${w.mistakeCount} lần quên/sai.`:"Bỏ qua được tính là 1 lần quên."}</span></div><button class="btn pri" style="margin-top:10px" onclick="nextListening()">Tiếp →</button>`;
}

function checkListening(choice) {
  if (!listenSession || listenSession.answered) return;
  let w = listenSession.words[listenSession.idx],
    mode = document.getElementById("listenMode")?.value || "write",
    ans = choice
      ? decodeURIComponent(choice)
      : document.getElementById("listenAnswer")?.value || "",
    ok =
      mode === "meaning"
        ? norm(ans) === norm(w.meaning)
        : norm(ans) === norm(w.word);
  listenSession.answered = true;
  if (ok) listenSession.correct++;
  recordWordLearningOutcome(w, ok ? "correct" : "wrong", "listening");
  reviewWord(w, ok ? "good" : "again");
  let s = sets.find((x) => x.id === listenSession.setId);
  s.totalAttempts++;
  persist();
  document.getElementById("listenFeedback").innerHTML =
    `<div class="feedback ${ok ? "good" : "bad"}"><b>${ok ? "✅ Chính xác" : "❌ Chưa đúng"}</b><br><b>${esc(w.word)}</b> · ${esc(w.ipa)}<br>${esc(w.meaning)}</div><button class="btn pri" style="margin-top:10px" onclick="nextListening()">Tiếp →</button>`;
}
function nextListening() {
  listenSession.idx++;
  listenSession.answered = false;
  renderListening();
}
function fullPayload() {
  return {
    app: "Anh Ba Saigon Studies",
    version: SCHEMA,
    exportedAt: new Date().toISOString(),
    sets,
    daily,
    customFolders: loadCustomFolders(),
    deletedFolders: loadDeletedFolders(),
    smartStudy: loadSmartStudy(),
    periodicReview: loadPeriodicReview(),
    theme: localStorage.getItem("vocabflow_theme") || "dark",
    learnMode: localStorage.getItem("vocabflow_learn_mode") || "vi-en",
  };
}
function exportFullBackup() {
  let b = new Blob([JSON.stringify(fullPayload(), null, 2)], {
      type: "application/json",
    }),
    u = URL.createObjectURL(b),
    a = document.createElement("a");
  a.href = u;
  a.download = `Anh_Ba_Saigon_Studies_FULL_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function importFullBackup(e) {
  let f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 25 * 1024 * 1024) {
    alert("File Full Backup quá lớn (>25 MB). Hãy kiểm tra lại file trước khi Restore.");
    e.target.value = "";
    return;
  }
  let r = new FileReader();
  r.onload = () => {
    try {
      let x = JSON.parse(r.result);
      if (!x || typeof x !== "object" || !Array.isArray(x.sets)) throw 0;
      if (x.sets.some(s=>!s || typeof s!=="object" || !Array.isArray(s.words))) throw 0;
      if (Number(x.version) > SCHEMA) {
        alert(`File backup được tạo bởi phiên bản dữ liệu mới hơn (v${x.version}). Hãy mở bằng bản app mới hơn để tránh làm mất dữ liệu.`);
        return;
      }
      if (
        !confirm(
          "Full Restore sẽ thay thế kho hiện tại, folder, thùng rác folder, tiến độ Daily, streak và SRS bằng file backup. Tiếp tục?",
        )
      )
        return;
      sets = x.sets.map(upgradeSet);

      // Chuẩn hóa Daily để backup cũ/thiếu field vẫn khôi phục an toàn.
      let rawDaily = x.daily && typeof x.daily === "object" ? x.daily : {};
      daily = {
        goals: {
          newWords: 10,
          reviews: 20,
          tests: 1,
          ...(rawDaily.goals || {}),
        },
        days: rawDaily.days && typeof rawDaily.days === "object" ? rawDaily.days : {},
      };

      // Khôi phục cả folder rỗng và đăng ký folder đang có trong các bộ đề.
      let restoredFolders = Array.isArray(x.customFolders) ? [...x.customFolders] : [];
      sets.forEach(s => {
        if (s.folder && s.folder !== "Chưa phân loại") restoredFolders.push(s.folder);
      });
      saveCustomFolders(restoredFolders);
      // Khôi phục cả Thùng rác Folder nếu backup có dữ liệu này.
      saveDeletedFolders(Array.isArray(x.deletedFolders) ? x.deletedFolders : []);
      if (x.smartStudy && typeof x.smartStudy === "object") {
        safeStorageSet(SMART_STUDY_KEY, JSON.stringify(x.smartStudy),"Smart Daily");
      }
      if (x.periodicReview && typeof x.periodicReview === "object") {
        safeStorageSet(PERIODIC_REVIEW_KEY, JSON.stringify(x.periodicReview),"kiểm tra định kỳ");
      }

      let restoreSetsSaved=persist(),
          restoreDailySaved=saveDaily();

      if (x.theme) {
        safeStorageSet("vocabflow_theme", x.theme,"giao diện");
        document.documentElement.setAttribute("data-theme", x.theme);
        if (typeof updateThemeButton === "function") updateThemeButton();
      }
      if (x.learnMode)
        safeStorageSet("vocabflow_learn_mode", x.learnMode,"chế độ luyện viết");

      if (typeof selectedSetIds !== "undefined") selectedSetIds.clear();
      activeFolder = "Tất cả";

      if (restoreSetsSaved && restoreDailySaved)
        alert(`Đã khôi phục đầy đủ ${sets.length} bộ từ + tiến độ học.`);
      else
        alert("Dữ liệu đã được nạp vào phiên hiện tại nhưng trình duyệt không lưu được toàn bộ. Hãy Full Backup ngay trước khi đóng app.");
      renderHome();
      renderLibrary();
      renderReview();
      renderStats();
    } catch {
      alert("File Full Backup không hợp lệ.");
    }
  };
  r.readAsText(f);
  e.target.value = "";
}
function speak(x) {
  let t;
  try { t = decodeURIComponent(String(x || "")); } catch { t = String(x || ""); }
  t = sanitizeWordText(t);
  if (!("speechSynthesis" in window))
    return alert("Trình duyệt không hỗ trợ phát âm.");
  speechSynthesis.cancel();
  let u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
function deleteSet(id) {
  if (confirm("Xóa bộ đề này?")) {
    sets = sets.filter((s) => s.id !== id);
    if (typeof selectedSetIds !== "undefined") selectedSetIds.delete(id);
    persist();
    renderLibrary();
    renderHome();
    renderReview();
    renderStats();
  }
}
function payload() {
  return {
    app: "Anh Ba Saigon Studies",
    version: SCHEMA,
    exportedAt: new Date().toISOString(),
    sets,
    customFolders: loadCustomFolders(),
  };
}
async function copyAllLibrary() {
  let t = JSON.stringify(payload());
  try {
    await navigator.clipboard.writeText(t);
    alert(`Đã copy ${sets.length} bộ đề.`);
  } catch {
    openPaste();
    document.getElementById("pasteText").value = t;
    document.getElementById("pasteText").select();
    alert("Hãy nhấn Ctrl+C để copy dữ liệu trong ô.");
  }
}
function openPaste() {
  pasteDialog.showModal();
  pasteText.value = "";
}
async function pasteClipboard() {
  try {
    pasteText.value = await navigator.clipboard.readText();
  } catch {
    alert("Hãy nhấn Ctrl+V vào ô dữ liệu.");
  }
}
function restoreIncoming(incoming) {
  if (!Array.isArray(incoming)) throw 0;

  let ids = new Set(sets.map((s) => s.id)),
      wordIds = new Set(allWords().map(w=>w.id));
  let x = incoming
    .filter((s) => s && Array.isArray(s.words))
    .map((s) => {
      let z = upgradeSet(s);
      while (ids.has(z.id)) z.id = uid();
      ids.add(z.id);

      // Remap word IDs when importing a copy of a set that already exists.
      let idMap = new Map();
      z.words.forEach(w=>{
        let old=w.id,newId=old;
        while(wordIds.has(newId))newId=uid();
        if(newId!==old){idMap.set(old,newId);w.id=newId}
        wordIds.add(w.id);
      });
      if(idMap.size){
        z.testHistory.forEach(t=>{
          if(!Array.isArray(t?.wrong))return;
          t.wrong.forEach(item=>{
            if(idMap.has(item.wordId))item.wordId=idMap.get(item.wordId);
          });
        });
      }

      if (z.folder && z.folder !== "Chưa phân loại") registerFolder(z.folder);
      return z;
    });

  if (!x.length) throw 0;
  sets = [...x, ...sets];
  persist();
  return x.length;
}
function importFromText() {
  try {
    let p = JSON.parse(pasteText.value),
      n = restoreIncoming(Array.isArray(p) ? p : p.sets);
    if (!Array.isArray(p) && Array.isArray(p.customFolders)) {
      saveCustomFolders([...loadCustomFolders(), ...p.customFolders]);
    }
    pasteDialog.close();
    alert(`Đã nhập ${n} bộ đề.`);
    renderLibrary();
    renderHome();
    renderReview();
    renderStats();
  } catch {
    alert("Dữ liệu không hợp lệ.");
  }
}
renderHome();
renderLibrary();
renderReview();
renderStats();


function updateThemeButton() {
  var d = document.documentElement.getAttribute("data-theme") === "dark";
  var b = document.getElementById("themeToggle");
  if (b)
    b.innerHTML = d
      ? "☀️ <span>Giao diện sáng</span>"
      : "🌙 <span>Giao diện tối</span>";
}
function toggleTheme() {
  var d = document.documentElement.getAttribute("data-theme") === "dark";
  var n = d ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", n);
  safeStorageSet("vocabflow_theme", n,"giao diện");
  updateThemeButton();
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", updateThemeButton);
else updateThemeButton();


document.addEventListener("keydown", function (e) {
  if (e.code !== "Space" || e.repeat || !learnSession) return;
  const learnScreen = document.getElementById("learn");
  if (!learnScreen || !learnScreen.classList.contains("active")) return;
  const answer = document.getElementById("learnAnswer");
  if (answer && answer.disabled) {
    e.preventDefault();
    nextLearn();
  }
});



if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", restoreSidebarGroups);
} else {
  restoreSidebarGroups();
}

window.addEventListener('load',()=>setTimeout(()=>runAppMotion('home'),80));
