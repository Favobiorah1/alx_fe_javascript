Favour Obiorah 🆙 UXUY, [16/08/2025 6:13 pm]
// ----------------------
// Dynamic Quote Generator with Sync
// ----------------------

// Quotes array (loaded from localStorage if available)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" }
];

// Track last viewed quote (using sessionStorage)
let lastQuote = sessionStorage.getItem("lastQuote") || null;

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display random quote (or last viewed if available)
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerText = "No quotes available.";
    return;
  }
  let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerText = "${randomQuote.text}" — ${randomQuote.category};
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (textInput.value.trim() && categoryInput.value.trim()) {
    const newQuote = { text: textInput.value.trim(), category: categoryInput.value.trim() };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Populate category dropdown dynamically
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  // Restore last selected category
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) filter.value = lastFilter;
}

// Filter quotes by category
function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", filter);

  const quoteDisplay = document.getElementById("quoteDisplay");
  let filtered = filter === "All Categories" ? quotes : quotes.filter(q => q.category === filter);

  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes found for this category.";
    return;
  }

  let randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerText = "${randomQuote.text}" — ${randomQuote.category};
}

// ----------------------
// Simulated Server Interaction
// ----------------------

// Fetch quotes from server simulation
async function fetchQuotesFromServer() {
  try {
    // Using JSONPlaceholder fake API (posts to simulate quotes)
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Convert server data into quote format
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: Server quotes take precedence
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    console.log("Quotes synced from server!");
  } catch (error) {
    console.error("Error fetching server quotes:", error);
  }
}

// Periodically sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// ----------------------
// Init
// ----------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

Favour Obiorah 🆙 UXUY, [16/08/2025 6:13 pm]
// Initialize categories and show first quote
populateCategories();
if (lastQuote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const parsed = JSON.parse(lastQuote);
  quoteDisplay.innerText = "${parsed.text}" — ${parsed.category};
} else {
  showRandomQuote();
}