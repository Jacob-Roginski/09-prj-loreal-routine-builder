# Quick Start Guide - 5 Minutes to Launch

## What You Have

- ✅ Complete HTML structure with product grid and chat
- ✅ Product database with 35 L'Oréal products
- ✅ Full JavaScript implementation (selection, localStorage, chat)
- ✅ Beautiful design with brand colors
- ✅ Cloudflare Worker template

## What You Need to Do

### 1️⃣ Get OpenAI API Key (2 min)

```
Go to: https://platform.openai.com/api-keys
Create a new API key
Copy it somewhere safe
```

### 2️⃣ Deploy Cloudflare Worker (2 min)

```
1. Go to https://dash.cloudflare.com
2. Click "Create an application" → "Create Worker"
3. Paste contents of cloudflare-worker.js
4. Click "Save and Deploy"
5. Go to Settings → Variables → Add Secret:
   - Name: OPENAI_API_KEY
   - Value: Your API key from step 1
6. Save and note your worker URL (looks like https://routine-...workers.dev)
```

### 3️⃣ Update config.js (1 min)

```javascript
// In config.js, replace:
CLOUDFLARE_WORKER_URL: "YOUR_CLOUDFLARE_WORKER_URL_HERE",

// With your actual URL from step 2:
CLOUDFLARE_WORKER_URL: "https://routine-abc123.yourusername.workers.dev",
```

That's it! Your app is ready to test.

## Test It

**Option A: Local Testing**

```bash
# Python 3
python3 -m http.server 8000
# Then open http://localhost:8000
```

**Option B: VS Code Live Server**

- Install "Live Server" extension
- Right-click index.html → "Open with Live Server"

## Deploy to Production

1. Push code to GitHub
2. Deploy using Vercel, Netlify, or GitHub Pages
3. Test the live URL in an incognito window

## How It Works

1. **Select Products** → Click product cards
2. **View Details** → Double-click to see full description
3. **Generate Routine** → Click button (AI generates routine)
4. **Ask Questions** → Chat about your routine
5. **Everything Saves** → Your selections stay even after reload

## Troubleshooting

**"API Error" message?**

- Check your `config.js` has the correct worker URL
- Verify worker was deployed successfully
- Open DevTools (F12) → Console to see error details

**Products not showing?**

- Select a category from the dropdown
- Check browser console for errors

**Nothing works?**

- Make sure you're on http://localhost (not https://) if testing locally
- Try an incognito window
- Check DevTools Console (F12) for error messages

---

## File Reference

- `index.html` - Main page (don't need to change)
- `script.js` - All logic (don't need to change)
- `style.css` - All styling (don't need to change)
- `config.js` - ⚠️ **NEED TO UPDATE THIS**
- `cloudflare-worker.js` - Copy to Cloudflare Workers (don't modify)
- `products.json` - Product database (ready to go)

---

**You're ready! Start with step 1 above.** 🚀
