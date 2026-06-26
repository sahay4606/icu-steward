import { Platform } from 'react-native';

const DEV_API_HOST = Platform.OS === 'web' ? 'http://localhost:4000' : 'http://localhost:4000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_HOST;
export const ACTIVE_HOSPITAL_ID = 'hosp-st-john';
export const ACTIVE_USER_ID = 'u-admin';
