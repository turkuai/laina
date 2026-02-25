export const getApiBase = () => window.__API_BASE__ || import.meta.env.VITE_API_BASE_URL;
export const getPublicUrl = () => import.meta.env.BASE_URL;
