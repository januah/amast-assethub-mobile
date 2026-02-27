import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';

interface PendingApprovalsScreenProps {
  onBack: () => void;
}

export function PendingApprovalsScreen({ onBack }: PendingApprovalsScreenProps) {
  return (
    <View style={styles.container}>
      <Header title="Pending Approvals" showBack onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Pending approvals will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 14, color: COLORS.slate[500], fontWeight: '600' }
});
