import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'

admin.initializeApp()

const anthropicKey = defineSecret('ANTHROPIC_API_KEY')

interface CaptionRequest {
  title: string
  category: string
  platforms: string[]
  notes?: string
}

export const generateCaption = onCall(
  {
    secrets: [anthropicKey],
    timeoutSeconds: 60,
    memory: '256MiB',
    cors: true,
  },
  async (request) => {
    const data = request.data as CaptionRequest

    if (!data.title || !data.category) {
      throw new HttpsError('invalid-argument', 'title et category sont requis')
    }

    const apiKey = anthropicKey.value()
    if (!apiKey) throw new HttpsError('internal', 'ANTHROPIC_API_KEY non configurée')

    const client = new Anthropic({ apiKey })
    const platformList = (data.platforms || ['instagram']).join(', ')

    const prompt = `Tu es un assistant spécialisé en contenu pour les réseaux sociaux pour une acupunctrice québécoise nommée Judith Dufour-Savard, pratiquant à Rosemont, Montréal.

Génère 2 options de caption pour le sujet suivant :

Sujet : ${data.title}
Catégorie : ${data.category}
Plateformes cibles : ${platformList}
Notes additionnelles : ${data.notes || 'aucune'}

CONTRAINTES DÉONTOLOGIQUES (Ordre des Acupuncteurs du Québec) :
- Ton éducatif et informatif, jamais commercial
- Information factuelle, exacte et vérifiable
- Aucun témoignage de patient
- Aucune garantie de résultats
- Mentionner "acupunctrice" ou "Judith, acupunctrice"
- Langue : français québécois naturel et accessible

FORMAT pour chaque option :
Ligne 1-2 : Accroche forte
Ligne 3-6 : Corps éducatif (2-4 points max)
Ligne 7 : CTA vers le lien en bio
Ligne 8 : 5-8 hashtags québécois pertinents

Sépare les 2 options par exactement "---"`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const options = text.split('---').map((s: string) => s.trim()).filter(Boolean)

    return { success: true, options, raw: text }
  }
)

export { publishToInstagram } from './instagram'
export { transcribeAudio } from './transcribe'
export { schedulePublisher } from './scheduler'
export { searchJamendo } from './jamendo'
