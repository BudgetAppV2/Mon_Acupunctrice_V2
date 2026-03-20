import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'

const metaUserToken = defineSecret('META_USER_TOKEN')
const metaIgAccountId = defineSecret('META_IG_ACCOUNT_ID')

const GRAPH_API = 'https://graph.instagram.com/v25.0'
const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 60_000

/**
 * schedulePublisher — runs every 15 minutes via Cloud Scheduler
 * Queries Firestore for items whose scheduledDate has passed and status is 'schedulé'.
 * For each, publishes to Instagram and updates Firestore.
 */
export const schedulePublisher = onSchedule(
  {
    schedule: 'every 15 minutes',
    secrets: [metaUserToken, metaIgAccountId],
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async () => {
    const db = admin.firestore()
    const now = new Date()

    // Query items ready for publication
    const snapshot = await db
      .collection('content_items')
      .where('status', '==', 'schedulé')
      .where('scheduledDate', '<=', now)
      .get()

    if (snapshot.empty) {
      console.log('schedulePublisher: no items to publish')
      return
    }

    console.log(`schedulePublisher: ${snapshot.size} item(s) to publish`)

    const accessToken = metaUserToken.value()
    const igAccountId = metaIgAccountId.value()

    for (const doc of snapshot.docs) {
      const item = doc.data()
      const itemId = doc.id

      try {
        // Validate required fields
        const videoUrl = item.videoUrl as string | undefined
        if (!videoUrl) {
          console.warn(`schedulePublisher: ${itemId} has no videoUrl, skipping`)
          continue
        }

        // Use existing caption or generate a default one
        const caption = (item.caption as string) || item.title || ''

        // 1. Create Reel container
        const containerParams = new URLSearchParams({
          media_type: 'REELS',
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        })

        const containerRes = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
          method: 'POST',
          body: containerParams,
        })

        if (!containerRes.ok) {
          const body = await containerRes.text()
          throw new Error(`Container creation failed: ${body}`)
        }

        const containerId = ((await containerRes.json()) as { id: string }).id

        // 2. Poll container status
        const pollStart = Date.now()
        let ready = false

        while (Date.now() - pollStart < POLL_TIMEOUT_MS) {
          const statusRes = await fetch(
            `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`
          )
          const statusData = (await statusRes.json()) as { status_code: string }

          if (statusData.status_code === 'FINISHED') {
            ready = true
            break
          }
          if (statusData.status_code === 'ERROR') {
            throw new Error('Instagram video processing error')
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
        }

        if (!ready) {
          throw new Error('Instagram processing timeout')
        }

        // 3. Publish container
        const publishParams = new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        })

        const publishRes = await fetch(`${GRAPH_API}/${igAccountId}/media_publish`, {
          method: 'POST',
          body: publishParams,
        })

        if (!publishRes.ok) {
          const body = await publishRes.text()
          throw new Error(`Publication failed: ${body}`)
        }

        const mediaId = ((await publishRes.json()) as { id: string }).id

        // 4. Update Firestore — mark as published
        await db.doc(`content_items/${itemId}`).update({
          'publishedDates.instagram': admin.firestore.FieldValue.serverTimestamp(),
          instagramMediaId: mediaId,
          status: 'publié',
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        console.log(`schedulePublisher: published ${itemId} → mediaId ${mediaId}`)
      } catch (err: any) {
        console.error(`schedulePublisher: failed to publish ${itemId}:`, err.message)

        // Mark as error so Judith can retry manually
        await db.doc(`content_items/${itemId}`).update({
          status: 'erreur_publication',
          lastPublishError: err.message,
          lastPublishAttempt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    }
  }
)
