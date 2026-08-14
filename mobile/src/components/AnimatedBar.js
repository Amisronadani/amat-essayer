import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { couleurs, espacements, rayon, typo } from '../theme/colors';

export default function AnimatedBar({ percentage, color = couleurs.vertPrincipal, label, count, delay = 0 }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [percentage, delay]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.stats}>
          <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
          {'  '}
          <Text style={styles.count}>({count})</Text>
        </Text>
      </View>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { backgroundColor: color, width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: espacements.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: espacements.xs,
  },
  label: {
    ...typo.corps,
    fontWeight: '600',
    flex: 1,
  },
  stats: {
    ...typo.corps,
  },
  percentage: {
    fontWeight: '700',
    color: couleurs.texte,
  },
  count: {
    color: couleurs.texteMuted,
    fontSize: 12,
  },
  barBackground: {
    height: 8,
    backgroundColor: couleurs.grisTresClair,
    borderRadius: rayon.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: rayon.pill,
  }
});
