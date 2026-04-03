import { useEffect } from 'react';
import App from '../src/App';

export default function IntegrationsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'integrations');
    }
  }, []);

  return <App />;
}
