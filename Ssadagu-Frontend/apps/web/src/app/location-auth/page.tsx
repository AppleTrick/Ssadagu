import { Suspense } from 'react';
import { LocationAuthPage } from '@/views/location-auth';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LocationAuthPage />
    </Suspense>
  );
}
