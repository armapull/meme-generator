'use client';

import { db } from '@/lib/instant';
import MemeCard from './MemeCard';
import type { AppSchema } from '@/instant.schema';

type Meme = AppSchema['entities']['memes'];

export default function MemeFeed() {
  const { data, isLoading } = db.useQuery({
    memes: {},
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Loading memes...</div>
      </div>
    );
  }

  const memes = (data?.memes || []) as Meme[];
  
  // Sort by createdAt descending (client-side for now)
  const sortedMemes = [...memes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  
  console.log('Memes loaded:', sortedMemes.length, sortedMemes);

  if (sortedMemes.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No memes yet!</h2>
        <p className="text-gray-500 mb-8">Be the first to create a meme.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedMemes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}
