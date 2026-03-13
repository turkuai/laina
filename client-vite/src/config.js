let base = '/';

export function setBaseUrls(app, api) {
  base = app || api || '/';
  if (base !== '/' && !base.endsWith('/')) {
    base = base + '/';
  }
}

export function getBasename() {
  return base;
}

export function getApiBase() {
  if (base === '/') return '';
  if (base.endsWith('/')) return base.slice(0, -1);
  return base;
}

export function getAssetUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base + p;
}
