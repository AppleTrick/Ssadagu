'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MSW_ENABLED !== 'true') {
      setReady(true);
      return;
    }
    import('./browser').then(({ worker }) => {
      worker
        .start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } })
        .then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
