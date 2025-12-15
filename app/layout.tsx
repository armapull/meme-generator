import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import InstantDBProvider from '@/components/InstantDBProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meme App',
  description: 'Create and share memes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <InstantDBProvider>
          {children}
        </InstantDBProvider>
      </body>
    </html>
  );
}
