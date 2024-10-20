// Array to hold quote objects
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Life" },
    { text: "You only live once, but if you do it right, once is enough.", category: "Life" },
    { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "Friendship" },
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to show a random quote based on the selected category
function showRandomQuote() {
    const selectedCategory = localStorage.getItem("selectedCategory") || "all";
    let filteredQuotes = quotes;

    if (selectedCategory !== "all") {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quoteDisplay = document.getElementById("quoteDisplay");

    if (filteredQuotes.length > 0) {
        quoteDisplay.innerHTML = `<strong>${filteredQuotes[randomIndex].text}</strong> - <em>${filteredQuotes[randomIndex].category}</em>`;
    } else {
        quoteDisplay.innerHTML = "No quotes available for the selected category.";
    }
}

// Function to create the add quote form
function createAddQuoteForm() {
    const formContainer = document.getElementById("quoteFormContainer");

    const quoteInput = document.createElement("input");
    quoteInput.id = "newQuoteText";
    quoteInput.type = "text";
    quoteInput.placeholder = "Enter a new quote";

    const categoryInput = document.createElement("input");
    categoryInput.id = "newQuoteCategory";
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    addButton.onclick = addQuote;

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (quoteText && quoteCategory) {
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories(); // Update categories when a new quote is added

        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";

        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields.');
    }
}

// Function to populate the category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // Clear existing options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Populate new options
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the last selected filter
    const lastSelected = localStorage.getItem("selectedCategory") || "all";
    categoryFilter.value = lastSelected;
}

// Function to filter quotes based on the selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selectedCategory);
    showRandomQuote(); // Update the displayed quote
}

// Function to export quotes as JSON
function exportQuotes() {
    const jsonQuotes = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonQuotes], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);

// Initialize the form and categories on page load
createAddQuoteForm();
populateCategories();
showRandomQuote(); // Show a random quote when the page loads
