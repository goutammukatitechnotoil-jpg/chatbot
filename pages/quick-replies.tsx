import { useEffect } from 'react';
import App from '../src/App';

export default function QuickRepliesPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'sentences');
    }
  }, []);

  return <App />;
}
