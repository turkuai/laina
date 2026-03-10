export const getApiBase = () => {
  if (import.meta.env.DEV) return '';
  return import.meta.env.VITE_API_BASE_URL || window.__API_BASE__ || '';
};
export const getPublicUrl = () => import.meta.env.BASE_URL || '';