const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const pageHost = window.location.hostname || "localhost";

export const API_URL = configuredApiUrl || `http://${pageHost}:5000`;
