/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const generateRoutineBtn = document.getElementById("generateRoutine");
const selectedProductsList = document.getElementById("selectedProductsList");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");

/* State management */
let allProducts = [];
let selectedProducts = [];
let conversationHistory = [];
let currentModalProduct = null;

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
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
      <p style="color: #999; font-style: italic;">No products selected yet. Click on a product to add it to your routine.</p>
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
  generateRoutineBtn.textContent = "Generating...";

  try {
    /* Prepare product data for the API */
    const productData = selectedProducts.map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
    }));

    /* Create the messages for the API */
    const userMessage = `I've selected these L'Oréal products: ${selectedProducts
      .map((p) => p.name)
      .join(
        ", ",
      )}. Please create a personalized skincare and beauty routine using these products. Include morning and evening steps, and any important tips for using them together.`;

    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    /* Call Cloudflare Worker or OpenAI API */
    const response = await fetch(CONFIG.CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
        model: "gpt-4o",
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
    const assistantMessage = data.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    /* Display the routine in the chat window */
    displayMessage("assistant", assistantMessage);
  } catch (error) {
    console.error("Error generating routine:", error);
    displayMessage(
      "assistant",
      "Sorry, I couldn't generate your routine. Please make sure your Cloudflare Worker URL is configured correctly. Check the console for details.",
    );
  } finally {
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML =
      '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine';
  }
}

/* Display a message in the chat window */
function displayMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${role}`;
  messageDiv.textContent = content;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
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
    const response = await fetch(CONFIG.CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
        model: "gpt-4o",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.details?.error?.message ||
        errorData?.details?.message ||
        errorData?.error ||
        "API request failed";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    displayMessage("assistant", assistantMessage);
  } catch (error) {
    console.error("Error in chat:", error);
    displayMessage(
      "assistant",
      "I apologize, but I couldn't process your question. Please try again.",
    );
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  displayProducts(filteredProducts);
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
  updateUI();
}

/* Start the app when DOM is ready */
init();
