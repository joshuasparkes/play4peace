'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export default function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { emailVerified, isAuthenticated, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    // If authenticated but email not verified, redirect to verification page
    if (!loading && isAuthenticated && !emailVerified) {
      router.push('/verify-email');
    }
  }, [emailVerified, isAuthenticated, loading, router]);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Show nothing if not verified (will redirect)
  if (isAuthenticated && !emailVerified) {
    return null;
  }

  // Show children if verified or not authenticated (other guards will handle auth)
  return <>{children}</>;
}
