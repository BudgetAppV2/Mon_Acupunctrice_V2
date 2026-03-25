// Helpers de publication extraits du cron pour garder le cron lisible

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;
const GRAPH_FB = 'https://graph.facebook.com/v25.0';
const GRAPH_IG = 'https://graph.instagram.com/v25.0';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const WIX_URL = process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca';

export async function publishInstagram(item: Record<string, unknown>): Promise<string | null> {
  if (!FUNCTIONS_URL) throw new Error('FIREBASE_FUNCTIONS_URL missing');
  const res = await fetch(`${FUNCTIONS_URL}/publishToInstagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        videoUrl: item.videoUrl, caption: item.caption || '',
        itemId: item._id, coverOption: item.coverOption,
        thumbOffset: item.thumbOffset, coverUrl: item.coverImageUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(`instagram_failed: ${res.status}`);
  const data = await res.json();
  return (data.result?.mediaId || data.mediaId) ?? null;
}

export async function publishFacebook(
  item: Record<string, unknown>, pageId: string, pageToken: string,
): Promise<string | null> {
  const initRes = await fetch(`${GRAPH_FB}/${pageId}/video_reels`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'start', access_token: pageToken }),
  });
  const initData = await initRes.json();
  if (!initData.video_id) throw new Error('fb_init_failed');

  const uploadRes = await fetch(initData.upload_url, {
    method: 'POST', headers: { Authorization: `OAuth ${pageToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url: item.videoUrl }),
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) throw new Error('fb_upload_failed');

  const pubRes = await fetch(`${GRAPH_FB}/${pageId}/video_reels`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'finish', video_id: initData.video_id, description: item.caption || '', access_token: pageToken }),
  });
  const pubData = await pubRes.json();
  if (!pubData.success) throw new Error('fb_publish_failed');
  return pubData.post_id || initData.video_id;
}

export async function publishYouTube(
  item: Record<string, unknown>, refreshToken: string,
): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('google_creds_missing');
  // Refresh token
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token' }),
  });
  const tokData = await tokRes.json();
  if (!tokData.access_token) throw new Error('yt_refresh_failed');

  // Download video
  const vidRes = await fetch(item.videoUrl as string);
  if (!vidRes.ok) throw new Error('yt_video_download_failed');
  const vidBuf = await vidRes.arrayBuffer();

  const caption = (item.caption || item.title || '') as string;
  const desc = `${caption}\n\n#Shorts #Acupuncture #SanteNaturelle\n\nPrendre rendez-vous : ${WIX_URL}`;

  // Init resumable upload
  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokData.access_token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(vidBuf.byteLength) },
    body: JSON.stringify({ snippet: { title: (item.title || 'Short') as string, description: desc, tags: ['Shorts', 'Acupuncture'], categoryId: '26' }, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } }),
  });
  if (initRes.status === 403) throw new Error('yt_quota_exceeded');
  if (!initRes.ok) throw new Error(`yt_init_failed: ${initRes.status}`);
  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) throw new Error('yt_no_upload_url');

  const upRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(vidBuf.byteLength) }, body: vidBuf });
  if (!upRes.ok) throw new Error(`yt_upload_failed: ${upRes.status}`);
  const upData = await upRes.json();
  return upData.id ?? null;
}

export async function publishInstagramStory(
  item: Record<string, unknown>, igUserId: string, accessToken: string,
): Promise<string | null> {
  const mediaPayload = item.videoUrl
    ? { video_url: item.videoUrl as string }
    : { image_url: (item.coverImageUrl || item.storyImageUrl) as string };

  const createRes = await fetch(`${GRAPH_IG}/${igUserId}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'STORIES', ...mediaPayload, access_token: accessToken }),
  });
  const createData = await createRes.json();
  if (!createData.id) throw new Error(`story_create_failed: ${JSON.stringify(createData)}`);

  const publishRes = await fetch(`${GRAPH_IG}/${igUserId}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: createData.id, access_token: accessToken }),
  });
  const publishData = await publishRes.json();
  if (!publishData.id) throw new Error(`story_publish_failed: ${JSON.stringify(publishData)}`);
  return publishData.id;
}
