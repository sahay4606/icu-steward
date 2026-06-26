import { View, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../../theme';

export function Surface({ children, style, ...props }) {
  return (
    <View {...props} style={[styles.surface, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    ...shadow.low,
  },
});
