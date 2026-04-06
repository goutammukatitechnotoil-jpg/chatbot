import type { AppProps } from 'next/app'
import '../src/index.css'
import { ChatbotConfigProvider } from '../src/contexts/ChatbotConfigContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatbotConfigProvider>
      <Component {...pageProps} />
    </ChatbotConfigProvider>
  )
}
