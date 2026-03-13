'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Global } from '@emotion/react';
import { globalStyles } from '@/shared/styles/global';
import { useState } from 'react';
import { MSWProvider } from '@/shared/mocks/MSWProvider';
import { GlobalModal } from '@/shared/ui/GlobalModal';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  }));

  return (
    <MSWProvider>
      <QueryClientProvider client={queryClient}>
        <Global styles={globalStyles} />
        {children}
        <GlobalModal />
      </QueryClientProvider>
    </MSWProvider>
  );
};
