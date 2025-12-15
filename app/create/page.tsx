'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, id } from '@/lib/instant';
import MemeGenerator from '@/components/MemeGenerator';
import MemeUpload from '@/components/MemeUpload';

export default function CreatePage() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'generator' | 'upload'>('generator');

  const handleMemeCreated = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
  };

  const handleImageSelected = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
  };

  const moderateAndPost = async () => {
    if (!selectedImage) return;

    setIsPosting(true);
    setError(null);

    try {
      // Moderate the image
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
        }),
      });

      const moderationResult = await response.json();

      if (!moderationResult.safe) {
        setError(
          moderationResult.reason ||
            'Your meme contains inappropriate content and cannot be posted.'
        );
        setIsPosting(false);
        return;
      }

      // Post to InstantDB
      const userId = user?.id || localStorage.getItem('anonymousUserId') || `anon_${Date.now()}`;
      if (!user?.id) {
        localStorage.setItem('anonymousUserId', userId);
      }

      // Post to InstantDB using the new transaction API
      const newMeme = db.tx.memes[id()].update({
        imageUrl: selectedImage,
        createdAt: Date.now(),
        upvotes: 0,
        authorId: userId,
      });

      const result = await db.transact([newMeme]);
      console.log('Meme posted successfully:', result);

      // Reset posting state before redirecting
      setIsPosting(false);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Error posting meme:', err);
      setError('Failed to post meme. Please try again.');
      setIsPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Feed
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Meme</h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('generator')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                mode === 'generator'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                mode === 'upload'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upload
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {mode === 'generator' ? (
          <MemeGenerator onMemeCreated={handleMemeCreated} />
        ) : (
          <MemeUpload onImageSelected={handleImageSelected} />
        )}

        {selectedImage && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Preview</h2>
            <div className="mb-6 flex justify-center">
              <img
                src={selectedImage}
                alt="Meme preview"
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <button
              onClick={moderateAndPost}
              disabled={isPosting}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting...' : 'Post Meme'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
