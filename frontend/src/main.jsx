import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="859996932265-a3j2hgsmlnrq2i2v47rqvklprm4454sd.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('🚀 PWA: Service Worker Registered!', reg.scope))
      .catch(err => console.log('❌ PWA: Registration Failed!', err));
  });
}

