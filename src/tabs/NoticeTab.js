import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary:       '#3D6EE8',
  primaryLight:  '#EEF3FD',
  background:    '#F5F6FA',
  card:          '#FFFFFF',
  border:        '#E0E7F5',
  textPrimary:   '#111111',
  textSecondary: '#888888',
  textMuted:     '#BBBBBB',
  white:         '#FFFFFF',
};

// ── Category tag colors ───────────────────────────────────────────────────────
const TAG_COLORS = {
  All:         { bg: '#EEF3FD', text: '#3D6EE8' },
  Academic:    { bg: '#ECFDF5', text: '#065F46' },
  Holiday:     { bg: '#FEF3C7', text: '#B45309' },
  Scholarship: { bg: '#F5F3FF', text: '#5B21B6' },
};

// ── Filter categories ─────────────────────────────────────────────────────────
const FILTERS = ['All', 'Academic', 'Holiday', 'Scholarship'];

// ── Mock data (replace with Firebase calls) ───────────────────────────────────
const notices = [
  {
    id: '1',
    category: 'All',
    title: 'Library Time Changes',
    description: 'The Library changes from 03:30 PM to 05:30 PM',
    time: '10:30 AM',
  },
  {
    id: '2',
    category: 'Holiday',
    title: 'Diwali Holidays',
    description: 'Diwali holidays starts from 15 October to 22 October',
    time: '09:00 AM',
  },
  {
    id: '3',
    category: 'Academic',
    title: 'Unit Test Timetable',
    description: 'Checkout the Unit Test Timetable on the college portal',
    time: '08:15 AM',
  },
  {
    id: '4',
    category: 'Scholarship',
    title: 'Desk One Correction',
    description: 'Application sent back to applicant for correction',
    time: 'Yesterday',
  },
];

// ── Bell Icon ─────────────────────────────────────────────────────────────────
const BellIcon = ({ size = 16, color = '#3D6EE8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Notice Card ───────────────────────────────────────────────────────────────
const NoticeCard = ({ item }) => {
  const tag = TAG_COLORS[item.category] || TAG_COLORS['All'];
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardTag, { backgroundColor: tag.bg }]}>
          <Text style={[styles.cardTagText, { color: tag.text }]}>{item.category}</Text>
        </View>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
    </View>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function NoticeTab() {
  const [activeFilter, setActiveFilter] = useState('All');
  const insets = useSafeAreaInsets();

  const filtered = activeFilter === 'All'
    ? notices
    : notices.filter(n => n.category === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />

      {/* ── Header ── */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.topbarTitle}>Notices</Text>
          {/* <Text style={styles.topbarSub}>PICT Campus Connect</Text> */}
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <BellIcon size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Filter pills ── */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.pill, activeFilter === f && styles.pillActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Notices list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map(item => <NoticeCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No notices in this category.</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Header
  topbar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topbarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  topbarSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter pills
  filterWrap: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 14,
  },

  // Notice card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTag: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});