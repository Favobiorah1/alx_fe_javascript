Favour Obiorah 🆙 UXUY, [16/08/2025 6:29 pm]
// ===============================
// Dynamic Quote Generator Script
// ===============================

// Initial quotes (fallback if local storage is empty)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// Load quotes from local storage if available
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// Track last viewed quote using session storage
if (sessionStorage.getItem("lastQuote")) {
  document.getElementById("quoteDisplay").innerText = sessionStorage.getItem("lastQuote");
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filteredQuotes = quotes;

  if (category !== "all") {
    filteredQuotes = quotes.filter(q => q.category === category);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex].text;

  document.getElementById("quoteDisplay").innerText = selectedQuote;
  sessionStorage.setItem("lastQuote", selectedQuote);
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");

  // Post to mock server
  postQuoteToServer(newQuote);

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = <option value="all">All Categories</option>;
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    categoryFilter.appendChild(option);
  });

  // Restore last filter
  if (localStorage.getItem("lastFilter")) {
    categoryFilter.value = localStorage.getItem("lastFilter");
  }
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);
  showRandomQuote();
}

// Export quotes as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==============================
// Simulated Server Interaction
// ==============================

// Fetch quotes from server (simulation)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

Favour Obiorah 🆙 UXUY, [16/08/2025 6:29 pm]
// Simulate server sending back quote-like objects
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

// Post new quote to server (simulation)
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote synced with server:", quote);
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// ==============================
// Data Sync + Conflict Resolution
// ==============================
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    // Conflict resolution: server wins
    const mergedQuotes = [...quotes, ...serverQuotes];
    const uniqueQuotes = Array.from(new Map(mergedQuotes.map(q => [q.text, q])).values());

    quotes = uniqueQuotes;
    saveQuotes();
    populateCategories();

    console.log("Quotes synced with server. Local storage updated.");
  }
}

// Run sync every 60 seconds
setInterval(syncQuotes, 60000);

// ==============================
// Initialize on Load
// ==============================
window.onload = function() {
  populateCategories();
  showRandomQuote();
  syncQuotes();
};