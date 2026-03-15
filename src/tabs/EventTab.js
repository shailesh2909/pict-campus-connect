import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  green:         '#065F46',
  greenLight:    '#ECFDF5',
};

// ── Mock data (replace with Firebase calls) ───────────────────────────────────
const ongoingEvents = [
  {
    id: '1',
    name: 'Event Name',
    date: 'Monday 24, October 2026',
    time: '10:00 AM – 12:00 PM',
  },
  {
    id: '2',
    name: 'Event Name',
    date: 'Monday 24, October 2026',
    time: '10:00 AM – 12:00 PM',
  },
];

const upcomingEvents = [
  {
    id: '1',
    name: 'Event Name',
    date: 'Monday 24, October 2026',
    time: '10:00 AM – 12:00 PM',
  },
  {
    id: '2',
    name: 'Event Name',
    date: 'Monday 24, October 2026',
    time: '10:00 AM – 12:00 PM',
  },
  {
    id: '3',
    name: 'Event Name',
    date: 'Monday 24, October 2026',
    time: '10:00 AM – 12:00 PM',
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

// ── Ongoing Event Card ────────────────────────────────────────────────────────
const OngoingCard = ({ item, onViewDetails }) => (
  <View style={styles.ongoingCard}>
    <View style={styles.liveBadge}>
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </View>
    <Text style={styles.eventName}>{item.name}</Text>
    <Text style={styles.metaLabel}>Date and Time:</Text>
    <Text style={styles.eventDate}>{item.date}</Text>
    <Text style={styles.eventTime}>{item.time}</Text>
    <TouchableOpacity onPress={() => onViewDetails && onViewDetails(item)}>
      <Text style={styles.viewLink}>View Details →</Text>
    </TouchableOpacity>
  </View>
);

// ── Upcoming Event Card ───────────────────────────────────────────────────────
const UpcomingCard = ({ item, onViewDetails, onRegister }) => (
  <View style={styles.upcomingCard}>
    <View style={styles.upcomingLeft}>
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.metaLabel}>Date and Time:</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
      <Text style={styles.eventTime}>{item.time}</Text>
      <TouchableOpacity onPress={() => onViewDetails && onViewDetails(item)}>
        <Text style={styles.viewLink}>View Details →</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      style={styles.registerBtn}
      onPress={() => onRegister && onRegister(item)}
      activeOpacity={0.85}
    >
      <Text style={styles.registerBtnText}>Register{'\n'}Now</Text>
    </TouchableOpacity>
  </View>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function EventTab({ navigation }) {
  const handleViewDetails = (item) => {
    navigation.navigate('OngoingEventScreen', { event: item });
  };

  const handleViewUpcomingDetails = (item) => {
    navigation.navigate('UpcomingEventScreen', { event: item });
  };

  const handleRegister = (item) => {
    // handle registration logic
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />

      {/* ── Header ── */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.topbarTitle}>Events</Text>
          {/* <Text style={styles.topbarSub}>PICT Campus Connect</Text> */}
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <BellIcon size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Ongoing Events ── */}
        <Text style={styles.sectionTitle}>Ongoing Events</Text>
        {ongoingEvents.length > 0 ? (
          ongoingEvents.map(item => (
            <OngoingCard
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No ongoing events.</Text>
        )}

        {/* ── Upcoming Events ── */}
        <Text style={[styles.sectionTitle, styles.sectionTitleUpcoming]}>
          Upcoming Events
        </Text>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(item => (
            <UpcomingCard
              key={item.id}
              item={item}
              onViewDetails={handleViewUpcomingDetails}
              onRegister={handleRegister}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming events.</Text>
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

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 14,
  },

  // Section titles
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitleUpcoming: {
    marginTop: 20,
  },

  // Ongoing card
  ongoingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: COLORS.greenLight,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },

  // Upcoming card
  upcomingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  upcomingLeft: {
    flex: 1,
    marginRight: 10,
  },

  // Shared event content
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    paddingRight: 70,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  viewLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 10,
  },

  // Register Now button
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    flexShrink: 0,
  },
  registerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 17,
  },

  // Empty state
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 10,
  },
});