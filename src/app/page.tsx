'use client'

import { useState } from 'react'
import NewsCard from '@/components/NewsCard'
import Settings from '@/components/Settings'
import styles from './page.module.css'

interface Project {
  id: string
  name: string
  description: string
  url: string
  stars: number
  language: string
  topics: string[]
  summary?: string
  source?: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch from both GitHub and Hugging Face
      const [githubResponse, huggingfaceResponse] = await Promise.all([
        fetch('/api/github'),
        fetch('/api/huggingface'),
      ])

      if (!githubResponse.ok && !huggingfaceResponse.ok) {
        throw new Error('Failed to fetch projects')
      }

      const githubData = githubResponse.ok ? await githubResponse.json() : { projects: [] }
      const huggingfaceData = huggingfaceResponse.ok ? await huggingfaceResponse.json() : { projects: [] }

      console.log('GitHub projects:', githubData.projects?.length || 0)
      console.log('Hugging Face projects:', huggingfaceData.projects?.length || 0)

      // Combine and sort by stars/likes
      const allProjects = [
        ...(githubData.projects || []),
        ...(huggingfaceData.projects || []),
      ].sort((a, b) => b.stars - a.stars)

      console.log('Total projects:', allProjects.length)
      setProjects(allProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>AI News Aggregator</h1>
          <p className={styles.subtitle}>Weekly AI/ML trends from GitHub and Hugging Face</p>
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={fetchProjects} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Projects'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
              Settings
            </button>
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">Loading projects...</div>}

        {!loading && projects.length > 0 && (
          <div className={styles.grid}>
            {projects.map((project) => (
              <NewsCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && !error && (
          <div className={styles.empty}>
            <p>Click "Fetch Projects" to load AI/ML trends from GitHub and Hugging Face</p>
          </div>
        )}
      </div>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  )
}