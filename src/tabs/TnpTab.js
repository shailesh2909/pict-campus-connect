import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Skeleton from '../components/Skeleton';

// ── Monochromatic SVG Icons ───────────────────────────────────────────────────
const BellIcon = ({ size = 18, color = '#3D6EE8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = ({ size = 15, color = '#BBBBBB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.8} />
    <Path
      d="M21 21l-4-4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

// ── Color tokens ──────────────────────────────────────────────────────────────
const COLORS = {
  primary:       '#007AFF',
  primaryLight:  '#E5F1FF',
  background:    '#F2F2F7',
  card:          '#FFFFFF',
  border:        '#E5E5EA',
  textPrimary:   '#000000',
  textSecondary: '#3C3C43',
  textMuted:     '#8E8E93',
  white:         '#FFFFFF',
};

// ── Mock data (replace with Firebase calls) ───────────────────────────────────
const todayCompany = {
  name: 'Company Name',
  service: 'Product/Service',
  package: '14.5 LPA',
  eligibility: 'Eligibility Criteria...',
  eligibleDept: 'ENTC, COMP, IT',
  skills: 'React Native, JavaScript',
  reportingTime: '09:30 AM',
  venue: 'Seminar Hall',
  skillsRequired: '',
};

const upcomingCompanies = [
  { id: '1', name: 'Company Name', service: 'Product/Service', lpa: '14.5 LPA', date: 'March 18, 2026' },
  { id: '2', name: 'Company Name', service: 'Product/Service', lpa: '14.5 LPA', date: 'March 18, 2026' },
  { id: '3', name: 'Company Name', service: 'Product/Service', lpa: '14.5 LPA', date: 'March 18, 2026' },
];

const visitedCompanies = [
  { id: '1', name: 'Company Name', lpa: '14.5 LPA', totalHired: 'Total Hired' },
  { id: '2', name: 'Company Name', lpa: '14.5 LPA', totalHired: 'Total Hired' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function TnpTab({ navigation }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent={false}
      />

      {/* ── Header ── */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.topbarTitle}>T&P Hub</Text>
          {/* <Text style={styles.topbarSub}>PICT Campus Connect</Text> */}
        </View>
        <Image
          source={require('../../assets/pict logo.png')}
          style={{ width: 40, height: 40, resizeMode: 'contain' }}
        />
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <SearchIcon size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies, roles..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Today's Company ── */}
        <Text style={styles.sectionTitle}>Today's Company</Text>
        {loading ? (
          <View style={styles.todayCard}>
            <View style={styles.todayTop}>
              <View style={styles.todayInfo}>
                <Skeleton width={150} height={22} style={{ marginBottom: 6 }} />
                <Skeleton width={100} height={16} />
              </View>
              <Skeleton width={68} height={68} borderRadius={12} />
            </View>
            <View style={styles.pillRow}>
              <Skeleton width={120} height={36} borderRadius={10} />
              <Skeleton width={100} height={36} borderRadius={10} />
            </View>
            <View style={styles.metaList}>
              <Skeleton width="90%" height={16} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="70%" height={16} />
            </View>
          </View>
        ) : (
          <View style={styles.todayCard}>
            <View style={styles.todayTop}>
              <View style={styles.todayInfo}>
                <Text style={styles.coName}>{todayCompany.name}</Text>
                <Text style={styles.coSub}>{todayCompany.service}</Text>
              </View>
              <View style={styles.photoBox}>
                <Text style={styles.photoText}>Photo</Text>
              </View>
            </View>

            <View style={styles.pillRow}>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>Package (CTC)</Text>
                <Text style={styles.pillBlueText}>{todayCompany.package}</Text>
              </View>
              <View style={styles.pillOutline}>
                <Text style={styles.pillOutlineText}>{todayCompany.eligibility}</Text>
              </View>
            </View>

            <View style={styles.metaList}>
              <Text style={styles.metaText}>
                <Text style={styles.metaBold}>Skills: </Text>{todayCompany.skills}
              </Text>
              <Text style={styles.metaText}>
                Reporting Time: <Text style={styles.metaBold}>{todayCompany.reportingTime}</Text>
              </Text>
              <Text style={styles.metaText}>
                Venue: <Text style={styles.metaBold}>{todayCompany.venue}</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('TodayCompanyScreen', { company: todayCompany })}
            >
              <Text style={styles.viewLink}>View Details →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Upcoming Companies ── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Upcoming Company</Text>
        {loading ? (
          [1, 2].map(key => (
            <View key={key} style={styles.upCard}>
               <View style={styles.upRow}>
                 <View>
                   <Skeleton width={120} height={20} style={{ marginBottom: 6 }} />
                   <Skeleton width={80} height={14} />
                 </View>
                 <Skeleton width={70} height={20} />
               </View>
               <View style={[styles.upBottom, { marginTop: 16 }]}>
                 <Skeleton width={100} height={14} />
               </View>
            </View>
          ))
        ) : (
          upcomingCompanies.map((item) => (
            <View key={item.id} style={styles.upCard}>
              <View style={styles.upRow}>
                <View>
                  <Text style={styles.upName}>{item.name}</Text>
                  <Text style={styles.upSub}>{item.service}</Text>
                </View>
                <Text style={styles.lpa}>{item.lpa}</Text>
              </View>
              <View style={styles.upBottom}>
                <Text style={styles.upDate}>{item.date}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UpcomingCompanyScreen', { company: item })}
                >
                  <Text style={styles.upLink}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ── Company Visited ── */}
        <View style={styles.visitedHeader}>
          <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 0 }]}>
            Company Visited
          </Text>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.visitedGrid}>
          {loading ? (
            [1, 2].map(key => (
              <View key={key} style={styles.vCard}>
                <Skeleton width="80%" height={16} style={{ marginBottom: 4 }} />
                <Skeleton width="60%" height={16} style={{ marginBottom: 4 }} />
                <Skeleton width="70%" height={14} />
              </View>
            ))
          ) : (
            visitedCompanies.map((item) => (
              <View key={item.id} style={styles.vCard}>
                <Text style={styles.vName}>{item.name}</Text>
                <Text style={styles.vLpa}>{item.lpa}</Text>
                <Text style={styles.vHired}>{item.totalHired}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('VisitedCompanyScreen', { company: item })}
                >
                  <Text style={styles.vLink}>View Details →</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

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

  // Search
  searchWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  searchBox: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 14,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  // Today card
  todayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  todayInfo: {
    flex: 1,
  },
  coName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  coSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  photoBox: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  pillBlue: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pillBlueText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
    lineHeight: 19,
  },
  pillOutline: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  pillOutlineText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '500',
  },
  metaList: {
    marginTop: 16,
    gap: 7,
  },
  metaText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 21,
  },
  metaBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 14,
  },

  // Upcoming — individual cards with gap
  upCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  upRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  upName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  upSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  lpa: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  upBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  upDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  upLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Visited
  visitedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitedGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  vCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vLpa: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  vHired: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  vLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 12,
  },
  viewAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});