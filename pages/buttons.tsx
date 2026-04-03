import { useEffect } from 'react';
import App from '../src/App';

export default function ButtonsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'buttons');
    }
  }, []);

  return <App />;
}
