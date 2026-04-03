import { useEffect } from 'react';
import App from '../src/App';

export default function TestChatbotPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', 'test');
    }
  }, []);
  

  return <App />;
}
