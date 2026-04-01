import { Suspense } from 'react';
import { RegionSelectPage } from '@/views/region-select';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegionSelectPage />
    </Suspense>
  );
}
