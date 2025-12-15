# Meme App

A full-stack meme sharing application built with Next.js and InstantDB. Users can create memes using the generator or upload images, post them to a shared feed, and upvote memes. Content moderation filters inappropriate content automatically.

## Features

- **Meme Generator**: Create memes by uploading images and adding text overlays
- **Image Upload**: Direct image upload option
- **Real-time Feed**: View all memes in a real-time feed
- **Upvoting**: Upvote your favorite memes
- **Content Moderation**: Automatic filtering of inappropriate content
- **Anonymous Posting**: No authentication required

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Database**: InstantDB
- **Content Moderation**: Sightengine API
- **Styling**: Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10
MODERATION_API_KEY=your_sightengine_api_key
MODERATION_API_SECRET=your_sightengine_api_secret
```

3. Initialize InstantDB schema:
```bash
npx instant-cli@latest init
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Content Moderation

The app uses Sightengine API for content moderation. If API keys are not configured, the app will run in development mode (allowing all content). In production, always configure moderation API keys.

## Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout with InstantProvider
│   ├── page.tsx            # Home page (meme feed)
│   ├── create/
│   │   └── page.tsx        # Meme creation page
│   └── api/
│       └── moderate/
│           └── route.ts    # Content moderation API
├── components/
│   ├── MemeGenerator.tsx   # Meme generator component
│   ├── MemeCard.tsx        # Individual meme display
│   ├── MemeFeed.tsx        # Feed of all memes
│   └── MemeUpload.tsx      # Image upload component
├── lib/
│   ├── instant.ts          # InstantDB client setup
│   └── moderation.ts       # Content moderation service
└── instant.schema.ts       # InstantDB schema definition
```

## License

MIT
