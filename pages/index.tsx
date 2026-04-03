import { useEffect } from 'react';
import { useRouter } from 'next/router';
import App from '../src/App';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated, if so redirect to dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      // If authenticated as tenant, redirect to dashboard
      if (token && !isSuperAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  return <App />;
}
