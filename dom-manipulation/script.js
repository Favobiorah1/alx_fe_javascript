// Initial quotes array
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Life" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Populate category dropdown
function updateCategoryFilter() {
  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = <option value="all">All</option>;
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;
  
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = "${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category};
}

// Add a new quote
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote
  quotes.push({ text: newText, category: newCategory });

  // Update dropdown
  updateCategoryFilter();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Initialize dropdown
updateCategoryFilter();