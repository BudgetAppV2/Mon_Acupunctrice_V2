import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'

const metaUserToken = defineSecret('META_USER_TOKEN')
const metaIgAccountId = defineSecret('META_IG_ACCOUNT_ID')

const GRAPH_API = 'https://graph.instagram.com/v25.0'
const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 60_000

interface ContainerResponse {
  id: string
}

interface StatusResponse {
  status_code: 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
}

interface PublishResponse {
  id: string
}

async function createReelContainer(
  igAccountId: string,
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
    method: 'POST',
    body: params,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new HttpsError('internal', `Erreur création container: ${body}`)
  }

  const data = (await res.json()) as ContainerResponse
  return data.id
}

async function pollContainerStatus(
  containerId: string,
  accessToken: string
): Promise<void> {
  const start = Date.now()

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const data = (await res.json()) as StatusResponse

    if (data.status_code === 'FINISHED') return
    if (data.status_code === 'ERROR') {
      throw new HttpsError('internal', 'Erreur de traitement vidéo par Instagram')
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new HttpsError('deadline-exceeded', 'Timeout traitement Instagram')
}

async function publishContainer(
  igAccountId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API}/${igAccountId}/media_publish`, {
    method: 'POST',
    body: params,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new HttpsError('internal', `Erreur publication: ${body}`)
  }

  const data = (await res.json()) as PublishResponse
  return data.id
}

export const publishToInstagram = onCall(
  {
    secrets: [metaUserToken, metaIgAccountId],
    timeoutSeconds: 120,
    memory: '256MiB',
    cors: true,
  },
  async (request) => {
    const { itemId } = request.data as { itemId: string }

    if (!itemId) {
      throw new HttpsError('invalid-argument', 'itemId est requis')
    }

    // 1. Lire l'item de Firestore
    const doc = await admin.firestore().doc(`content_items/${itemId}`).get()
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Item introuvable')
    }

    const item = doc.data()!
    const videoUrl = item.videoUrl as string | undefined
    const caption = item.caption as string | undefined

    // 2. Valider les champs requis
    if (!videoUrl) {
      throw new HttpsError('failed-precondition', 'Vidéo requise')
    }
    if (!caption) {
      throw new HttpsError('failed-precondition', 'Caption requise')
    }

    const accessToken = metaUserToken.value()
    const igAccountId = metaIgAccountId.value()

    // 3. Créer container → poll → publish
    const containerId = await createReelContainer(igAccountId, accessToken, videoUrl, caption)
    await pollContainerStatus(containerId, accessToken)
    const mediaId = await publishContainer(igAccountId, accessToken, containerId)

    // 4. Mettre à jour Firestore
    await admin.firestore().doc(`content_items/${itemId}`).update({
      'publishedDates.instagram': admin.firestore.FieldValue.serverTimestamp(),
      instagramMediaId: mediaId,
      status: 'publié',
    })

    return { success: true, mediaId }
  }
)
