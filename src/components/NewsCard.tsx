'use client'

import { useState } from 'react'
import styles from './NewsCard.module.css'

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

interface NewsCardProps {
  project: Project
}

export default function NewsCard({ project }: NewsCardProps) {
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(project.summary || null)

  const handleSummarize = async () => {
    setIsSummarizing(true)
    try {
      const apiKey = localStorage.getItem('apiKey')
      const provider = localStorage.getItem('apiProvider') || 'openai'
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: project.description,
          apiKey: apiKey || undefined,
          provider: provider,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to summarize')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error('Error summarizing:', error)
      alert('Failed to summarize. Please check your API key in Settings.')
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            {project.name}
          </a>
        </h3>
        <div className={styles.stars}>
          {project.source === 'huggingface_papers' || project.source === 'huggingface_spaces' 
            ? '👍' 
            : '⭐'} {project.stars.toLocaleString()}
        </div>
      </div>

      <p className={styles.description}>{project.description}</p>

      {summary && (
        <div className={styles.summary}>
          <strong>Summary:</strong> {summary}
        </div>
      )}

      <div className={styles.footer}>
        {project.source && (
          <span className={styles.tag}>
            {project.source === 'github' ? 'GitHub' : 
             project.source === 'huggingface_papers' ? 'Hugging Face' :
             project.source === 'huggingface_spaces' ? 'Hugging Face' : 
             project.source}
          </span>
        )}
        {project.language && (
          <span className={styles.tag}>{project.language}</span>
        )}
        {project.topics.slice(0, 3).map((topic) => (
          <span key={topic} className={styles.tag}>
            {topic}
          </span>
        ))}
      </div>

      {!summary && (
        <button
          className={styles.summarizeBtn}
          onClick={handleSummarize}
          disabled={isSummarizing}
        >
          {isSummarizing ? 'Summarizing...' : 'Summarize'}
        </button>
      )}
    </div>
  )
}