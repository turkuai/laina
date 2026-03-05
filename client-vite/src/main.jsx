import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';
import App from './App';
import './index.css';

function getBasename() {
  const p = window.location.pathname.split('/').filter(Boolean);
  return p.length ? '/' + p[0] : '/';
}

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

// teacher put .env in dist after build
function loadEnv() {
  fetch('./.env')
    .then((r) => (r.ok ? r.text() : ''))
  .then((text) => {
      const env = parseEnv(text);
      const url = env.API_BASE_URL || env.VITE_API_BASE_URL;
      if (url && url !== 'undefined') window.__API_BASE__ = url;
      window.__API_BASE__ = window.__API_BASE__ || getBasename();
      renderApp();
    })
  .catch(() => {
      fetch('./env').then((r) => (r.ok ? r.text() : '')).then((text) => {
        const env = parseEnv(text);
        const url = env.API_BASE_URL || env.VITE_API_BASE_URL;
        if (url && url !== 'undefined') window.__API_BASE__ = url;
        window.__API_BASE__ = window.__API_BASE__ || getBasename();
        renderApp();
      }).catch(() => {
        window.__API_BASE__ = window.__API_BASE__ || getBasename();
        renderApp();
      });
    });
}
if (import.meta.env.DEV) {
  window.__API_BASE__ = window.__API_BASE__ || getBasename();
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
