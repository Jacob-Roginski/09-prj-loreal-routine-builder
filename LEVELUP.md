# Advanced Features & Level Up Opportunities

This document provides code examples for the optional "Level Up" extra credit features.

---

## 1. Product Search Filter (10 pts)

Add real-time product filtering in the grid alongside category filtering.

### Add to HTML:

```html
<!-- Add after the category filter -->
<div class="search-section">
  <input
    id="productSearch"
    type="text"
    placeholder="Search products by name..."
    class="search-input"
  />
</div>
```

### Add to CSS:

```css
.search-input {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  border: 2px solid #ff003b;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: "Montserrat", Arial, sans-serif;
}

.search-input::placeholder {
  color: #ccc;
}

.search-input:focus {
  outline: none;
  border-color: #ff003b;
  box-shadow: 0 0 0 3px rgba(255, 0, 59, 0.1);
}
```

### Add to JavaScript:

```javascript
// After the DOM element declarations, add:
const productSearch = document.getElementById("productSearch");
let currentCategory = "";
let currentSearchQuery = "";

// Function to filter products by both category and search
function filterAndDisplayProducts() {
  const products = allProducts.filter((product) => {
    const matchesCategory =
      !currentCategory || product.category === currentCategory;
    const matchesSearch =
      !currentSearchQuery ||
      product.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  displayProducts(products);
}

// Update category filter handler:
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  currentCategory = e.target.value;
  filterAndDisplayProducts();
});

// Add search filter handler:
productSearch.addEventListener("input", (e) => {
  currentSearchQuery = e.target.value;
  filterAndDisplayProducts();
});
```

---

## 2. Web Search Integration (10 pts)

Update the chatbot to include real-time web search in responses.

### Option A: Using OpenAI's Web Search Model

Update `cloudflare-worker.js`:

```javascript
const openaiResponse = await fetch(
  "https://api.openai.com/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo", // Model with web search
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      tools: [
        {
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for information",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query",
                },
              },
            },
          },
        },
      ],
    }),
  },
);
```

### Option B: Integration with Search API

Add Bing Search or Google Search:

```javascript
// In script.js, add this helper:
async function performWebSearch(query) {
  const searchResponse = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
    {
      headers: { "Ocp-Apim-Subscription-Key": env.SEARCH_API_KEY },
    },
  );
  return await searchResponse.json();
}

// In handleChatSubmission, enhance the system message:
const systemMessage = {
  role: "system",
  content:
    "You are an expert L'Oréal beauty advisor. When available, include references to web search results and cite sources. Always mention product names and brands specifically. If you search the web for recent information, clearly state where the information came from.",
};

conversationHistory.unshift(systemMessage);
```

### Display Search Results in Chat:

```javascript
// Enhanced displayMessage function:
function displayMessage(role, content, sources = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${role}`;

  if (sources) {
    messageDiv.innerHTML = `
      <p>${content}</p>
      <div class="message-sources" style="margin-top: 10px; font-size: 0.9em; opacity: 0.7;">
        <strong>Sources:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${sources.map((s) => `<li><a href="${s.url}" target="_blank">${s.title}</a></li>`).join("")}
        </ul>
      </div>
    `;
  } else {
    messageDiv.textContent = content;
  }

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
```

---

## 3. RTL Language Support (5 pts)

Add right-to-left language support for Arabic, Hebrew, etc.

### Add to HTML (in head):

```html
<html lang="en" id="htmlRoot"></html>
```

### Add Language Selector to HTML (in header):

```html
<div class="language-selector">
  <select id="languageSelector">
    <option value="en">English</option>
    <option value="ar">العربية (Arabic)</option>
    <option value="he">עברית (Hebrew)</option>
  </select>
</div>
```

### Add RTL CSS:

```css
/* RTL Styles */
html[lang="ar"],
html[lang="he"] {
  direction: rtl;
  text-align: right;
}

html[lang="en"] {
  direction: ltr;
  text-align: left;
}

/* Adjust flexbox for RTL */
html[lang="ar"] .products-grid,
html[lang="he"] .products-grid,
html[lang="ar"] #selectedProductsList,
html[lang="he"] #selectedProductsList {
  flex-direction: row-reverse;
}

html[lang="ar"] .product-card,
html[lang="he"] .product-card {
  flex-direction: row-reverse;
}

html[lang="ar"] .selected-item,
html[lang="he"] .selected-item {
  flex-direction: row-reverse;
  margin-left: auto;
  margin-right: 0;
}

