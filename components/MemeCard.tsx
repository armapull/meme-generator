'use client';

import { useState, useEffect } from 'react';
import { db, id } from '@/lib/instant';
import type { AppSchema } from '@/instant.schema';

// Use the query result type for proper type inference
type MemeQuery = ReturnType<typeof db.useQuery<{ memes: {} }>>['data'];
type Meme = MemeQuery extends { memes: infer M } ? M extends (infer U)[] ? U : never : never;
type UpvoteQuery = ReturnType<typeof db.useQuery<{ upvotes: {} }>>['data'];
type Upvote = UpvoteQuery extends { upvotes: infer U } ? U extends (infer V)[] ? V : never : never;

interface MemeCardProps {
  meme: any; // Using any temporarily to fix build - InstantDB types are complex
}

export default function MemeCard({ meme }: MemeCardProps) {
  const { user } = db.useAuth();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if current user is the author
  const currentUserId = user?.id || localStorage.getItem('anonymousUserId') || '';
  const isAuthor = meme.authorId === currentUserId;

  const { data } = db.useQuery({
    upvotes: {
      $: {
        where: { memeId: meme.id },
      },
    },
  });

  useEffect(() => {
    const upvotes = (data?.upvotes || []) as any[];
    setUpvoteCount(upvotes.length);
    
    // Check if current user has upvoted (using localStorage as fallback for anonymous)
    const userId = user?.id || localStorage.getItem('anonymousUserId') || '';
    const userUpvoted = upvotes.some((uv: any) => uv.userId === userId);
    setHasUpvoted(userUpvoted);
  }, [data, user]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;

    const userId = user?.id || localStorage.getItem('anonymousUserId') || `anon_${Date.now()}`;
    
    // Store anonymous user ID for future reference
    if (!user?.id) {
      localStorage.setItem('anonymousUserId', userId);
    }

    // Create upvote using the new transaction API
    const newUpvote = db.tx.upvotes[id()].update({
      memeId: meme.id,
      userId: userId,
      createdAt: Date.now(),
    });

    await db.transact([newUpvote]);

    setHasUpvoted(true);
    setUpvoteCount((prev) => prev + 1);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meme?')) return;
    
    setIsDeleting(true);
    try {
      // Delete the meme
      const deleteMeme = db.tx.memes[meme.id].delete();
      await db.transact([deleteMeme]);
      
      // Note: Upvotes linked to this meme should be deleted automatically
      // if cascade delete is configured in the schema
      
      // Reset deleting state after successful deletion
      // (Component will unmount when meme is removed from feed, but reset state for safety)
      setIsDeleting(false);
    } catch (err) {
      console.error('Error deleting meme:', err);
      alert('Failed to delete meme. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img
          src={meme.imageUrl}
          alt="Meme"
          className="w-full h-auto object-contain bg-gray-50"
          style={{ maxHeight: '500px' }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
              hasUpvoted
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
            }`}
          >
            <span>{hasUpvoted ? '✓' : '↑'}</span>
            <span>{upvoteCount}</span>
          </button>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <span className="text-sm text-gray-500">
              {new Date(meme.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
