import { useEffect } from 'react';
import App from '../src/App';

export default function SettingsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'settings');
    }
  }, []);

  return <App />;
}
