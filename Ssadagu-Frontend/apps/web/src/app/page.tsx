'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { LoginForm } from '@/features/auth';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/home');
  }, [isAuthenticated, router]);

  return <LoginForm onSuccess={() => router.push('/home')} />;
}
