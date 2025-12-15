import { NextRequest, NextResponse } from 'next/server';
import { moderateImage, moderateText } from '@/lib/moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, text } = body;

    if (!image && !text) {
      return NextResponse.json(
        { error: 'Either image or text must be provided' },
        { status: 400 }
      );
    }

    const results: { image?: any; text?: any } = {};

    if (image) {
      results.image = await moderateImage(image);
    }

    if (text) {
      results.text = await moderateText(text);
    }

    const isSafe = 
      (!image || results.image?.safe) &&
      (!text || results.text?.safe);

    return NextResponse.json({
      safe: isSafe,
      ...results,
    });
  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
