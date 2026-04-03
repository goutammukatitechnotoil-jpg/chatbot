import { useEffect } from 'react';
import { useRouter } from 'next/router';
import App from '../src/App';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Store the active tab in sessionStorage for the AdminPanel to read
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'dashboard');
    }
  }, []);

  return <App />;
}
