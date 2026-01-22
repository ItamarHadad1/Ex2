# API Keys Guide - Where and How to Set Them

## 🔑 Overview

You need **ONE API key** for this project: **AI/LLM API Key** (for summarization feature).

The **GitHub API** works without a key, but has rate limits (60 requests/hour). A GitHub token is **optional** and only needed if you want higher rate limits.

---

## 1. AI/LLM API Key (REQUIRED for Summarization) ⭐

This key is **REQUIRED** if you want to use the "Summarize" feature. Without it, you can still fetch GitHub projects, but summaries won't work.

### Where to Put It: **In the App Settings (Browser localStorage)**

**Step-by-Step:**

1. **Start the app:**
   ```bash
   cd Ex2
   npm install
   npm run dev
   ```

2. **Open the app** in your browser: http://localhost:3000

3. **Click the "Settings" button** (top right of the page)

4. **Select your AI Provider:**
   - **Groq** (Recommended - FREE tier available) ⭐
   - OpenAI (Paid)
   - Anthropic (Paid)

5. **Enter your API Key** in the input field

6. **Click "Save"**

That's it! The key is now stored in your browser's localStorage and will be used for all summarization requests.

### How to Get API Keys:

#### **Option 1: Groq (FREE - Recommended)** ⭐
1. Go to: https://console.groq.com/keys
2. Sign up (free account)
3. Create a new API key
4. Copy the key (starts with `gsk_...`)
5. Paste it in the Settings modal

**Free tier includes:** Fast inference, generous limits

#### **Option 2: OpenAI (Paid)**
1. Go to: https://platform.openai.com/api-keys
2. Sign up / Login
3. Create a new API key
4. Copy the key (starts with `sk-...`)
5. Paste it in the Settings modal

**Cost:** Pay per use (check OpenAI pricing)

#### **Option 3: Anthropic (Paid)**
1. Go to: https://console.anthropic.com/settings/keys
2. Sign up / Login
3. Create a new API key
4. Copy the key (starts with `sk-ant-...`)
5. Paste it in the Settings modal

**Cost:** Pay per use (check Anthropic pricing)

### Where is it Stored?
- **Location:** Browser's localStorage (client-side only)
- **Keys:** `apiKey` and `apiProvider`
- **Security:** Never sent to our servers except when making API calls to the LLM provider
- **Persistence:** Saved in your browser until you clear it or clear browser data

### How to Change/Remove:
- Click "Settings" again
- Update the key or click "Clear"
- Click "Save"

---

## 2. GitHub Token (OPTIONAL - For Higher Rate Limits)

The GitHub API works **without a key**, but you're limited to **60 requests/hour**.

If you want **5,000 requests/hour**, you can add a GitHub token as an environment variable.

### Where to Put It: **Environment Variable (Optional)**

#### **For Local Development:**

1. **Create a `.env.local` file** in the `Ex2` directory:
   ```bash
   cd Ex2
   touch .env.local
   ```

2. **Add your GitHub token:**
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```

3. **Update the GitHub API route** to use it (optional - currently commented out):

   In `src/app/api/github/route.ts`, uncomment and update line 62:
   ```typescript
   headers: {
     'Accept': 'application/vnd.github.v3+json',
     'Authorization': `token ${process.env.GITHUB_TOKEN}`, // Uncomment this
   },
   ```

#### **For Vercel Deployment:**

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name:** `GITHUB_TOKEN`
   - **Value:** Your GitHub token
   - **Environment:** Production, Preview, Development (select all)

### How to Get GitHub Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "AI News Aggregator")
4. Select scopes (you only need **public_repo** - for public repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Paste it in `.env.local` or Vercel environment variables

### Is it Required?
**NO!** The app works perfectly without it. You only need it if:
- You're making many requests and hitting the 60/hour limit
- You want faster response times
- You're deploying to production with high traffic

---

## 📋 Quick Summary

| Key Type | Required? | Where to Put | How to Get |
|----------|-----------|--------------|------------|
| **AI/LLM API Key** | ⭐ YES (for summaries) | Settings modal in app | Groq (free): https://console.groq.com/keys<br>OpenAI: https://platform.openai.com/api-keys<br>Anthropic: https://console.anthropic.com/settings/keys |
| **GitHub Token** | ❌ NO (optional) | `.env.local` (local) or Vercel env vars (production) | https://github.com/settings/tokens |

---

## 🔒 Security Notes

1. **AI/LLM API Key:**
   - Stored in browser's localStorage (client-side only)
   - Never stored on our server
   - Sent directly to the LLM provider (OpenAI/Groq/Anthropic)
   - Only visible to you (in your browser)

2. **GitHub Token:**
   - Stored as environment variable (server-side)
   - Never exposed to the client
   - Used only for GitHub API calls

3. **Best Practices:**
   - Don't commit API keys to Git (`.env.local` is in `.gitignore`)
   - Rotate keys periodically
   - Use separate keys for development and production
   - Never share your API keys publicly

---

## ✅ Testing Your Setup

1. **Without API Key:**
   - App loads ✅
   - "Fetch Projects" works ✅
   - Projects display ✅
   - "Summarize" button shows error ❌

2. **With API Key:**
   - App loads ✅
   - "Fetch Projects" works ✅
   - Projects display ✅
   - "Summarize" button works ✅
   - Summary appears in card ✅

---

## 🆘 Troubleshooting

**"Failed to summarize. Please check your API key in Settings."**
- Make sure you entered the API key correctly
- Check that the provider matches (Groq key with Groq provider, etc.)
- Verify the key is valid (try generating a new one)
- Check browser console for detailed error messages

**GitHub API rate limit error:**
- You hit the 60/hour limit (unauthenticated)
- Wait an hour or add a GitHub token to increase limits
- Or reduce the number of queries in the GitHub API route

**API key not saving:**
- Check browser console for errors
- Try clearing browser cache and localStorage
- Make sure you're not in incognito/private mode (localStorage might be restricted)

---

## 📚 Additional Resources

- **Groq Documentation:** https://console.groq.com/docs
- **OpenAI Documentation:** https://platform.openai.com/docs
- **Anthropic Documentation:** https://docs.anthropic.com
- **GitHub API Documentation:** https://docs.github.com/en/rest
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables