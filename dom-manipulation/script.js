Favour Obiorah 🆙 UXUY, [16/08/2025 6:23 pm]
// ----------------------
// Quotes App with Sync
// ----------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// Load last selected filter
let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ----------------------
// Quote Display
// ----------------------
function showRandomQuote() {
  const category = document.getElementById("categoryFilter")?.value || "all";
  const filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
}

// ----------------------
// Adding Quotes
// ----------------------
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

    // 🔥 Send to server
    sendQuoteToServer(newQuote);
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ----------------------
// Category Filtering
// ----------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === lastSelectedCategory) {
      option.selected = true;
    }
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  lastSelectedCategory = category;
  localStorage.setItem("selectedCategory", category);
  showRandomQuote();
}

// ----------------------
// JSON Import / Export
// ----------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ----------------------
// Server Simulation
// ----------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Simulate converting server posts into quotes
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

Favour Obiorah 🆙 UXUY, [16/08/2025 6:23 pm]
// Merge with local quotes (server takes precedence)
    quotes = [...serverQuotes, ...quotes.filter(q => q.category !== "Server")];
    saveQuotes();
    populateCategories();
    console.log("Quotes synced from server.");
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

async function sendQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    const result = await response.json();
    console.log("Quote sent to server:", result);
    alert("Quote successfully synced with server!");
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// ----------------------
// Initialization
// ----------------------
window.onload = function() {
  populateCategories();
  document.getElementById("categoryFilter").value = lastSelectedCategory;
  showRandomQuote();
  fetchQuotesFromServer();

  // Periodically sync with server
  setInterval(fetchQuotesFromServer, 30000); // every 30 sec
};