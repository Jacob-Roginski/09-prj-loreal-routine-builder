/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const languageSelector = document.getElementById("languageSelector");
const webSearchToggle = document.getElementById("webSearchToggle");
const htmlRoot = document.getElementById("htmlRoot");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const generateRoutineBtn = document.getElementById("generateRoutine");
const generateRoutineLabel = document.getElementById("generateRoutineLabel");
const selectedProductsList = document.getElementById("selectedProductsList");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");
const siteTitle = document.getElementById("siteTitle");
const selectedProductsTitle = document.getElementById("selectedProductsTitle");
const chatTitle = document.getElementById("chatTitle");

/* State management */
let allProducts = [];
let selectedProducts = [];
let conversationHistory = [];
let currentModalProduct = null;
let currentCategory = "";
let currentSearchQuery = "";
let currentLanguage = localStorage.getItem("selectedLanguage") || "en";
let currentWebSearchEnabled = false;

const translations = {
  en: {
    siteTitle: "Smart Routine & Product Advisor",
    selectedProductsTitle: "Selected Products",
    chatTitle: "Let's Build Your Routine",
    generateRoutineLabel: "Generate Routine",
    categoryPlaceholder: "Choose a Category",
    searchPlaceholder: "Search by name or keyword",
    selectedEmpty:
      "No products selected yet. Click on a product to add it to your routine.",
    emptySearch: "No products match your filters.",
    languageLabel: "English",
  },
  ar: {
    siteTitle: "مساعد الروتين والمنتجات الذكي",
    selectedProductsTitle: "المنتجات المختارة",
    chatTitle: "لننشئ روتينك",
    generateRoutineLabel: "إنشاء الروتين",
    categoryPlaceholder: "اختر فئة",
    searchPlaceholder: "ابحث بالاسم أو الكلمة المفتاحية",
    selectedEmpty: "لم يتم اختيار أي منتج بعد.",
    emptySearch: "لا توجد منتجات تطابق الفلتر.",
    languageLabel: "العربية",
  },
  he: {
    siteTitle: "יועץ שגרה ומוצרים חכם",
    selectedProductsTitle: "מוצרים שנבחרו",
    chatTitle: "בואו נבנה את השגרה שלך",
    generateRoutineLabel: "צור שגרה",
    categoryPlaceholder: "בחר קטגוריה",
    searchPlaceholder: "חפש לפי שם או מילת מפתח",
    selectedEmpty: "עדיין לא נבחרו מוצרים.",
    emptySearch: "לא נמצאו מוצרים שמתאימים לסינון.",
    languageLabel: "עברית",
  },
};

function getLanguageName(language) {
  if (language === "ar") return "Arabic";
  if (language === "he") return "Hebrew";
  return "English";
}

function buildSystemPrompt() {
  const languageName = getLanguageName(currentLanguage);

  return `You are a helpful L'Oréal beauty advisor. Stay focused on the selected routine, skincare, haircare, makeup, fragrance, and closely related beauty topics. Use the selected product context exactly as provided. Reply in ${languageName}. Keep answers practical, concise, and useful. If web search is enabled, include current information and cite sources or links when possible.`;
}

function syncSystemPrompt() {
  const systemMessage = { role: "system", content: buildSystemPrompt() };

  if (
    conversationHistory.length === 0 ||
    conversationHistory[0].role !== "system"
  ) {
    conversationHistory.unshift(systemMessage);
    return;
  }

  conversationHistory[0] = systemMessage;
}

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("selectedLanguage", language);
  htmlRoot.lang = language;
  htmlRoot.dir = language === "ar" || language === "he" ? "rtl" : "ltr";

  const t = translations[language] || translations.en;
  siteTitle.textContent = t.siteTitle;
  selectedProductsTitle.textContent = t.selectedProductsTitle;
  chatTitle.textContent = t.chatTitle;
  generateRoutineLabel.textContent = t.generateRoutineLabel;
  productSearch.placeholder = t.searchPlaceholder;
  syncSystemPrompt();
}

function updateCategoryPlaceholder() {
  const option = categoryFilter.querySelector('option[value=""]');
  if (option) {
    option.textContent = translations[currentLanguage].categoryPlaceholder;
  }
}

