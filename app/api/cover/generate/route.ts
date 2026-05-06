import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCovers } from '@/lib/cover-generator/compose';

export const runtime = 'nodejs'; // Sharp incompatible Edge

const InputSchema = z.object({
  contentId: z.string().min(1),
  type: z.enum(['ressource', 'faq', 'blog']),
  titre: z.string().min(1).max(200),
  pilier: z.enum([
    'grossesse',
    'pediatrie',
    'fertilite',
    'anxiete-sommeil',
    'menopause',
    'acupuncture-sociale',
    'transversal',
  ]),
  ctaMode: z.enum(['ressource', 'reservation']).optional(),
  excludeAssets: z
    .object({
      backgrounds: z.array(z.string()).optional(),
      lineart: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    const result = await generateCovers(input);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[cover/generate] Error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Cover generation failed' }, { status: 500 });
  }
}
