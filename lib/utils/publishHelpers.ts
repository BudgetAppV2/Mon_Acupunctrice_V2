const GRAPH = 'https://graph.facebook.com/v25.0';

/**
 * Publie une Story Instagram via l'API Graph.
 * Utilise video_url si disponible, sinon image_url (coverImageUrl).
 * Réutilisable par le cron et la route /api/publish-story.
 */
export async function publishInstagramStory(
  item: Record<string, unknown>,
  igUserId: string,
  accessToken: string,
): Promise<string | null> {
  // Vidéo prioritaire sur image de couverture
  const mediaPayload = item.videoUrl
    ? { video_url: item.videoUrl as string }
    : { image_url: item.coverImageUrl as string };

  // Étape 1 : Créer le container media
  const createRes = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'STORIES', ...mediaPayload, access_token: accessToken }),
  });
  const createData = await createRes.json();
  if (!createData.id) throw new Error(`story_create_failed: ${JSON.stringify(createData)}`);

  // Étape 2 : Publier le container
  const publishRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: createData.id, access_token: accessToken }),
  });
  const publishData = await publishRes.json();
  if (!publishData.id) throw new Error(`story_publish_failed: ${JSON.stringify(publishData)}`);

  return publishData.id;
}
