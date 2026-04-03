import { useEffect } from 'react';
import App from '../src/App';

export default function SlidersPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'sliders');
    }
  }, []);

  return <App />;
}
