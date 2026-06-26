const PROD_API_URL = 'https://icu-steward-api.onrender.com';
let apiUrl = PROD_API_URL;

if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
  apiUrl = process.env.EXPO_PUBLIC_API_URL;
} else if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
  apiUrl = 'http://localhost:4000';
}

export const API_BASE_URL = apiUrl;
export const ACTIVE_HOSPITAL_ID = 'hosp-st-john';
export const ACTIVE_USER_ID = 'u-admin';
