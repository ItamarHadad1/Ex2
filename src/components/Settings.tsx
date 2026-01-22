'use client'

import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

interface SettingsProps {
  onClose: () => void
}

export default function Settings({ onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('openai')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('apiKey')
    const savedProvider = localStorage.getItem('apiProvider') || 'openai'
    if (savedKey) {
      setApiKey(savedKey)
    }
    setProvider(savedProvider)
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('apiKey', apiKey.trim())
      localStorage.setItem('apiProvider', provider)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1000)
    } else {
      // Clear if empty
      localStorage.removeItem('apiKey')
      localStorage.removeItem('apiProvider')
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1000)
    }
  }

  const handleClear = () => {
    setApiKey('')
    localStorage.removeItem('apiKey')
    localStorage.removeItem('apiProvider')
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
    }, 1000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>AI Provider</label>
            <select
              className={styles.select}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="groq">Groq (Free tier available)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>API Key</label>
            <input
              type="password"
              className={styles.input}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key (stored locally)"
            />
            <p className={styles.hint}>
              Your API key is stored in your browser&apos;s localStorage and never sent to our servers.
              Get free API keys from:
              <br />
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                Groq (Free)
              </a>
              {' | '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                OpenAI
              </a>
              {' | '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">
                Anthropic
              </a>
            </p>
          </div>

          {saved && <div className={styles.success}>Settings saved!</div>}

          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={handleClear}>
              Clear
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}