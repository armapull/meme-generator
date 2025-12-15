'use client';

import { db } from '@/lib/instant';

export default function InstantDBProvider({ children }: { children: React.ReactNode }) {
  // In InstantDB 0.21+, the provider is handled by the db.init() call
  // No need for a separate provider component
  return <>{children}</>;
}
