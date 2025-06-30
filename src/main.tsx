import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css';
import App from './App.tsx'
import { MantineProvider } from '@mantine/core';
import { TonConnectUIProvider } from '@tonconnect/ui-react';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={`${import.meta.env.VITE_APP_URL}/tonconnect-manifest.json`}>
      <MantineProvider>
        <App/>
      </MantineProvider>
    </TonConnectUIProvider>
  </StrictMode>
)
