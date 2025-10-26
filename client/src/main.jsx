// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

const updateSW = registerSW({
  onNeedRefresh() {
    // immediately reload the page to get new content
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});