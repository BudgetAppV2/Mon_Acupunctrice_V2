export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE = 'https://api.assemblyai.com/v2';

export async function POST(request: NextRequest) {
  if (!ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: 'ASSEMBLYAI_API_KEY non configuree' }, { status: 500 });
  }

  const formData = await request.formData();
  const audio = formData.get('audio') as Blob | null;

  if (!audio) {
    return NextResponse.json({ error: 'Champ audio requis' }, { status: 400 });
  }

  try {
    // Step 1: Upload binary to AssemblyAI
    const uploadRes = await fetch(`${ASSEMBLYAI_BASE}/upload`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/octet-stream',
      },
      body: audio,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Upload AssemblyAI echoue' }, { status: 500 });
    }

    const { upload_url } = await uploadRes.json() as { upload_url: string };

    // Step 2: Start transcription
    const transcriptRes = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: 'fr',
        word_boost: ['acupuncture', 'meridien', 'qi', 'yin', 'yang', 'aiguille'],
        punctuate: true,
      }),
    });

    if (!transcriptRes.ok) {
      return NextResponse.json({ error: 'Lancement transcription echoue' }, { status: 500 });
    }

    const { id } = await transcriptRes.json() as { id: string };

    // Step 3: Poll until completion (max 120s, poll every 2s)
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
          { error: result.error || 'Transcription echouee' },
          { status: 500 }
        );
      }

      if (result.status === 'completed') {
        // Normalize word timestamps: AssemblyAI returns ms -> convert to seconds
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
