import { Suspense } from 'react';
import { SecondaryPasswordSetupPage } from '@/views/secondary-password-setup/ui/SecondaryPasswordSetupPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SecondaryPasswordSetupPage />
    </Suspense>
  );
}
