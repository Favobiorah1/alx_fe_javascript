Favour Obiorah 🆙 UXUY, [16/08/2025 6:08 pm]
// ================== Constants & Keys ==================
const LS_QUOTES_KEY = "dqg_quotes";
const LS_SELECTED_CATEGORY_KEY = "dqg_selected_category";
const LS_PENDING_CHANGES_KEY = "dqg_pending_changes";
const LS_CONFLICTS_KEY = "dqg_conflicts";
const SS_LAST_QUOTE_KEY = "dqg_last_quote";

const SERVER_BASE = "https://jsonplaceholder.typicode.com";
const SERVER_ENDPOINT = "/posts"; // simulate remote quotes with posts
const SYNC_INTERVAL_MS = 30000;

// ================== Utilities ==================
const now = () => Date.now();
const rand = () => Math.random().toString(36).slice(2, 8);
const genLocalId = () => loc-${now()}-${rand()};
const isValidQuote = (q) =>
  q && typeof q.text === "string" && q.text.trim() && typeof q.category === "string" && q.category.trim();

function showToast(message, type = "info", timeout = 4000) {
  const wrap = document.getElementById("notifications");
  const el = document.createElement("div");
  el.className = toast ${type};
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => wrap.removeChild(el), timeout);
}

function setSyncStatus(text) {
  document.getElementById("syncStatus").textContent = text;
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

// ================== Default Data ==================
const DEFAULT_QUOTES = [
  { id: genLocalId(), text: "The only way to do great work is to love what you do.", category: "Motivation", lastModified: now(), source: "local" },
  { id: genLocalId(), text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", lastModified: now(), source: "local" },
  { id: genLocalId(), text: "Happiness depends upon ourselves.", category: "Life", lastModified: now(), source: "local" }
];

// ================== State ==================
let quotes = [];
let pendingChanges = [];   // {type: "add"|"edit"|"delete", quote}
let conflictLog = [];      // [{ id, local, server, resolved: "server"|"local" }]

// ================== DOM ==================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const syncNowBtn = document.getElementById("syncNowBtn");
const formMount = document.getElementById("formMount");
const reviewConflictsBtn = document.getElementById("reviewConflictsBtn");
const conflictModal = document.getElementById("conflictModal");
const conflictList = document.getElementById("conflictList");
const applyConflictChoicesBtn = document.getElementById("applyConflictChoices");
const closeConflictModalBtn = document.getElementById("closeConflictModal");

// ================== Storage Helpers ==================
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return deepClone(DEFAULT_QUOTES);
  try {
    const arr = JSON.parse(raw);
    // migrate: add ids/lastModified if missing
    return arr.map(q => ({
      id: q.id || genLocalId(),
      text: q.text,
      category: q.category,
      lastModified: q.lastModified || now(),
      source: q.source || "local"
    })).filter(isValidQuote);
  } catch {
    return deepClone(DEFAULT_QUOTES);
  }
}

function savePendingChanges() {
  localStorage.setItem(LS_PENDING_CHANGES_KEY, JSON.stringify(pendingChanges));
}
function loadPendingChanges() {
  try {
    return JSON.parse(localStorage.getItem(LS_PENDING_CHANGES_KEY)) || [];
  } catch { return []; }
}

function saveConflicts() {
  localStorage.setItem(LS_CONFLICTS_KEY, JSON.stringify(conflictLog));
}
function loadConflicts() {
  try {
    return JSON.parse(localStorage.getItem(LS_CONFLICTS_KEY)) || [];
  } catch { return []; }
}

function saveFilterPreference(category) {
  localStorage.setItem(LS_SELECTED_CATEGORY_KEY, category);
}
function getSavedFilter() {
  return localStorage.getItem(LS_SELECTED_CATEGORY_KEY) || "all";
}

Favour Obiorah 🆙 UXUY, [16/08/2025 6:08 pm]
function saveLastViewedQuote(q) {
  try { sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q)); } catch {}
}
function getLastViewedQuote() {
  try { return JSON.parse(sessionStorage.getItem(SS_LAST_QUOTE_KEY) || "null"); } catch { return null; }
}

// ================== Categories & Filtering ==================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category.trim()))].sort((a,b)=>a.localeCompare(b));
  categoryFilter.innerHTML = <option value="all">All Categories</option>;
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  }
  // Restore saved filter
  const saved = getSavedFilter();
  if ([...categoryFilter.options].some(o => o.value === saved)) {
    categoryFilter.value = saved;
  } else {
    categoryFilter.value = "all";
  }
}

function filterQuotes() {
  saveFilterPreference(categoryFilter.value);
  showRandomQuote();
}
// expose for inline onchange
window.filterQuotes = filterQuotes;

// ================== Core UI ==================
function showRandomQuote() {
  let pool = quotes;
  const sel = categoryFilter.value;
  if (sel !== "all") pool = quotes.filter(q => q.category === sel);
  if (!pool.length) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }
  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  quoteDisplay.textContent = "${q.text}" — ${q.category};
  saveLastViewedQuote(q);
}

