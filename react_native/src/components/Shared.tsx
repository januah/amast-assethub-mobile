import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, STATUS_COLORS, REPLACEMENT_STATUS_COLORS, PPM_STATUS_COLORS } from '../constants/theme';

const ICON_MAP: Record<string, string> = {
  Breakdown: 'warning-outline',
  Replacement: 'repeat-outline',
  Truck: 'car-outline',
  PPM: 'settings-outline',
  Report: 'document-text-outline',
  Jobs: 'briefcase-outline',
  Calendar: 'calendar-outline',
  Check: 'checkmark-circle',
  Clock: 'time-outline',
  ChevronRight: 'chevron-forward',
  Navigation: 'navigate-outline',
  User: 'person-outline',
  List: 'list-outline',
  Phone: 'call-outline'
};

type Status = 'Pending' | 'In Progress' | 'Approved' | 'Completed' | 'Rejected' | 'Sent to Office' | 'ACTIVE' | 'MAINTENANCE' | 'CALIBRATION' | 'DECOMMISSIONED';

export function StatusBadge({ status }: { status: Status | string }) {
  const style = STATUS_COLORS[status] || { bg: COLORS.slate[100], text: COLORS.slate[600] };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status}</Text>
    </View>
  );
}

export function ReplacementStatusBadge({ status }: { status: string }) {
  const style = REPLACEMENT_STATUS_COLORS[status] || REPLACEMENT_STATUS_COLORS['In Use'] || { bg: COLORS.sky[100], text: COLORS.sky[600] };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status}</Text>
    </View>
  );
}

export function PPMStatusBadge({ status }: { status: string }) {
  const style = PPM_STATUS_COLORS[status] || { bg: COLORS.slate[100], text: COLORS.slate[600] };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status || 'Pending'}</Text>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: string;
  sublabel?: string;
  onPress?: () => void;
  color?: ViewStyle['backgroundColor'];
}

export function ActionButton({ label, icon, sublabel, onPress, color = COLORS.white }: ActionButtonProps) {
  const iconName = ICON_MAP[icon] || 'ellipse-outline';
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.actionIconWrap}>
        <Ionicons name={iconName as React.ComponentProps<typeof Ionicons>['name']} size={20} color={COLORS.primary} />
      </View>
      <View>
        <Text style={styles.actionLabel}>{label}</Text>
        {sublabel && <Text style={styles.actionSublabel} numberOfLines={1}>{sublabel}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export function SectionHeader({
  title,
  onSeeAll
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={stepperStyles.container}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <View style={stepperStyles.step}>
            <View style={[stepperStyles.dot, idx <= current && stepperStyles.dotActive]}>
              <Text style={[stepperStyles.dotText, idx <= current && stepperStyles.dotTextActive]}>{idx + 1}</Text>
            </View>
            <Text style={[stepperStyles.label, idx <= current && stepperStyles.labelActive]} numberOfLines={1}>{step}</Text>
          </View>
          {idx < steps.length - 1 && (
            <View style={[stepperStyles.line, idx < current && stepperStyles.lineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100]
  },
  step: { alignItems: 'center', minWidth: 56 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center'
  },
  dotActive: { backgroundColor: COLORS.primary },
  dotText: { fontSize: 11, fontWeight: '600', color: COLORS.slate[400] },
  dotTextActive: { color: COLORS.white },
  label: { fontSize: 9, fontWeight: '600', color: COLORS.slate[400], marginTop: 4 },
  labelActive: { color: COLORS.primary },
  line: { flex: 1, height: 2, alignSelf: 'center', marginHorizontal: 4, marginBottom: 20, backgroundColor: COLORS.slate[100] },
  lineActive: { backgroundColor: COLORS.primary }
});

export function Card({
  children,
  onPress,
  style,
  leftBorder
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  leftBorder?: string;
}) {
  const content = (
    <View style={[styles.card, style, leftBorder ? { position: 'relative' as const } : undefined]}>
      {leftBorder ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: leftBorder,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16
          }}
        />
      ) : null}
      {children}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.9}>{content}</TouchableOpacity>;
  }
  return content;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.sky[50],
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[800]
  },
  actionSublabel: {
    fontSize: 10,
    color: COLORS.slate[500],
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.slate[900]
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 16,
    padding: 16
  }
});
