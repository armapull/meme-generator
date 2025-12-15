export interface ModerationResult {
  safe: boolean;
  scores?: {
    nudity?: number;
    violence?: number;
    offensive?: number;
  };
  reason?: string;
}

export async function moderateImage(imageBase64: string): Promise<ModerationResult> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  const apiKey = process.env.MODERATION_API_KEY;
  const apiSecret = process.env.MODERATION_API_SECRET;

  // If no API keys are configured, allow all content (for development)
  // In production, you should always have moderation enabled
  if (!apiKey || !apiSecret || apiKey === 'your_api_key_here') {
    console.warn('Moderation API not configured. Allowing content (development mode).');
    return { safe: true };
  }

  try {
    // Using Sightengine API for moderation
    // Convert base64 to Buffer for Node.js compatibility (API routes run server-side)
    // Note: fetch() with data: URLs doesn't work in Node.js, so we use Buffer instead
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    // Create a Blob from Buffer (Blob is available globally in Node.js 18+)
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('media', blob, 'image.png');
    formData.append('api_user', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('models', 'nudity-2.0,wad,offensive');

    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Moderation API error:', data);
      // Fail open for API errors (you may want to fail closed in production)
      return { safe: true, reason: 'API error' };
    }

    const scores = {
      nudity: data.nudity?.sexual_activity || data.nudity?.sexual_display || data.nudity?.erotica || 0,
      violence: data.weapon || data.alcohol || data.drugs || 0,
      offensive: data.offensive?.prob || 0,
    };

    // Threshold: block if any score exceeds 0.5 (50%)
    const threshold = 0.5;
    const isSafe = 
      scores.nudity < threshold &&
      scores.violence < threshold &&
      scores.offensive < threshold;

    return {
      safe: isSafe,
      scores,
      reason: !isSafe ? 'Content exceeds safety thresholds' : undefined,
    };
  } catch (error) {
    console.error('Moderation error:', error);
    // Fail open for errors (you may want to fail closed in production)
    return { safe: true, reason: 'Moderation check failed' };
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const apiKey = process.env.MODERATION_API_KEY;
  const apiSecret = process.env.MODERATION_API_SECRET;

  if (!apiKey || !apiSecret || apiKey === 'your_api_key_here') {
    return { safe: true };
  }

  try {
    const response = await fetch('https://api.sightengine.com/1.0/text/check.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        lang: 'en',
        mode: 'standard',
        api_user: apiKey,
        api_secret: apiSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { safe: true, reason: 'API error' };
    }

    const isSafe = !data.profanity?.matches?.length && !data.personal?.matches?.length;

    return {
      safe: isSafe,
      reason: !isSafe ? 'Text contains inappropriate content' : undefined,
    };
  } catch (error) {
    console.error('Text moderation error:', error);
    return { safe: true, reason: 'Moderation check failed' };
  }
}