function createAddQuoteForm() {
  const wrap = document.createElement("div");
  wrap.className = "form-container";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  wrap.appendChild(inputText);
  wrap.appendChild(inputCategory);
  wrap.appendChild(addBtn);

  formMount.appendChild(wrap);
}

// ================== Add / Edit Quotes ==================
function addQuote() {
  const t = document.getElementById("newQuoteText");
  const c = document.getElementById("newQuoteCategory");
  const text = (t.value || "").trim();
  const category = (c.value || "").trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const q = { id: genLocalId(), text, category, lastModified: now(), source: "local" };
  quotes.push(q);
  saveQuotes();

  // Track pending add to simulate push to server
  pendingChanges.push({ type: "add", quote: q });
  savePendingChanges();

  populateCategories();
  categoryFilter.value = category;
  showRandomQuote();

  t.value = ""; c.value = "";
  showToast("New quote added. Will sync to server.", "success");
}

// (Optional) Minimal inline editor for the *currently displayed* quote to help demo conflicts
function editCurrentQuote(newText) {
  const current = getLastViewedQuote();
  if (!current) return;
  const idx = quotes.findIndex(q => q.id === current.id);
  if (idx === -1) return;
  quotes[idx].text = newText;
  quotes[idx].lastModified = now();
  saveQuotes();
  pendingChanges.push({ type: "edit", quote: quotes[idx] });
  savePendingChanges();
  showToast("Quote edited locally. Will sync.", "info");
}

// ================== Import / Export ==================
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

Favour Obiorah 🆙 UXUY, [16/08/2025 6:08 pm]
const a = document.createElement("a");
  const ts = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  a.href = url;
  a.download = quotes-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
}

function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("Expecting an array of quotes.");
      const cleaned = parsed
        .filter(isValidQuote)
        .map(q => ({
          id: q.id || genLocalId(),
          text: q.text,
          category: q.category,
          lastModified: q.lastModified || now(),
          source: q.source || "local"
        }));
      quotes.push(...cleaned);
      saveQuotes();
      populateCategories();
      showToast(Imported ${cleaned.length} quotes., "success");
    } catch (err) {
      console.error(err);
      alert("Invalid JSON.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}
window.importFromJsonFile = importFromJsonFile;

// ================== Server Adapters (Simulated) ==================
// Map JSONPlaceholder posts -> quote objects
function mapPostToQuote(post) {
  // We'll treat post.body as the quote text, and post.title as a short category
  const text = (post.body  "").trim()  "Server placeholder text";
  const category = (post.title || "Server").slice(0, 30);
  return {
    id: srv-${post.id},
    text,
    category,
    lastModified: now(), // JSONPlaceholder doesn't give timestamps; simulate "fresh"
    source: "server"
  };
}

async function fetchServerQuotes(limit = 10) {
  const url = ${SERVER_BASE}${SERVER_ENDPOINT}?_limit=${limit};
  const res = await fetch(url);
  if (!res.ok) throw new Error(Server fetch failed: ${res.status});
  const posts = await res.json();
  return posts.map(mapPostToQuote);
}

// Push local adds/edits (purely simulated; JSONPlaceholder returns an id but does not persist)
async function pushLocalChanges() {
  const outbox = [...pendingChanges];
  if (!outbox.length) return;

  for (const change of outbox) {
    try {
      if (change.type === "add") {
        const res = await fetch(${SERVER_BASE}${SERVER_ENDPOINT}, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: change.quote.category, body: change.quote.text })
        });
        // Simulate server assigning an id
        const payload = await res.json();
        const newServerId = payload?.id ? srv-${payload.id} : null;
        // Map local id to server-style id for future conflict detection
        if (newServerId) {
          const idx = quotes.findIndex(q => q.id === change.quote.id);
          if (idx !== -1) {
            quotes[idx].id = newServerId;
            quotes[idx].source = "server";
            quotes[idx].lastModified = now();
          }
        }
      } else if (change.type === "edit") {
        // JSONPlaceholder won't persist changes, but we simulate a PATCH call
        const serverId = change.quote.id.startsWith("srv-") ? change.quote.id.replace("srv-", "") : "1";
        await fetch(${SERVER_BASE}${SERVER_ENDPOINT}/${serverId}, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: change.quote.category, body: change.quote.text })
        });
      }
      // Remove from pending
      pendingChanges = pendingChanges.filter(pc => pc !== change);
      savePendingChanges();
    } catch (err) {
      console.warn("Failed to push change:", err);
      // keep it in outbox for next attempt
    }
  }
  saveQuotes();
}