html[lang="ar"] .chat-message.user,
html[lang="he"] .chat-message.user {
  margin-left: 0;
  margin-right: auto;
  border-radius: 8px 2px 8px 8px;
}

html[lang="ar"] .chat-message.assistant,
html[lang="he"] .chat-message.assistant {
  margin-right: 0;
  margin-left: auto;
  border-radius: 2px 8px 8px 8px;
}

html[lang="ar"] .product-card.selected::after,
html[lang="he"] .product-card.selected::after {
  right: auto;
  left: 10px;
}
```

### Add Language Logic to JavaScript:

```javascript
const languageSelector = document.getElementById("languageSelector");
const htmlRoot = document.getElementById("htmlRoot");

// Load saved language preference
function loadLanguagePreference() {
  const saved = localStorage.getItem("selectedLanguage") || "en";
  languageSelector.value = saved;
  setLanguage(saved);
}

// Set language and direction
function setLanguage(lang) {
  htmlRoot.lang = lang;
  localStorage.setItem("selectedLanguage", lang);

  // Update content if you have translations
  updateUILanguage(lang);
}

// Language change handler
languageSelector.addEventListener("change", (e) => {
  setLanguage(e.target.value);
});

// Simple translation object (extend as needed)
const translations = {
  en: {
    selectCategory: "Choose a Category",
    selectedProducts: "Selected Products",
    generateRoutine: "Generate Routine",
    clearAll: "Clear All",
    chatPlaceholder: "Ask me about products or routines…",
  },
  ar: {
    selectCategory: "اختر فئة",
    selectedProducts: "المنتجات المختارة",
    generateRoutine: "إنشاء روتين",
    clearAll: "مسح الكل",
    chatPlaceholder: "اسأل عن المنتجات أو الروتين…",
  },
  he: {
    selectCategory: "בחר קטגוריה",
    selectedProducts: "מוצרים שנבחרו",
    generateRoutine: "צור שגרה",
    clearAll: "נקה את הכל",
    chatPlaceholder: "שאל אותי על מוצרים או שגרות…",
  },
};

function updateUILanguage(lang) {
  const t = translations[lang] || translations.en;

  // Update placeholders and labels
  document
    .querySelector(".userInput")
    ?.setAttribute("placeholder", t.chatPlaceholder);
  document
    .querySelector(".chat-form input")
    ?.setAttribute("placeholder", t.chatPlaceholder);
}

// Call on init
loadLanguagePreference();
```

---

## Testing Your Level Up Features

### Product Search

- [ ] Search box appears below category filter
- [ ] Typing filters products in real-time
- [ ] Search works across product names and brands
- [ ] Category + search filter work together
- [ ] Results update as you type

### Web Search Integration

- [ ] API calls include web search context
- [ ] Responses mention sources and citations
- [ ] Links are clickable in chat
- [ ] Recent information is included in responses
- [ ] Format is easy to read

### RTL Support

- [ ] Language selector appears in header
- [ ] Changing language changes text direction
- [ ] Products grid aligns right-to-left
- [ ] Chat messages align properly (RTL = right-aligned assistant)
- [ ] All UI elements flip appropriately
- [ ] localStorage persists language choice

---

## Submission Notes

When submitting with Level Up features:

1. **Update README.md** to document which features you implemented
2. **Add comments** in your code explaining the new functionality
3. **Test thoroughly** - especially RTL with actual RTL content
4. **Note the extra credit** in your submission:
   - Product Search: 10 pts
   - Web Search: 10 pts
   - RTL Support: 5 pts
   - Maximum total: 25 pts

---

## Additional Enhancement Ideas

Beyond the Level Up features, here are more ideas:

- **Dark Mode Toggle** - Add preferred-color-scheme support
- **Routine History** - Save generated routines to review later
- **Product Filtering** - Filter by skin type, concern, or price
- **Routine Scheduling** - Suggest AM/PM timing automatically
- **Voice Input** - Add speech-to-text for hands-free queries
- **Image Upload** - Let users upload skin photos for analysis
- **Product Ratings** - Display user ratings and reviews
- **Wishlist** - Add products to a favorites/wishlist

---

## Resources

- [OpenAI API Web Browsing](https://platform.openai.com/docs/)
- [MDN: Global Attributes (lang)](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Bing Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)

Good luck with your enhancements! 🎨✨
