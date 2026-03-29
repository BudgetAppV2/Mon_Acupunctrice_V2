export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE = 'https://api.assemblyai.com/v2';

export async function POST(request: NextRequest) {
  if (!ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: 'ASSEMBLYAI_API_KEY non configurée' }, { status: 500 });
  }

  const formData = await request.formData();
  const audio = formData.get('audio') as Blob | null;

  if (!audio) {
    return NextResponse.json({ error: 'Champ audio requis' }, { status: 400 });
  }

  try {
    // Étape 1 : Upload binaire vers AssemblyAI
    console.log('[transcribe] step1: uploading', audio.size, 'bytes');
    const uploadRes = await fetch(`${ASSEMBLYAI_BASE}/upload`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/octet-stream',
      },
      body: audio,
    });

    console.log('[transcribe] step1 status:', uploadRes.status);
    if (!uploadRes.ok) {
      const body = await uploadRes.text();
      console.error('[transcribe] upload error:', body);
      return NextResponse.json({ error: 'Upload AssemblyAI échoué', detail: body }, { status: 500 });
    }

    const { upload_url } = await uploadRes.json() as { upload_url: string };

    // Étape 2 : Lancer la transcription
    console.log('[transcribe] step2: starting transcript');
    const transcriptRes = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speech_model: 'universal-2',
        language_code: 'fr',
        punctuate: true,
      }),
    });

    console.log('[transcribe] step2 status:', transcriptRes.status);
    if (!transcriptRes.ok) {
      const body = await transcriptRes.text();
      console.error('[transcribe] transcript error:', body);
      return NextResponse.json({ error: 'Lancement transcription échoué', detail: body }, { status: 500 });
    }

    const { id } = await transcriptRes.json() as { id: string };

    // Étape 3 : Polling jusqu'à completion (max 120s, poll toutes les 2s)
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 2000));

      const pollRes = await fetch(`${ASSEMBLYAI_BASE}/transcript/${id}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      });

      if (!pollRes.ok) continue;

      const result = await pollRes.json() as {
        status: string;
        error?: string;
        words?: { text: string; start: number; end: number }[];
      };

      if (result.status === 'error') {
        return NextResponse.json(
          { error: result.error || 'Transcription échouée' },
          { status: 500 }
        );
      }

      if (result.status === 'completed') {
        // Normaliser les word timestamps : AssemblyAI retourne ms → convertir en secondes
        const subtitles = (result.words ?? []).map(w => ({
          text: w.text,
          startTime: w.start / 1000,
          endTime: w.end / 1000,
        }));

        return NextResponse.json({ subtitles });
      }
    }

    return NextResponse.json({ error: 'Timeout transcription' }, { status: 504 });
  } catch {
    return NextResponse.json({ error: 'Erreur transcription' }, { status: 500 });
  }
}