Favour Obiorah 🆙 UXUY, [16/08/2025 6:08 pm]
// ================== Conflict Handling ==================
function detectAndMergeServerQuotes(serverQuotes) {
  let conflicts = [];
  // Index local by id
  const localById = new Map(quotes.map(q => [q.id, q]));
  const nextQuotes = [...quotes];

  for (const srv of serverQuotes) {
    const local = localById.get(srv.id);
    if (!local) {
      // New server item, add it
      nextQuotes.push(srv);
      continue;
    }
    // Same id exists locally; compare for differences
    if (local.text !== srv.text || local.category !== srv.category) {
      // Conflict: server vs local
      conflicts.push({ id: srv.id, local: deepClone(local), server: deepClone(srv), resolved: "server" });
      // Default policy: server wins
      const li = nextQuotes.findIndex(q => q.id === srv.id);
      nextQuotes[li] = srv;
    } else {
      // Same content; keep lastModified as the "max" to reflect sync
      const li = nextQuotes.findIndex(q => q.id === srv.id);
      nextQuotes[li].lastModified = Math.max(local.lastModified  0, srv.lastModified  0);
      nextQuotes[li].source = "server";
    }
  }

  // Save merged
  quotes = nextQuotes;
  saveQuotes();

  // Persist conflicts (for manual overrides)
  if (conflicts.length) {
    // Merge with any existing unresolved conflicts by id
    const existing = new Map(conflictLog.map(c => [c.id, c]));
    for (const c of conflicts) existing.set(c.id, c);
    conflictLog = [...existing.values()];
    saveConflicts();
    reviewConflictsBtn.style.display = "inline-block";
    showToast(Conflicts resolved automatically (server wins). Review?, "warn", 6000);
  }
}

// Manual review UI
function openConflictModal() {
  conflictList.innerHTML = "";
  if (!conflictLog.length) {
    const p = document.createElement("p");
    p.textContent = "No conflicts to review.";
    conflictList.appendChild(p);
  } else {
    for (const c of conflictLog) {
      const box = document.createElement("div");
      box.className = "conflict-item";
      box.innerHTML = 
        <div><strong>ID:</strong> ${c.id}</div>
        <div style="display:grid; gap:8px; margin-top:8px;">
          <label><input type="radio" name="conf-${c.id}" value="server" ${c.resolved === "server" ? "checked" : ""}/> Keep SERVER version</label>
          <pre>${JSON.stringify(c.server, null, 2)}</pre>
          <label><input type="radio" name="conf-${c.id}" value="local" ${c.resolved === "local" ? "checked" : ""}/> Keep LOCAL version</label>
          <pre>${JSON.stringify(c.local, null, 2)}</pre>
        </div>
      ;
      conflictList.appendChild(box);
    }
  }
  conflictModal.classList.add("show");
}

function applyConflictChoices() {
  let changed = 0;
  for (const c of conflictLog) {
    const choice = document.querySelector(input[name="conf-${c.id}"]:checked)?.value || "server";
    c.resolved = choice;
    const idx = quotes.findIndex(q => q.id === c.id);
    if (idx !== -1) {
      const chosen = choice === "local" ? c.local : c.server;
      quotes[idx] = deepClone(chosen);
      quotes[idx].lastModified = now();
      changed++;
    }
  }
  saveQuotes();
  saveConflicts();
  populateCategories();
  showRandomQuote();
  if (changed) showToast(Applied ${changed} conflict choice(s)., "success");
  closeConflictModal();
}

function closeConflictModal() {
  conflictModal.classList.remove("show");
  if (!conflictLog.length) reviewConflictsBtn.style.display = "none";
}

// ================== Sync Orchestrator ==================
async function syncWithServer() {
  try {
    setSyncStatus("Syncing…");
    // 1) Push local changes first (so server "could" reflect them)
    await pushLocalChanges();
    // 2) Fetch server snapshot
    const serverQuotes = await fetchServerQuotes(10);
    // 3) Merge with conflict detection (server wins by default)
    detectAndMergeServerQuotes(serverQuotes);
    // 4) Update categories/UI
    populateCategories();
    setSyncStatus("Up to date");
  } catch (err) {
    console.error(err);
    setSyncStatus("Error");
    showToast("Sync failed. Will retry automatically.", "error");
  }
}

Favour Obiorah 🆙 UXUY, [16/08/2025 6:08 pm]
// ================== Init ==================
function init() {
  quotes = loadQuotes();
  pendingChanges = loadPendingChanges();
  conflictLog = loadConflicts();

  populateCategories();
  createAddQuoteForm();

  // Event wiring
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  syncNowBtn.addEventListener("click", syncWithServer);
  reviewConflictsBtn.addEventListener("click", openConflictModal);
  applyConflictChoicesBtn.addEventListener("click", applyConflictChoices);
  closeConflictModalBtn.addEventListener("click", closeConflictModal);

  // Restore last viewed quote (session)
  const last = getLastViewedQuote();
  if (last) {
    quoteDisplay.textContent = "${last.text}" — ${last.category};
  } else {
    showRandomQuote();
  }

  // Initial sync + periodic sync
  syncWithServer();
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);

// (Optional) small helper to demo conflicts in your testing console:
// window._editCurrentQuote = editCurrentQuote;