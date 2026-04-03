import { useEffect } from 'react';
import App from '../src/App';

export default function AppearancePage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'appearance');
    }
  }, []);

  return <App />;
}