function matchesSearchTerm(product, searchTerm) {
  if (!searchTerm) return true;

  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.description,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function renderNoProductsMessage(message) {
  productsContainer.innerHTML = `
    <div class="search-empty-state">${message}</div>
  `;
}

async function refreshProducts() {
  const products = await loadProducts();
  const normalizedSearch = currentSearchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      !currentCategory || product.category === currentCategory;
    return categoryMatch && matchesSearchTerm(product, normalizedSearch);
  });

  if (currentCategory === "" && normalizedSearch === "") {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Select a category or search for a product to get started.
      </div>
    `;
    return;
  }

  if (filteredProducts.length === 0) {
    renderNoProductsMessage(translations[currentLanguage].emptySearch);
    return;
  }

  displayProducts(filteredProducts);
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category or search for a product to get started.
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  if (allProducts.length === 0) {
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;
  }
  return allProducts;
}

/* Load selected products from localStorage */
function loadSelectedProducts() {
  const saved = localStorage.getItem("selectedProducts");
  selectedProducts = saved ? JSON.parse(saved) : [];
}

/* Save selected products to localStorage */
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Create HTML for displaying product cards with selection state */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      const isSelected = selectedProducts.find((p) => p.id === product.id);
      return `
        <div class="product-card ${isSelected ? "selected" : ""}" data-product-id="${
          product.id
        }" role="button" tabindex="0">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
          </div>
        </div>
    `;
    })
    .join("");

  /* Add event listeners to product cards for selection and modal */
  document.querySelectorAll(".product-card").forEach((card) => {
    /* Single click to toggle selection */
    card.addEventListener("click", (e) => {
      const productId = parseInt(card.getAttribute("data-product-id"));
      const product = allProducts.find((p) => p.id === productId);
      toggleProductSelection(product);
    });

    /* Double click to view description in modal */
    card.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      const productId = parseInt(card.getAttribute("data-product-id"));
      const product = allProducts.find((p) => p.id === productId);
      showProductModal(product);
    });

    /* Allow keyboard interaction */
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const productId = parseInt(card.getAttribute("data-product-id"));
        const product = allProducts.find((p) => p.id === productId);
        toggleProductSelection(product);
      }
    });
  });
}

/* Toggle product selection */
function toggleProductSelection(product) {
  const index = selectedProducts.findIndex((p) => p.id === product.id);

  if (index > -1) {
    /* Remove if already selected */
    selectedProducts.splice(index, 1);
  } else {
    /* Add if not selected */
    selectedProducts.push(product);
  }

  saveSelectedProducts();
  updateUI();
}

/* Show product description in modal */
function showProductModal(product) {
  currentModalProduct = product;
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductBrand").textContent = product.brand;
  document.getElementById("modalProductDescription").textContent =
    product.description;

  /* Update add button text based on selection state */
  const addBtn = document.getElementById("addFromModal");
  const isSelected = selectedProducts.find((p) => p.id === product.id);
  addBtn.textContent = isSelected
    ? "Remove from Selection"
    : "Add to Selection";

  productModal.style.display = "flex";
}

/* Close modal */
function closeModal() {
  productModal.style.display = "none";
  currentModalProduct = null;
}

/* Update Selected Products list and related UI */
function updateUI() {
  /* Update product cards to show selection state */
  document.querySelectorAll(".product-card").forEach((card) => {
    const productId = parseInt(card.getAttribute("data-product-id"));
    const isSelected = selectedProducts.find((p) => p.id === productId);

    if (isSelected) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  /* Update selected products list */
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <p style="color: #999; font-style: italic;">${translations[currentLanguage].selectedEmpty}</p>
    `;
    generateRoutineBtn.disabled = true;
  } else {
    selectedProductsList.innerHTML = selectedProducts
      .map(
        (product) => `
        <div class="selected-item">
          <span>${product.name}</span>
          <button class="remove-btn" data-product-id="${product.id}" title="Remove ${product.name}">×</button>
        </div>
      `,
      )
      .join("");

    /* Add event listeners to remove buttons */
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.getAttribute("data-product-id"));
        const product = allProducts.find((p) => p.id === productId);
        removeProduct(product);
      });
    });

    generateRoutineBtn.disabled = false;

    /* Add clear all button if there are products */
    if (selectedProducts.length > 1) {
      const clearAllBtn = document.createElement("button");
      clearAllBtn.className = "clear-all-btn";
      clearAllBtn.textContent = "Clear All";
      clearAllBtn.addEventListener("click", clearAllProducts);
      selectedProductsList.appendChild(clearAllBtn);
    }
  }
}

/* Remove a single product */
function removeProduct(product) {
  selectedProducts = selectedProducts.filter((p) => p.id !== product.id);
  saveSelectedProducts();
  updateUI();
}

/* Clear all selected products */
function clearAllProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateUI();
}

