import { useEffect } from 'react';
import App from '../src/App';

export default function FormsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'forms');
    }
  }, []);

  return <App />;
}
