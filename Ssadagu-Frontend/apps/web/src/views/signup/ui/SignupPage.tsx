'use client';

import { useRouter } from 'next/navigation';
import { SignupForm } from '@/features/auth';

export function SignupPage() {
  const router = useRouter();

  return (
    <SignupForm onSuccess={() => router.push('/')} />
  );
}
