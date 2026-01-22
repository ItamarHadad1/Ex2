# Project Stages Explanation

This document explains each stage of the AI News Aggregator MVP project.

## 🎯 Overview

The project is built in stages (A, B, C, D) as specified in the requirements. Each stage builds upon the previous one to create a complete MVP.

---

## Stage A: Backend API Route (GitHub Data Fetching)

### What This Stage Does
Creates a Next.js API route that fetches trending GitHub repositories related to AI/ML.

### Files Created
- `src/app/api/github/route.ts` - The API route handler

### Key Concepts Explained

#### 1. **Next.js API Routes**
Next.js API Routes are serverless functions that run on the server. They're defined in the `app/api` directory (App Router) or `pages/api` (Pages Router). 

In our case, we create `/api/github` which becomes accessible at `http://localhost:3000/api/github`.

#### 2. **GitHub REST API**
We use GitHub's REST API to search for repositories. The search endpoint is:
```
GET https://api.github.com/search/repositories
```

**Query Syntax:**
- `topic:AI` - Search for repositories with the "AI" topic
- `pushed:>2024-01-01` - Repositories pushed after a date
- `stars:>10` - Repositories with at least 10 stars

**Rate Limits:**
- Unauthenticated: 60 requests/hour
- With GitHub token: 5,000 requests/hour

#### 3. **Multiple Queries Strategy**
We execute multiple queries with different AI/ML topics to get comprehensive results:
- `topic:AI`
- `topic:machine-learning`
- `topic:artificial-intelligence`
- `topic:deep-learning`
- `topic:llm`
- `topic:nlp`

Then we merge and deduplicate the results.

#### 4. **Filtering Logic**
After fetching, we:
1. Deduplicate by repository name (using a Map)
2. Filter to ensure AI/ML topics are present
3. Sort by star count (descending)
4. Limit to top 50 results

### How It Works
```typescript
// 1. Calculate date 24 hours ago
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

// 2. Build search queries
const queries = [
  `topic:AI pushed:>${dateStr} stars:>10`,
  // ... more queries
]

// 3. Fetch from each query
for (const query of queries) {
  const response = await fetch(`https://api.github.com/search/repositories?q=${query}`)
  // ... process results
}

// 4. Merge, filter, and return
return NextResponse.json({ projects, count })
```

---

## Stage B: Frontend Components & Styling

### What This Stage Does
Creates the user interface with React components and Apple-inspired CSS styling.

### Files Created
- `src/app/page.tsx` - Main home page
- `src/app/page.module.css` - Home page styles
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles
- `src/components/NewsCard.tsx` - Project card component
- `src/components/NewsCard.module.css` - Card styles

### Key Concepts Explained

#### 1. **Next.js App Router**
Next.js 14 uses the App Router by default. Key differences from Pages Router:
- `app/` directory instead of `pages/`
- `layout.tsx` for shared layouts
- `page.tsx` for routes
- `'use client'` directive for client-side components

#### 2. **CSS Modules**
CSS Modules allow component-scoped CSS:
```tsx
// Component
import styles from './NewsCard.module.css'
<div className={styles.card}>...</div>

// CSS Module
.card { /* styles */ }
```

Benefits:
- No global CSS conflicts
- Type-safe class names (in TypeScript)
- Scoped styling

#### 3. **Apple-Inspired Design Principles**

**Typography:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...
```
- Uses system fonts for native feel
- Smooth font rendering with `-webkit-font-smoothing`

**Colors:**
- Background: `#F5F5F7` (light gray) or `#FFFFFF` (white)
- Text: `#1D1D1F` (dark gray, almost black)
- Accent: `#007AFF` (Apple blue)

**Effects:**
- Border radius: `12px` (rounded corners)
- Box shadow: `0 2px 8px rgba(0, 0, 0, 0.06)` (subtle shadows)
- Transitions: `0.2s-0.3s ease` (smooth animations)

#### 4. **Component Architecture**

**Home Page (`page.tsx`):**
- Uses `'use client'` for React hooks (useState)
- Fetches data from `/api/github`
- Renders list of `NewsCard` components

**NewsCard Component:**
- Receives project data as props
- Displays project information
- Has "Summarize" button (functionality in Stage C)

### How It Works
```tsx
// 1. State management
const [projects, setProjects] = useState<Project[]>([])
const [loading, setLoading] = useState(false)

// 2. Fetch data
const fetchProjects = async () => {
  setLoading(true)
  const response = await fetch('/api/github')
  const data = await response.json()
  setProjects(data.projects)
  setLoading(false)
}

// 3. Render
return (
  <div className={styles.grid}>
    {projects.map(project => (
      <NewsCard key={project.id} project={project} />
    ))}
  </div>
)
```

---

## Stage C: AI Summarization & Settings

### What This Stage Does
Adds AI-powered summarization and settings management for API keys.

### Files Created
- `src/app/api/summarize/route.ts` - Summarization API route
- `src/components/Settings.tsx` - Settings modal component
- `src/components/Settings.module.css` - Settings styles

### Key Concepts Explained

