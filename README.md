# AI News Aggregator (MVP)

A lightweight Next.js web application that aggregates weekly AI/ML trends from GitHub and Hugging Face. The system displays popular projects from GitHub (filtered by AI/ML topics) and trending Spaces from Hugging Face, summarizes them using an LLM API, and presents them in a clean Apple-inspired interface.

## 📋 Project Description

This is an MVP (Minimum Viable Product) version of the AI News Aggregator. It:
- Fetches trending GitHub repositories from the last 24 hours
- Fetches trending Hugging Face Spaces (AI/ML demos)
- Filters repositories by AI/ML related topics (AI, Machine Learning, etc.)
- Allows users to summarize project descriptions using LLM APIs
- Stores API keys securely in the browser's localStorage
- Uses a minimalist Apple-inspired design with vanilla CSS (no UI frameworks)

## 🏗️ Technology Architecture

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18 (Functional Components)
- **Backend**: Next.js API Routes (Serverless Functions)
- **Styling**: Vanilla CSS (CSS Modules) - No Tailwind, No Bootstrap
- **Storage**: LocalStorage (client-side only, for API keys)
- **Deployment**: Optimized for Vercel

## ✨ Features

### Stage A: Data Fetching
- **GitHub API** integration to fetch trending repositories
  - Filters repositories created/updated in the last 24 hours
  - Filters by AI/ML related topics (AI, Machine Learning, Deep Learning, LLM, NLP, etc.)
  - Sorts results by star count (most popular first)
  - Returns up to 50 top repositories
- **Hugging Face API** integration to fetch trending Spaces
  - Fetches trending AI/ML demos from Hugging Face Spaces
  - Filters by AI/ML related content
  - Sorts by likes (most popular first)
  - Returns up to 20 top spaces

### Stage B: User Interface
- Clean, Apple-inspired design
- Responsive grid layout for project cards
- Project cards display:
  - Repository name (clickable link to GitHub)
  - Original description
  - Star count
  - Programming language
  - Topics/tags
  - "Summarize" button

### Stage C: AI Summarization
- LLM integration for text summarization
- Supports multiple providers:
  - **OpenAI** (GPT-3.5-turbo)
  - **Anthropic** (Claude 3.5 Sonnet)
  - **Groq** (Llama 3.3 70B - Free tier available)
- In-memory caching (5 minutes) to avoid exceeding API rate limits
- API keys stored in browser localStorage (never sent to our servers)
- Settings modal to manage API keys

> 📖 **Need help setting up API keys?** See the [API Keys Guide](API_KEYS_GUIDE.md) for step-by-step instructions.

## 📸 Screenshots
<p align="center">
  <img src="https://github.com/user-attachments/assets/1e5ddd6d-3faf-4276-8da3-a557351d6110" width="400" />
  <img src="https://github.com/user-attachments/assets/ed13d882-7aa1-4202-996c-e847f825d3c3" width="400" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/e058ed26-aad0-447a-bbfc-fff2231c7bb5" width="400" />
  <img src="https://github.com/user-attachments/assets/c7de355d-e9a5-4a2e-b7e4-ec55014e2d1d" width="400" />
</p>


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) API key from one of the supported providers:
  - [Groq (Free)](https://console.groq.com/keys)
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Anthropic](https://console.anthropic.com/settings/keys)

> 📖 **Need help with API keys?** See the [API Keys Guide](API_KEYS_GUIDE.md) for detailed instructions on where and how to set them up.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Ex2
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. (Optional) Set up API keys for summarization feature:
   - See the [API Keys Guide](API_KEYS_GUIDE.md) for detailed instructions

### Production Build

```bash
npm run build
npm start
```

## 📡 API Details

### GET `/api/github`

Fetches trending GitHub repositories from the last 24 hours, filtered by AI/ML topics.

### GET `/api/huggingface`

Fetches trending Hugging Face Spaces, filtered by AI/ML related content.

**Response:**
```json
{
  "projects": [
    {
      "id": "123456789",
      "name": "owner/repo-name",
      "description": "Repository description",
      "url": "https://github.com/owner/repo-name",
      "stars": 1234,
      "language": "Python",
      "topics": ["ai", "machine-learning", "deep-learning"]
    }
  ],
  "count": 50
}
```

**Notes:**
- Uses GitHub's REST API (`/search/repositories`)
- Multiple queries executed to find repositories with AI/ML topics
- Results are deduplicated and sorted by star count
- Rate limit: 60 requests/hour (unauthenticated) or 5,000 requests/hour (with GitHub token)

**Hugging Face Response:**
```json
{
  "projects": [
    {
      "id": "hf_space_owner_space-name",
      "name": "owner/space-name",
      "description": "Interactive AI demo description",
      "url": "https://huggingface.co/spaces/owner/space-name",
      "stars": 1234,
      "language": "Gradio",
      "topics": ["space", "demo", "ai"],
      "source": "huggingface_spaces"
    }
  ],
  "count": 20
}
```

**Notes:**
- Uses Hugging Face Hub API (`/api/spaces`)
- Filters spaces by AI/ML keywords in description
- Sorted by likes (most popular first)
- No authentication required

### POST `/api/summarize`

Summarizes text using an LLM API.

**Request Body:**
```json
{
  "text": "Text to summarize...",
  "apiKey": "your-api-key-here",
  "provider": "openai" // or "anthropic" or "groq"
}
```

**Response:**
```json
{
  "summary": "Concise summary in up to 3 lines...",
  "cached": false
}
```

**Features:**
- In-memory cache with 5-minute TTL
- Supports OpenAI, Anthropic, and Groq
- Returns cached results when available
- Error handling for invalid API keys or API errors

## 🎨 Design Philosophy

The design follows Apple's minimalist aesthetic:

- **Typography**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- **Colors**: 
  - Background: #F5F5F7 (light gray) or #FFFFFF (white)
  - Text: #1D1D1F (dark gray/black)
  - Accent: #007AFF (Apple blue)
- **Effects**:
  - Rounded corners: 12px border-radius
  - Subtle shadows: box-shadow with low opacity
  - Smooth transitions: 0.2s-0.3s ease transitions
- **Layout**: Clean, spacious, with generous padding

## 🔒 Privacy & Security

- **API Keys**: Stored only in browser's localStorage (client-side only)
- **No Server Storage**: API keys are never stored on the server
- **Direct API Calls**: Summarization requests go directly to the LLM provider (with user's API key)
- **No Analytics**: No tracking or analytics implemented
- **Open Source**: Full source code available for inspection

## 📁 Project Structure

```
Ex2/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/
│   │   │   │   └── route.ts          # GitHub API route
│   │   │   └── summarize/
│   │   │       └── route.ts          # Summarization API route
│   │   ├── globals.css               # Global styles (Apple-inspired)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── page.module.css           # Home page styles
│   └── components/
│       ├── NewsCard.tsx              # Project card component
│       ├── NewsCard.module.css       # Card styles
│       ├── Settings.tsx              # Settings modal
│       └── Settings.module.css       # Settings styles
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🚢 Deployment to Vercel

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and configure the build
4. Deploy!

**Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

No environment variables needed for basic functionality (GitHub API works without authentication, though rate limits are lower).

## 📝 Notes

- This is an MVP version - focused on core functionality
- GitHub API has rate limits (60/hour unauthenticated, 5,000/hour with token)
- Summarization requires a valid API key from one of the supported providers
- Cache is in-memory (resets on server restart in production)
- For production use, consider implementing persistent caching (Redis, etc.)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👤 Author

Built as part of the Web Development Platforms course assignment.

---

**Website URL**: (Add your Vercel deployment URL here after deployment)
