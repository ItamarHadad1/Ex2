import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI News Aggregator',
  description: 'Weekly AI/ML trends from GitHub and Hugging Face',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}