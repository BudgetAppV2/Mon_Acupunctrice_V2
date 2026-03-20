import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const openaiKey = defineSecret('OPENAI_API_KEY')
const anthropicKey = defineSecret('ANTHROPIC_API_KEY')

interface TranscribeRequest {
  audioUrl?: string
  storagePath: string
  cleanup?: boolean
}

export const transcribeAudio = onCall(
  {
    secrets: [openaiKey, anthropicKey],
    timeoutSeconds: 120,
    memory: '512MiB',
    cors: true,
  },
  async (request) => {
    const data = request.data as TranscribeRequest

    if (!data.storagePath) {
      throw new HttpsError('invalid-argument', 'storagePath est requis')
    }

    const apiKey = openaiKey.value()
    if (!apiKey) throw new HttpsError('internal', 'OPENAI_API_KEY non configurée')

    try {
      // Download the audio/video file from Firebase Storage
      const bucket = admin.storage().bucket()
      const file = bucket.file(data.storagePath)
      const [fileBuffer] = await file.download()

      // Create a File-like object for OpenAI
      const openai = new OpenAI({ apiKey })

      // Detect MIME type from file extension (Whisper supports mp4, webm, mp3, wav, etc.)
      const ext = data.storagePath.split('.').pop()?.toLowerCase() || 'webm'
      const mimeMap: Record<string, string> = {
        mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg',
        wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg',
      }
      const mimeType = mimeMap[ext] || 'video/webm'
      const fileName = `audio.${ext}`

      // Convert buffer to a File object for the API
      const audioFile = new File([new Uint8Array(fileBuffer)], fileName, { type: mimeType })

      // Transcribe with Whisper (verbose_json for word-level timestamps)
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'fr',
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
      })

      // Return individual word-level subtitles — client groups them dynamically
      const words = (transcription as any).words || []
      let subtitles: any[]

      if (words.length > 0) {
        subtitles = words.map((w: any, i: number) => ({
          id: `sub_${i}`,
          text: w.word.trim(),
          startTime: w.start,
          endTime: w.end,
        }))
      } else {
        // Fallback to segment-level if words not available
        const rawSegments = (transcription as any).segments || []
        subtitles = rawSegments.map((seg: any, i: number) => ({
          id: `sub_${i}`,
          text: seg.text.trim(),
          startTime: seg.start,
          endTime: seg.end,
        }))
      }

      // Use Claude to clean up Quebec French on the full transcript
      if (subtitles.length > 0) {
        try {
          const anthKey = anthropicKey.value()
          if (anthKey) {
            const claude = new Anthropic({ apiKey: anthKey })
            // Join all words into one sentence for better correction context
            const fullText = subtitles.map((s: any) => s.text).join(' ')

            const correction = await claude.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 2048,
              messages: [{
                role: 'user',
                content: `Corrige le texte suivant en français québécois naturel.
Retourne exactement le même nombre de mots, séparés par des espaces.
Corrige seulement l'orthographe, ne change pas le sens et ne fusionne/sépare pas de mots.
Si un mot est déjà correct, retourne-le tel quel.

${fullText}`
              }],
            })

            const correctedText = correction.content[0].type === 'text'
              ? correction.content[0].text.trim()
              : ''
            const correctedWords = correctedText.split(/\s+/)

            // Apply corrections only if word count matches
            if (correctedWords.length === subtitles.length) {
              subtitles = subtitles.map((sub: any, i: number) => ({
                ...sub,
                text: correctedWords[i],
              }))
            }
          }
        } catch (err) {
          // If Claude correction fails, keep original Whisper output
          console.warn('Claude correction failed, using raw Whisper output:', err)
        }
      }

      // Cleanup temp file from Storage (only if caller requested it)
      if (data.cleanup !== false) {
        try {
          await file.delete()
        } catch (err) {
          console.warn('Failed to delete temp audio file:', err)
        }
      }

      return { success: true, subtitles }
    } catch (err: any) {
      console.error('Transcription error:', err)
      throw new HttpsError('internal', `Erreur de transcription: ${err.message}`)
    }
  }
)
