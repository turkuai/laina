import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';
import { getBasename, setBaseUrls } from './config';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

function parseEnv(text) {
  const env = {};
  if (!text || typeof text !== 'string') return env;
  text.split('\n').forEach((line) => {
    line = line.trim();
    if (!line || line[0] === '#') return;
    const i = line.indexOf('=');
    if (i === -1) return;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (key) env[key] = val;
  });
  return env;
}

/** When .env is missing, derive base from current path (e.g. /laina/ from /laina/ or /laina/login) */
function getBaseFromLocation() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return '/' + segments[0] + '/';
}

function loadEnv() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const inSubpath = pathname && pathname !== '/' && pathname !== '';
  const fallback = inSubpath ? getBaseFromLocation() : (import.meta.env.VITE_BASE_URL );
  fetch('./.env')
    .then((r) => (r.ok ? r.text() : ''))
    .then((text) => {
      const env = parseEnv(text);
      const base = (env.BASE_URL || env.VITE_BASE_URL).trim() || fallback;
      setBaseUrls(base, base);
      renderApp();
    })
    .catch(() => {
      fetch('./env')
        .then((r) => (r.ok ? r.text() : ''))
        .then((text) => {
          const env = parseEnv(text);
          const base = (env.BASE_URL || env.VITE_BASE_URL).trim() || fallback;
          setBaseUrls(base, base);
          renderApp();
        })
        .catch(() => {
          const base = getBaseFromLocation();
          setBaseUrls(base, base);
          renderApp();
        });
    });
}

if (import.meta.env.DEV) {
  setBaseUrls(import.meta.env.VITE_BASE_URL , '');
  renderApp();
} else {
  loadEnv();
}

function renderApp() {
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={getBasename()}>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}