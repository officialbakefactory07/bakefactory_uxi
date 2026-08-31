import { NextRequest, NextResponse } from 'next/server';
import { extractMenuFromText, extractMenuFromImage } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, image } = body;

    if (!text && !image) {
      return NextResponse.json({ error: 'Please provide either menu text or a menu card image.' }, { status: 400 });
    }

    let items: any[] = [];

    if (image) {
      items = await extractMenuFromImage(image);
    } else if (text) {
      items = await extractMenuFromText(text);
    }

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error: any) {
    console.error('API ai-menu-extract error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract menu using AI' },
      { status: 500 }
    );
  }
}
