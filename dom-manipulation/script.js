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

        // Post the new quote to the server
        postQuoteToServer(newQuote);

        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";

        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields.');
    }
}
// Function to sync quotes between local storage and server
async function syncQuotes() {
    console.log("Syncing quotes with the server...");
    await fetchQuotesFromServer(); // Fetch updates from the server
    console.log("Sync complete.");
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

// Function to show notifications
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000); // Remove the notification after 3 seconds
}

// Function to simulate fetching quotes from a server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const serverQuotes = await response.json();

        // Assume the server response has 'title' as quote text and 'body' as category
        const formattedQuotes = serverQuotes.map(post => ({
            text: post.title,
            category: post.body
        }));

        let conflictsResolved = false;

        formattedQuotes.forEach(serverQuote => {
            const localIndex = quotes.findIndex(localQuote => localQuote.text === serverQuote.text);
            if (localIndex !== -1) {
                // Conflict detected, resolve it
                quotes[localIndex] = resolveConflicts(quotes[localIndex], serverQuote);
                conflictsResolved = true;
            } else {
                // No conflict, add new server quote to local
                quotes.push(serverQuote);
            }
        });

        saveQuotes();
        populateCategories();

        if (conflictsResolved) {
            showNotification("Data conflict detected and resolved with server data.", "warning");
        }
        showNotification("Quotes synced with server!", "success");
        console.log("Quotes fetched and conflicts resolved.");
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        showNotification("Failed to sync quotes with the server.", "error");
    }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1 // Dummy user ID for simulation
            })
        });

        const serverResponse = await response.json();
        console.log("Quote posted to server:", serverResponse);
        showNotification("Quote posted to server successfully!", "success");
    } catch (error) {
        console.error("Error posting quote to server:", error);
        showNotification("Failed to post quote to server.", "error");
    }
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
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Initialize the form and categories on page load
document.addEventListener("DOMContentLoaded", () => {
    createAddQuoteForm();
    populateCategories();
    showRandomQuote(); // Show a random quote when the page loads

    // Periodic data syncing (every 5 minutes)
    setInterval(fetchQuotesFromServer, 5 * 60 * 1000); // 5 minutes interval
});
