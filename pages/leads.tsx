import { useEffect } from 'react';
import App from '../src/App';

export default function LeadsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'leads');
    }
  }, []);

  return <App />;
}
