import Link from 'next/link';
import MemeFeed from '@/components/MemeFeed';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Meme App
            </h1>
            <Link
              href="/create"
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
            >
              Create Meme
            </Link>
          </div>
        </nav>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemeFeed />
      </div>
    </main>
  );
}
