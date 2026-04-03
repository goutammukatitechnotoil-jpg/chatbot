import { useEffect } from 'react';
import App from '../src/App';

export default function TeamPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'team');
    }
  }, []);

  return <App />;
}
