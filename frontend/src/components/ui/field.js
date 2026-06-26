import { Text, View, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export function Field({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8 },
  label: { fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, flex: 1 },
  value: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary, textAlign: 'right', flex: 1.5 },
});
