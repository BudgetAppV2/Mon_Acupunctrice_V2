import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const jamendoClientId = defineSecret('JAMENDO_CLIENT_ID')

interface JamendoSearchRequest {
  query?: string
  tags?: string
  limit?: number
}

interface JamendoTrack {
  id: string
  name: string
  artist_name: string
  duration: number
  audio: string
  image: string
}

export const searchJamendo = onCall(
  {
    secrets: [jamendoClientId],
    timeoutSeconds: 30,
    memory: '256MiB',
    cors: true,
  },
  async (request) => {
    const data = request.data as JamendoSearchRequest
    const clientId = jamendoClientId.value()
    if (!clientId) throw new HttpsError('internal', 'JAMENDO_CLIENT_ID non configurée')

    const params = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(data.limit || 20),
      include: 'musicinfo',
      audiodlformat: 'mp32',
    })

    if (data.query) params.set('search', data.query)
    if (data.tags) params.set('tags', data.tags)

    // Default to relaxing/acoustic music suitable for wellness content
    if (!data.query && !data.tags) {
      params.set('tags', 'relaxing')
    }

    const url = `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Jamendo API error: ${response.status}`)
      }

      const json = await response.json()
      const tracks: JamendoTrack[] = (json.results || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        artist_name: t.artist_name,
        duration: t.duration,
        audio: t.audio,        // stream URL
        image: t.image,        // album art
      }))

      return { success: true, tracks }
    } catch (err: any) {
      console.error('Jamendo search error:', err)
      throw new HttpsError('internal', `Erreur recherche Jamendo: ${err.message}`)
    }
  }
)
