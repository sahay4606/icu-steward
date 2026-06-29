import { router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { typography } from '../theme';

export function BackButton({ colors, fallback = '/', label = 'Back', testID }) {
  function handlePress() {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      data-testid={testID || 'back-button'}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}
    >
      <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
      <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}