/* Generate routine using OpenAI API */
async function generateRoutine() {
  if (selectedProducts.length === 0) {
    alert("Please select at least one product to generate a routine.");
    return;
  }

  generateRoutineBtn.disabled = true;
  generateRoutineLabel.textContent = "Generating...";

  try {
    /* Prepare product data for the API */
    const productData = selectedProducts.map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
    }));

    /* Create the messages for the API */
    const userMessage = `I selected these L'Oréal products. Use the JSON data to build a personalized skincare and beauty routine with morning and evening steps, product order, and practical tips. Products JSON:\n${JSON.stringify(
      productData,
      null,
      2,
    )}`;

    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    /* Call Cloudflare Worker or OpenAI API */
    const data = await sendChatRequest(
      conversationHistory,
      currentWebSearchEnabled,
    );
    const assistantMessage = data.content;
    const citations = data.citations || [];

    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    /* Display the routine in the chat window */
    displayMessage("assistant", assistantMessage, citations);
  } catch (error) {
    console.error("Error generating routine:", error);
    displayMessage(
      "assistant",
      error.message ||
        "Sorry, I couldn't generate your routine. Please check your configuration.",
    );
  } finally {
    generateRoutineBtn.disabled = false;
    generateRoutineLabel.textContent =
      translations[currentLanguage].generateRoutineLabel;
  }
}

/* Display a message in the chat window */
function displayMessage(role, content, citations = []) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${role}`;
  messageDiv.textContent = content;

  if (citations.length > 0) {
    const citationList = document.createElement("div");
    citationList.className = "chat-citations";

    const citationTitle = document.createElement("strong");
    citationTitle.textContent = "Sources:";
    citationList.appendChild(citationTitle);

    const list = document.createElement("ul");
    citations.slice(0, 5).forEach((citation) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = citation.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = citation.title || citation.url;
      item.appendChild(link);
      list.appendChild(item);
    });

    citationList.appendChild(list);
    messageDiv.appendChild(citationList);
  }

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendChatRequest(messages, useWebSearch) {
  const response = await fetch(CONFIG.CLOUDFLARE_WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model: "gpt-4o",
      useWebSearch,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.details?.error?.message ||
      errorData?.details?.message ||
      errorData?.error ||
      "Failed to generate routine. Please check your API configuration.";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const assistantMessage =
    data?.choices?.[0]?.message?.content || data?.content || data?.output_text;
  const citations = data?.citations || [];

  if (!assistantMessage) {
    throw new Error("The worker returned an empty response.");
  }

  return {
    content: assistantMessage,
    citations,
  };
}

/* Handle chat form submission for follow-up questions */
async function handleChatSubmission(userInput) {
  if (!userInput.trim()) return;

  /* Display user message */
  displayMessage("user", userInput);

  /* Add to conversation history */
  conversationHistory.push({
    role: "user",
    content: userInput,
  });

  const userInputElement = document.getElementById("userInput");
  userInputElement.value = "";

  try {
    /* Call API with conversation history */
    const data = await sendChatRequest(
      conversationHistory,
      currentWebSearchEnabled,
    );
    const assistantMessage = data.content;
    const citations = data.citations || [];

    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    displayMessage("assistant", assistantMessage, citations);
  } catch (error) {
    console.error("Error in chat:", error);
    displayMessage(
      "assistant",
      error.message ||
        "I apologize, but I couldn't process your question. Please try again.",
    );
  }
}

/* Filter and display products when category or search changes */
categoryFilter.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  refreshProducts();
});

productSearch.addEventListener("input", (e) => {
  currentSearchQuery = e.target.value;
  refreshProducts();
});

languageSelector.addEventListener("change", (e) => {
  applyLanguage(e.target.value);
  updateCategoryPlaceholder();
  refreshProducts();
  updateUI();
});

webSearchToggle.addEventListener("change", (e) => {
  currentWebSearchEnabled = e.target.checked;
  syncSystemPrompt();
});

/* Generate Routine button click handler */
generateRoutineBtn.addEventListener("click", generateRoutine);

/* Chat form submission handler */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = document.getElementById("userInput").value;
  handleChatSubmission(userInput);
});

/* Modal event listeners */
closeModalBtn.addEventListener("click", closeModal);

document.getElementById("addFromModal").addEventListener("click", () => {
  if (currentModalProduct) {
    toggleProductSelection(currentModalProduct);
    closeModal();
    updateUI();
  }
});

/* Close modal when clicking outside */
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) {
    closeModal();
  }
});

/* Initialize the app */
async function init() {
  await loadProducts();
  loadSelectedProducts();
  applyLanguage(currentLanguage);
  updateCategoryPlaceholder();
  syncSystemPrompt();
  updateUI();
}

/* Start the app when DOM is ready */
init();
