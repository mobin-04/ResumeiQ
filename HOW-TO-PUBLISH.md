# 🚀 How to Publish ResumeIQ (No coding needed)

Follow these steps exactly. It takes about 10 minutes total.

---

## STEP 1 — Get a free Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"** → copy it and save it somewhere safe
   - It looks like: `sk-ant-api03-xxxxxxxxxxxxxxxx`

---

## STEP 2 — Upload files to GitHub (free)

1. Go to https://github.com and create a free account
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it: `resumeiq`
4. Set it to **Public**
5. Click **"Create repository"**
6. On the next page, click **"uploading an existing file"**
7. **Drag and drop ALL these files into the upload area:**
   ```
   server.js
   package.json
   .gitignore
   public/
     index.html
   ```
   ⚠️ Make sure the `public` folder contains `index.html` inside it
8. Click **"Commit changes"**

---

## STEP 3 — Deploy on Render (free hosting)

1. Go to https://render.com and sign up (use your GitHub account)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** → select `resumeiq`
4. Fill in the settings:
   - **Name:** `resumeiq` (or anything you like)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Scroll down to **"Environment Variables"** → click **"Add Environment Variable"**
   - Key: `ANTHROPIC_API_KEY`
   - Value: paste your API key from Step 1
6. Click **"Create Web Service"**
7. Wait 2–3 minutes for it to deploy

---

## STEP 4 — Your site is live! 🎉

Render will give you a URL like:
```
https://resumeiq.onrender.com
```

Share this link with anyone — they can upload their resume and get an ATS score instantly, **no API key needed on their end**.

---

## 💡 Tips

- **Free tier note:** Render's free tier "sleeps" after 15 minutes of no traffic. The first visit after sleep takes ~30 seconds to wake up. This is normal and free.
- **Costs:** Anthropic charges per API call (~$0.003 per resume analyzed). Very cheap.
- **Custom domain:** In Render dashboard → Settings → Custom Domains, you can add your own domain (e.g. resumeiq.com)

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| Site shows "API key not configured" | Check you added `ANTHROPIC_API_KEY` in Render environment variables |
| Upload fails | Make sure `public/index.html` is inside the `public` folder in GitHub |
| Build fails | Make sure `package.json` and `server.js` are in the root (not inside any folder) |
