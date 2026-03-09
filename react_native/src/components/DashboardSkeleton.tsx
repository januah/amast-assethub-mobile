import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

const SKELETON_BG = COLORS.slate[200];
const SKELETON_HIGHLIGHT = COLORS.slate[100];

function SkeletonLine({ width = '100%', height = 12, style }: { width?: number | string; height?: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: SKELETON_BG, opacity },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SkeletonLine width={100} height={10} style={styles.heroLine1} />
        <SkeletonLine width={160} height={20} style={styles.heroLine2} />
        <View style={styles.heroMeta}>
          <SkeletonLine width={80} height={24} style={styles.heroChip} />
          <SkeletonLine width={90} height={24} style={styles.heroChip} />
          <SkeletonLine width={70} height={24} style={styles.heroChip} />
        </View>
      </View>
      <View style={styles.actionsRow}>
        <View style={styles.actionBlock}>
          <SkeletonLine width={60} height={10} style={{ marginBottom: 8 }} />
          <SkeletonLine width={100} height={14} />
        </View>
        <View style={styles.actionBlock}>
          <SkeletonLine width={50} height={10} style={{ marginBottom: 8 }} />
          <SkeletonLine width={90} height={14} />
        </View>
      </View>
      <View style={styles.statsRow}>
        <SkeletonLine width="31%" height={50} style={styles.statBlock} />
        <SkeletonLine width="31%" height={50} style={styles.statBlock} />
        <SkeletonLine width="31%" height={50} style={styles.statBlock} />
      </View>
      <SkeletonLine width={120} height={12} style={styles.sectionTitle} />
      <View style={styles.list}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.listCard}>
            <View style={styles.listCardTop}>
              <SkeletonLine width={80} height={10} />
              <SkeletonLine width={60} height={16} style={{ marginTop: 6 }} />
            </View>
            <SkeletonLine width={100} height={10} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: SKELETON_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heroLine1: { marginBottom: 8 },
  heroLine2: { marginBottom: 16 },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroChip: {
    borderRadius: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  actionBlock: {
    flex: 1,
    backgroundColor: SKELETON_HIGHLIGHT,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statBlock: {
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  listCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});
