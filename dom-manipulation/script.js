Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
// -------- Storage Keys --------
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_quote";
const SS_SELECTED_CATEGORY_KEY = "dqg_selected_category";

// -------- Defaults (used if Local Storage is empty) --------
const DEFAULT_QUOTES = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Life" }
];

// -------- State --------
let quotes = []; // will be loaded from localStorage or DEFAULT_QUOTES

// -------- DOM --------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");

// -------- Utilities --------
const isValidQuote = (q) =>
  q && typeof q === "object" &&
  typeof q.text === "string" && q.text.trim().length > 0 &&
  typeof q.category === "string" && q.category.trim().length > 0;

function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (err) {
    alert("Could not save quotes to Local Storage.");
    console.error(err);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) return [...DEFAULT_QUOTES];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidQuote);
    }
  } catch (e) {
    console.warn("Failed to parse saved quotes; using defaults.", e);
  }
  return [...DEFAULT_QUOTES];
}

function setLastViewedQuoteSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (_) {}
}

function getLastViewedQuoteSession() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSelectedCategorySession(value) {
  try {
    sessionStorage.setItem(SS_SELECTED_CATEGORY_KEY, value);
  } catch (_) {}
}

function getSelectedCategorySession() {
  try {
    return sessionStorage.getItem(SS_SELECTED_CATEGORY_KEY) || "all";
  } catch {
    return "all";
  }
}

// -------- UI Builders --------
function updateCategoryFilter() {
  const previous = categoryFilter.value || getSelectedCategorySession();
  const categories = [...new Set(quotes.map(q => q.category.trim()))].sort((a,b) => a.localeCompare(b));
  categoryFilter.innerHTML = <option value="all">All</option>;
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  }
  // Restore previous selection if available
  if ([...categoryFilter.options].some(o => o.value === previous)) {
    categoryFilter.value = previous;
  } else {
    categoryFilter.value = "all";
  }
}

function createAddQuoteForm() {
  const container = document.createElement("div");
  container.className = "form-container";

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

  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addBtn);

  // Append into the main container (below import/export)
  document.querySelector(".container").appendChild(container);
}

Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
// -------- Core Behaviors --------
function showRandomQuote() {
  let pool = quotes;
  const selectedCategory = categoryFilter.value;
  if (selectedCategory && selectedCategory !== "all") {
    pool = quotes.filter(q => q.category === selectedCategory);
  }
  if (!pool.length) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  const q = pool[randomIndex];
  quoteDisplay.textContent = "${q.text}" — ${q.category};
  // Save last viewed quote & preference in Session Storage
  setLastViewedQuoteSession(q);
  setSelectedCategorySession(selectedCategory || "all");
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQ = { text, category };
  if (!isValidQuote(newQ)) {
    alert("Invalid quote format.");
    return;
  }

  quotes.push(newQ);
  saveQuotes();           // <- persist to Local Storage
  updateCategoryFilter(); // <- refresh categories
  categoryFilter.value = category; // auto-select new category
  showRandomQuote();      // show something immediately

  textEl.value = "";
  catEl.value = "";
  alert("New quote added successfully!");
}

// -------- Import / Export --------
function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const ts = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const filename = quotes-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  } catch (err) {
    console.error(err);
    alert("Failed to export quotes.");
  }
}

// Make available for the inline onchange in index.html (as per your spec)
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("JSON root must be an array.");
      const cleaned = parsed.filter(isValidQuote);

      if (!cleaned.length) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...cleaned);
      saveQuotes();
      updateCategoryFilter();
      alert(Quotes imported successfully! (${cleaned.length} added));
    } catch (err) {
      console.error(err);
      alert("Invalid JSON format. Expecting an array of { text, category } objects.");
    } finally {
      // Clear the file input so the same file can be re-selected if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// Expose import function to global scope for inline handler
window.importFromJsonFile = importFromJsonFile;

// -------- Init --------
function init() {
  quotes = loadQuotes();
  updateCategoryFilter();
  createAddQuoteForm();

  // Wire events
  newQuoteBtn.addEventListener("click", showRandomQuote);
  categoryFilter.addEventListener("change", () => {
    setSelectedCategorySession(categoryFilter.value);
    showRandomQuote();
  });
  exportBtn.addEventListener("click", exportToJsonFile);

  // Session Storage demo: restore last viewed quote if any

Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
const last = getLastViewedQuoteSession();
  if (last && isValidQuote(last)) {
    quoteDisplay.textContent = "${last.text}" — ${last.category};
    if ([...categoryFilter.options].some(o => o.value === last.category)) {
      categoryFilter.value = last.category;
    }
  } else {
    quoteDisplay.textContent = "Click “Show New Quote” to begin.";
    // Also restore last selected category if present
    const prevCat = getSelectedCategorySession();
    if ([...categoryFilter.options].some(o => o.value === prevCat)) {
      categoryFilter.value = prevCat;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);

Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
// -------- Storage Keys --------
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_quote";
const SS_SELECTED_CATEGORY_KEY = "dqg_selected_category";

// -------- Defaults (used if Local Storage is empty) --------
const DEFAULT_QUOTES = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Life" }
];

// -------- State --------
let quotes = []; // will be loaded from localStorage or DEFAULT_QUOTES

// -------- DOM --------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");

// -------- Utilities --------
const isValidQuote = (q) =>
  q && typeof q === "object" &&
  typeof q.text === "string" && q.text.trim().length > 0 &&
  typeof q.category === "string" && q.category.trim().length > 0;

function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (err) {
    alert("Could not save quotes to Local Storage.");
    console.error(err);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) return [...DEFAULT_QUOTES];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidQuote);
    }
  } catch (e) {
    console.warn("Failed to parse saved quotes; using defaults.", e);
  }
  return [...DEFAULT_QUOTES];
}

function setLastViewedQuoteSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (_) {}
}

function getLastViewedQuoteSession() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSelectedCategorySession(value) {
  try {
    sessionStorage.setItem(SS_SELECTED_CATEGORY_KEY, value);
  } catch (_) {}
}

function getSelectedCategorySession() {
  try {
    return sessionStorage.getItem(SS_SELECTED_CATEGORY_KEY) || "all";
  } catch {
    return "all";
  }
}

// -------- UI Builders --------
function updateCategoryFilter() {
  const previous = categoryFilter.value || getSelectedCategorySession();
  const categories = [...new Set(quotes.map(q => q.category.trim()))].sort((a,b) => a.localeCompare(b));
  categoryFilter.innerHTML = <option value="all">All</option>;
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  }
  // Restore previous selection if available
  if ([...categoryFilter.options].some(o => o.value === previous)) {
    categoryFilter.value = previous;
  } else {
    categoryFilter.value = "all";
  }
}

function createAddQuoteForm() {
  const container = document.createElement("div");
  container.className = "form-container";

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

  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addBtn);

  // Append into the main container (below import/export)
  document.querySelector(".container").appendChild(container);
}

Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
// -------- Core Behaviors --------
function showRandomQuote() {
  let pool = quotes;
  const selectedCategory = categoryFilter.value;
  if (selectedCategory && selectedCategory !== "all") {
    pool = quotes.filter(q => q.category === selectedCategory);
  }
  if (!pool.length) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  const q = pool[randomIndex];
  quoteDisplay.textContent = "${q.text}" — ${q.category};
  // Save last viewed quote & preference in Session Storage
  setLastViewedQuoteSession(q);
  setSelectedCategorySession(selectedCategory || "all");
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQ = { text, category };
  if (!isValidQuote(newQ)) {
    alert("Invalid quote format.");
    return;
  }

  quotes.push(newQ);
  saveQuotes();           // <- persist to Local Storage
  updateCategoryFilter(); // <- refresh categories
  categoryFilter.value = category; // auto-select new category
  showRandomQuote();      // show something immediately

  textEl.value = "";
  catEl.value = "";
  alert("New quote added successfully!");
}

// -------- Import / Export --------
function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const ts = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const filename = quotes-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  } catch (err) {
    console.error(err);
    alert("Failed to export quotes.");
  }
}

// Make available for the inline onchange in index.html (as per your spec)
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("JSON root must be an array.");
      const cleaned = parsed.filter(isValidQuote);

      if (!cleaned.length) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...cleaned);
      saveQuotes();
      updateCategoryFilter();
      alert(Quotes imported successfully! (${cleaned.length} added));
    } catch (err) {
      console.error(err);
      alert("Invalid JSON format. Expecting an array of { text, category } objects.");
    } finally {
      // Clear the file input so the same file can be re-selected if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// Expose import function to global scope for inline handler
window.importFromJsonFile = importFromJsonFile;

// -------- Init --------
function init() {
  quotes = loadQuotes();
  updateCategoryFilter();
  createAddQuoteForm();

  // Wire events
  newQuoteBtn.addEventListener("click", showRandomQuote);
  categoryFilter.addEventListener("change", () => {
    setSelectedCategorySession(categoryFilter.value);
    showRandomQuote();
  });
  exportBtn.addEventListener("click", exportToJsonFile);

  // Session Storage demo: restore last viewed quote if any

Favour Obiorah 🆙 UXUY, [16/08/2025 5:35 pm]
const last = getLastViewedQuoteSession();
  if (last && isValidQuote(last)) {
    quoteDisplay.textContent = "${last.text}" — ${last.category};
    if ([...categoryFilter.options].some(o => o.value === last.category)) {
      categoryFilter.value = last.category;
    }
  } else {
    quoteDisplay.textContent = "Click “Show New Quote” to begin.";
    // Also restore last selected category if present
    const prevCat = getSelectedCategorySession();
    if ([...categoryFilter.options].some(o => o.value === prevCat)) {
      categoryFilter.value = prevCat;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);