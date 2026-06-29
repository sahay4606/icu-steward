import { router } from 'expo-router';

export function goBack(fallback = '/') {
  if (typeof window !== 'undefined' && window.history.length <= 1) {
    router.replace(fallback);
  } else {
    router.back();
  }
}