#### 1. **LLM API Integration**
We support three providers:

**OpenAI (GPT-3.5-turbo):**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  }),
})
```

**Anthropic (Claude):**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: prompt }],
  }),
})
```

**Groq (Llama):**
```typescript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  }),
})
```

#### 2. **In-Memory Caching**
We implement a simple in-memory cache with 5-minute TTL:

```typescript
const cache = new Map<string, { summary: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Check cache
const cacheKey = hashText(text)
const cached = cache.get(cacheKey)
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return cached.summary
}

// Store in cache
cache.set(cacheKey, { summary, timestamp: Date.now() })
```

**Why Cache?**
- Reduces API calls (saves money/rate limits)
- Faster response times
- Better user experience

**Limitations:**
- Cache is in-memory (lost on server restart)
- Not shared across multiple server instances
- For production, consider Redis or similar

#### 3. **LocalStorage for API Keys**
Browser's localStorage stores data persistently in the browser:

```typescript
// Save
localStorage.setItem('apiKey', apiKey)
localStorage.setItem('apiProvider', provider)

// Load
const apiKey = localStorage.getItem('apiKey')
const provider = localStorage.getItem('apiProvider')
```

**Security Considerations:**
- Keys stored client-side only (never sent to our server except for API calls)
- Keys sent directly to LLM provider (OpenAI, Anthropic, Groq)
- Our server acts as a proxy (doesn't store keys)

#### 4. **Settings Modal**
A modal component that:
- Shows/hides with overlay
- Allows entering API key
- Allows selecting provider
- Saves to localStorage
- Has proper error handling

**Modal Implementation:**
```tsx
<div className={styles.overlay} onClick={onClose}>
  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
    {/* Modal content */}
  </div>
</div>
```

The `stopPropagation()` prevents closing when clicking inside the modal.

### How It Works

**Summarization Flow:**
1. User clicks "Summarize" button on a project card
2. Frontend reads API key from localStorage
3. Frontend sends request to `/api/summarize` with text and API key
4. Backend checks cache first
5. If not cached, calls LLM API with user's API key
6. Stores result in cache
7. Returns summary to frontend
8. Frontend displays summary in the card

**Settings Flow:**
1. User clicks "Settings" button
2. Modal opens with current settings (loaded from localStorage)
3. User enters API key and selects provider
4. User clicks "Save"
5. Settings saved to localStorage
6. Modal closes
7. Future summarization requests use new settings

---

## Stage D: Deployment to Vercel

### What This Stage Does
Prepares the project for one-click deployment to Vercel.

### Requirements
- GitHub repository
- Vercel account

### Key Concepts Explained

#### 1. **Vercel Deployment**
Vercel automatically detects Next.js projects and configures:
- Build command: `npm run build`
- Output directory: `.next`
- Node.js version: Latest LTS

#### 2. **Environment Variables** (Optional)
If you want to add a GitHub token for higher rate limits:
- Go to Vercel project settings
- Add environment variable: `GITHUB_TOKEN`
- Update API route to use: `process.env.GITHUB_TOKEN`

#### 3. **Build Process**
```bash
# Vercel runs these commands:
npm install          # Install dependencies
npm run build        # Build Next.js app
npm start            # Start production server
```

### How It Works
1. Push code to GitHub
2. Import repository in Vercel
3. Vercel detects Next.js
4. Configure build settings (usually auto-detected)
5. Deploy!
6. Get deployment URL (e.g., `https://your-project.vercel.app`)

---

## 🎓 Learning Outcomes

After completing this project, you should understand:

1. **Next.js App Router** - Modern Next.js routing and API routes
2. **Serverless Functions** - API routes run as serverless functions
3. **React Hooks** - useState, useEffect for state management
4. **CSS Modules** - Component-scoped styling
5. **TypeScript** - Type safety in React and Next.js
6. **API Integration** - GitHub REST API and LLM APIs
7. **Caching Strategies** - In-memory caching for performance
8. **LocalStorage** - Client-side data persistence
9. **Modal Components** - Creating modal/dialog UI
10. **Deployment** - Deploying Next.js apps to Vercel

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [GitHub REST API](https://docs.github.com/en/rest)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [Groq API](https://console.groq.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

## 🔍 Code Structure Summary

```
Ex2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (Serverless Functions)
│   │   │   ├── github/         # Stage A: GitHub data fetching
│   │   │   └── summarize/      # Stage C: AI summarization
│   │   ├── globals.css         # Stage B: Global styles
│   │   ├── layout.tsx          # Stage B: Root layout
│   │   ├── page.tsx            # Stage B: Home page
│   │   └── page.module.css     # Stage B: Home page styles
│   └── components/             # React Components
│       ├── NewsCard.tsx        # Stage B: Project card
│       ├── NewsCard.module.css # Stage B: Card styles
│       ├── Settings.tsx        # Stage C: Settings modal
│       └── Settings.module.css # Stage C: Settings styles
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
└── README.md                   # Project documentation
```

Each stage builds upon the previous one, creating a complete, working MVP!