# L'Oréal Product-Aware Routine Builder Chatbot

A smart AI-powered skincare and beauty routine builder that lets users browse L'Oréal products, create personalized routines, and chat with an AI advisor.

## Features

✨ **Product Selection** - Browse and select from a curated collection of L'Oréal products
📦 **Smart Routine Generation** - AI generates personalized routines based on selected products
💬 **Follow-up Chat** - Ask questions about your routine with conversation history
💾 **Local Storage** - Your selections persist across page refreshes
🎨 **L'Oréal Branding** - Designed with official brand colors (#ff003b red and #e3a535 gold)
📱 **Responsive Design** - Works beautifully on desktop, tablet, and mobile

## Getting Started

### 1. Set Up Your Cloudflare Worker

Your Cloudflare Worker acts as a secure proxy to the OpenAI API.

**Steps:**

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Click "Create an application" → "Create Worker"
3. Paste the code from `cloudflare-worker.js`
4. Go to **Settings** → **Variables**
5. Create a new **Secret** variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (get it from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))
6. Click "Deploy"
7. Copy your worker's URL (something like `https://routine-builder-abc123.yourusername.workers.dev`)

### 2. Update Your Configuration

Open `config.js` and replace:

```javascript
CLOUDFLARE_WORKER_URL: "YOUR_CLOUDFLARE_WORKER_URL_HERE",
```

with your actual Cloudflare Worker URL.

### 3. Deploy Your Site

- Push your code to GitHub
- Deploy using GitHub Pages, Vercel, Netlify, or any static host
- Test in an incognito window to ensure everything works

## How to Use

1. **Select a Category** - Choose from Cleansers, Moisturizers, Makeup, Haircare, etc.
2. **Browse Products** - Click on a product card to select it (visual feedback shows selection)
3. **View Description** - Double-click a product card to see full details in a modal
4. **Generate Routine** - Click "Generate Routine" after selecting products
5. **Ask Follow-up Questions** - Chat with the AI about your routine in the message box

## Project Structure

```
.
├── index.html              # Main HTML structure
├── script.js              # All core functionality
├── style.css              # Responsive design with brand colors
├── config.js              # Configuration (update with your worker URL)
├── products.json          # Product database
├── cloudflare-worker.js   # Server-side worker (deploy to Cloudflare)
├── img/                   # Images folder
└── README.md              # This file
```

## Key Code Features

### Product Selection with localStorage

Products are automatically saved to browser storage:

```javascript
selectedProducts = JSON.parse(localStorage.getItem("selectedProducts") || "[]");
```

### OpenAI API Integration

Uses `gpt-4o` model with conversation history for contextual responses:

```javascript
const response = await fetch(CONFIG.CLOUDFLARE_WORKER_URL, {
  method: "POST",
  body: JSON.stringify({ messages: conversationHistory, model: "gpt-4o" }),
});
```

### Product Modal

Double-click any product card to view:

- Product name and brand
- Full description
- Quick "Add to Selection" button

## Architecture

```
Browser (index.html, script.js, style.css)
         ↓
   Cloudflare Worker
         ↓
   OpenAI API (gpt-4o)
```

The worker:

- Adds CORS headers for browser compatibility
- Securely stores your OpenAI API key
- Validates requests
- Handles errors gracefully

## Customization

### L'Oréal Brand Colors

The design uses:

- **Primary Red**: `#ff003b` - buttons, selected states, headers
- **Gold**: `#e3a535` - accents, tags, highlights

Modify `style.css` to adjust colors, spacing, or layouts.

### Product Data

Edit `products.json` to add, remove, or modify products. Each product needs:

```json
{
  "id": 1,
  "brand": "CeraVe",
  "name": "Moisturizer",
  "category": "moisturizer",
  "image": "https://...",
  "description": "..."
}
```

## Troubleshooting

### "Could not generate routine" error

- ✅ Check that `CONFIG.CLOUDFLARE_WORKER_URL` is correct in `config.js`
- ✅ Verify your OpenAI API key is valid in Cloudflare Secrets
- ✅ Ensure "gpt-4o" model is available on your OpenAI account
- ✅ Check browser console (F12) for detailed error messages

### Products not saving

- ✅ Check that localStorage is enabled in your browser
- ✅ Verify no browser extensions are blocking storage
- ✅ Try in an incognito window to test

### Modal not appearing

- ✅ Double-click the product card (not just single-click)
- ✅ Check browser console for JavaScript errors

## Level Up Options (Extra Credit)

- 🔍 **Web Search**: Add real-time search to chatbot responses
- 🔎 **Product Search**: Add live search/filter in the product grid
- 🌍 **RTL Support**: Add right-to-left language support

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [localStorage MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Testing Tips

1. **Product Selection**: Click product cards, verify selection highlights appear
2. **localStorage**: Open DevTools → Application → localStorage, check entries persist
3. **API**: Check Network tab in DevTools, verify API requests succeed
4. **Responsive**: Test with F12 DevTools at 375px, 768px, and 1200px widths

## Deployment Checklist

- [ ] Configuration file updated with Cloudflare Worker URL
- [ ] Cloudflare Worker deployed with API key set
- [ ] Product data verified in products.json
- [ ] All links work (test in incognito window)
- [ ] localStorage persists selections
- [ ] Chat messages display correctly
- [ ] Mobile responsiveness verified
- [ ] Code committed to GitHub
- [ ] Live site URL working

---

**Made with ❤️ for L'Oréal Beauty Advisors** | Powered by OpenAI GPT-4o
