import { NextResponse } from 'next/server'

interface HuggingFaceSpace {
  id: string
  name?: string
  description?: string
  likes: number
  sdk?: string
}

interface Project {
  id: string
  name: string
  description: string
  url: string
  stars: number
  language: string
  topics: string[]
  source: string
}

/**
 * Fetch trending content from Hugging Face
 * - Spaces using Hugging Face Hub API (sorted by likes)
 * 
 * Note: Papers are not included as they require web scraping,
 * which is less reliable in serverless functions. For MVP, we focus on Spaces.
 */
export async function GET() {
  try {
    const allProjects: Project[] = []

    // Fetch Hugging Face Spaces using Hub API
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const spacesResponse = await fetch(
        'https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=30',
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      )
      
      clearTimeout(timeoutId)

      if (spacesResponse.ok) {
        const spaces: any[] = await spacesResponse.json()
        
        console.log(`[HF API] Fetched ${spaces.length} spaces from Hugging Face`)
        
        // For MVP: Include all spaces (most on HF are AI/ML related anyway)
        // Only filter out if it's clearly not AI/ML related
        spaces.forEach((space) => {
          try {
            // Get description from various possible fields
            const description = space.description || 
                               space.card?.short_description || 
                               space.card?.description ||
                               space.title ||
                               space.id || 
                               ''
            const descriptionLower = description.toLowerCase()
            const spaceId = space.id || space.name || ''
            
            // Get likes from various possible fields
            const likes = space.likes || space.likeCount || space.like_count || 0
            
            // For MVP: Include all spaces with likes > 0 (most are AI/ML related)
            // This ensures we get results
            if (likes > 0 && spaceId) {
              allProjects.push({
                id: `hf_space_${spaceId.replace(/\//g, '_')}`,
                name: spaceId,
                description: description || `Interactive AI demo by ${spaceId.split('/')[0] || 'Hugging Face'}`,
                url: `https://huggingface.co/spaces/${spaceId}`,
                stars: likes,
                language: space.sdk || space.card?.sdk || 'Gradio',
                topics: ['space', 'demo', 'ai'],
                source: 'huggingface_spaces',
              })
            }
          } catch (err) {
            console.error(`[HF API] Error processing space:`, err)
          }
        })
        
        console.log(`[HF API] Added ${allProjects.length} Hugging Face spaces to results`)
      } else {
        const errorText = await spacesResponse.text().catch(() => 'Unknown error')
        console.error(`[HF API] Error: ${spacesResponse.status} ${spacesResponse.statusText}`, errorText)
      }
    } catch (error) {
      console.error('[HF API] Error fetching Hugging Face spaces:', error)
      // Don't throw - return empty array so GitHub projects still show
    }

    // Sort by stars/likes (descending)
    allProjects.sort((a, b) => b.stars - a.stars)

    console.log(`[HF API] Returning ${allProjects.length} projects`)

    return NextResponse.json({
      projects: allProjects,
      count: allProjects.length,
    })
  } catch (error) {
    console.error('[HF API] Error in Hugging Face API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Hugging Face content', projects: [] },
      { status: 500 }
    )
  }
}
