import { NextResponse } from 'next/server'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
  created_at: string
  pushed_at: string
}

interface Project {
  id: string
  name: string
  description: string
  url: string
  stars: number
  language: string
  topics: string[]
  source?: string
}

/**
 * Fetch trending GitHub repositories from the last 24 hours
 * Filter by "AI" or "Machine Learning" topics
 * 
 * This API route uses GitHub's REST API to search for repositories
 * created or updated in the last 24 hours with AI/ML related topics.
 */
export async function GET() {
  try {
    // Calculate date 24 hours ago
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    // Search for repositories with AI/ML topics updated in last 24 hours
    // GitHub Search API syntax: pushed:>DATE with topic filters
    // Using "pushed:" instead of "created:" to get recently active repos
    const queries = [
      `topic:AI pushed:>${dateStr} stars:>10`,  // AI topic, updated in last 24h, at least 10 stars
      `topic:machine-learning pushed:>${dateStr} stars:>10`,
      `topic:artificial-intelligence pushed:>${dateStr} stars:>10`,
      `topic:deep-learning pushed:>${dateStr} stars:>10`,
      `topic:llm pushed:>${dateStr} stars:>10`,
      `topic:nlp pushed:>${dateStr} stars:>10`,
    ]

    const allRepos = new Map<string, GitHubRepo>()

    // Fetch from each query and merge results
    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              // Note: For higher rate limits, you can add: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
            },
          }
        )

        if (!response.ok) {
          console.error(`GitHub API error: ${response.status}`)
          continue
        }

        const data = await response.json()
        const repos: GitHubRepo[] = data.items || []

        // Add to map (deduplicate by full_name)
        repos.forEach((repo) => {
          if (!allRepos.has(repo.full_name)) {
            allRepos.set(repo.full_name, repo)
          }
        })
      } catch (error) {
        console.error(`Error fetching query "${query}":`, error)
        continue
      }
    }

    // Convert to our Project format and filter by AI/ML topics
    const projects: Project[] = Array.from(allRepos.values())
      .filter((repo) => {
        // Ensure it has AI/ML related topics
        const topics = repo.topics || []
        const topicLower = topics.map((t) => t.toLowerCase()).join(' ')
        return (
          topicLower.includes('ai') ||
          topicLower.includes('machine-learning') ||
          topicLower.includes('artificial-intelligence') ||
          topicLower.includes('ml') ||
          topicLower.includes('deep-learning') ||
          topicLower.includes('neural-network') ||
          topicLower.includes('llm') ||
          topicLower.includes('nlp')
        )
      })
      .map((repo) => ({
        id: repo.id.toString(),
        name: repo.full_name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language || 'Unknown',
        topics: repo.topics || [],
        source: 'github',
      }))
      .sort((a, b) => b.stars - a.stars) // Sort by stars descending
      .slice(0, 50) // Limit to top 50

    return NextResponse.json({
      projects,
      count: projects.length,
    })
  } catch (error) {
    console.error('Error in GitHub API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub projects', projects: [] },
      { status: 500 }
    )
  }
}