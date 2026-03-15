import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../api/firebase/firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

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
  green:         '#059669',
  greenLight:    '#ECFDF5',
  greenBorder:   '#D1FAE5',
  amber:         '#F59E0B',
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const NotesIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      stroke={COLORS.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="14 2 14 8 20 8"
      stroke={COLORS.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="16" y1="13" x2="8" y2="13" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
    <Line x1="16" y1="17" x2="8" y2="17" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
    <Polyline points="10 9 9 9 8 9" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionRow = ({ title, onViewAll }) => (
  <View style={styles.secRow}>
    <Text style={styles.secTitle}>{title}</Text>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.secLink}>View All</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudentHomeTab({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [todayCompany, setTodayCompany] = useState(null);
  const [notices, setNotices] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser?.uid) { setLoading(false); return; }

        // 1. User profile
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          const profile = userSnap.data();
          setUserData(profile);

          // 2. Timetable
          const classValue = String(profile.class || profile.className || '').trim();
          const classParts = classValue.includes('-') ? classValue.split('-') : classValue.split('_');
          const division = String(classParts[classParts.length - 1] || '1').trim();
          const year = String(profile.year || profile.academicYear || 'TE').trim();
          const dept = String(profile.dept || 'CS').trim().toUpperCase();
          const timetableId = `${dept}_${year}_${division}`;
          const ttSnap = await getDoc(doc(db, 'timetables', timetableId));
          if (ttSnap.exists()) {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayClasses = ttSnap.data()?.[days[new Date().getDay()]] || [];
            setTodayClasses(Array.isArray(dayClasses) ? dayClasses : []);
          }
        }

        // 3. Today's company
        const companySnap = await getDocs(
          query(collection(db, 'placement_drives'), where('status', '==', 'today'), limit(1))
        );
        if (!companySnap.empty) setTodayCompany(companySnap.docs[0].data());

        // 4. Recent notices
        const noticeSnap = await getDocs(
          query(collection(db, 'notices'), limit(2))
        );
        setNotices(noticeSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // 5. Upcoming events
        const eventsSnap = await getDocs(
          query(collection(db, 'events'), where('status', '==', 'upcoming'), limit(2))
        );
        setUpcomingEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        setLoading(false);
      } catch (e) {
        console.error('StudentHomeTab fetch error:', e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const initials = userData?.name
    ? userData.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';

  const ongoingClass = todayClasses[0] || null;
  const nextClass = todayClasses[1] || null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />

      {/* ── Header ── */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('StudentProfileScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
        <View style={styles.topbarInfo}>
          <Text style={styles.greet}>{userData?.name?.split(' ')[0] ? `Hello, ${userData.name.split(' ')[0]}` : 'Hello!'}</Text>
          <Text style={styles.roleTag}>Student · {userData?.year || 'TE'}-{userData?.dept || 'COMP'} · {userData?.pictId || ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('NotesScreen')}
        >
          <NotesIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Timetable ── */}
        <SectionRow title="Time Table" onViewAll={() => navigation.navigate('TimetableScreen')} />
        {todayClasses.length > 0 ? (
          todayClasses.slice(0, 2).map((item, i) => (
            <View key={i} style={styles.classCard}>
              <View style={styles.timeCol}>
                <Text style={styles.timeVal}>{item.time}</Text>
                <View style={styles.timeBar} />
              </View>
              <View style={styles.vDivider} />
              <View style={styles.classInfo}>
                <Text style={styles.subject}>{item.sub}</Text>
                <Text style={styles.teacher}>{item.teacher} · Room {item.room}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No classes today.</Text>
        )}

        {/* ── Lecture Status ── */}
        <Text style={[styles.secTitle, { marginBottom: 8, marginTop: 4 }]}>Lecture Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: COLORS.greenLight, borderColor: COLORS.greenBorder }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.green }]} />
            <View>
              <Text style={[styles.statusText, { color: '#065F46' }]}>Ongoing</Text>
              <Text style={styles.statusSub}>{ongoingClass ? `${ongoingClass.sub} · ${ongoingClass.room}` : 'No class now'}</Text>
            </View>
          </View>
          <View style={[styles.statusCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.border }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.amber }]} />
            <View>
              <Text style={styles.statusText}>Upcoming</Text>
              <Text style={styles.statusSub}>{nextClass ? `${nextClass.sub} · ${nextClass.time}` : 'No next class'}</Text>
            </View>
          </View>
        </View>

        {/* ── Today's Company ── */}
        {todayCompany && (
          <>
            <Text style={[styles.secTitle, { marginBottom: 8, marginTop: 4 }]}>Today's Company</Text>
            <TouchableOpacity
              style={styles.companyCard}
              onPress={() => navigation.navigate('TodayCompanyScreen', {
                company: {
                  name:           todayCompany.companyName,
                  service:        todayCompany.role || 'Software Engineer',
                  package:        todayCompany.lpa,
                  eligibility:    todayCompany.eligibility,
                  reportingTime:  todayCompany.reportingTime,
                  venue:          todayCompany.venue,
                  skillsRequired: todayCompany.skills,
                },
              })}
              activeOpacity={0.9}
            >
              <View style={styles.companyHeader}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.companyName}>{todayCompany.companyName}</Text>
                  <Text style={styles.companyMeta}>Criteria: {todayCompany.eligibility}</Text>
                  <Text style={styles.companyMeta}>Skills: {todayCompany.skills}</Text>
                </View>
                <View style={styles.companyPhoto}>
                  <Text style={styles.companyPhotoText}>
                    {todayCompany.companyName?.substring(0, 3).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.companyBottom}>
                {todayCompany.lpa} LPA · {todayCompany.reportingTime} · {todayCompany.venue}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Notices ── */}
        <SectionRow title="Notices" onViewAll={() => navigation.navigate('Notice')} />
        {notices.length > 0 ? (
          notices.map(item => (
            <View key={item.id} style={styles.noticeCard}>
              <View style={[styles.noticeDot, item.category === 'Holiday' && { backgroundColor: COLORS.amber }]} />
              <Text style={styles.noticeText} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.noticeTime}>{item.time}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent notices.</Text>
        )}

        {/* ── Upcoming Events ── */}
        <SectionRow title="Upcoming Events" onViewAll={() => navigation.navigate('Events')} />
        <View style={styles.eventsGrid}>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(item => (
              <View key={item.id} style={styles.eventCard}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventDesc}>{item.date}</Text>
                <TouchableOpacity
                  style={styles.regBtn}
                  onPress={() => navigation.navigate('UpcomingEventScreen', { event: item })}
                >
                  <Text style={styles.regBtnText}>Register Now</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming events.</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },

  topbar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  topbarInfo: { flex: 1 },
  greet: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  roleTag: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 14 },

  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  secTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  secLink: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  classCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeCol: { width: 56, alignItems: 'center', flexShrink: 0 },
  timeVal: { fontSize: 11, fontWeight: '700', color: COLORS.primary, lineHeight: 15, textAlign: 'center' },
  timeBar: { width: 2, height: 14, backgroundColor: COLORS.primary, marginTop: 3 },
  vDivider: { width: 1, backgroundColor: COLORS.border, height: 36, marginHorizontal: 10, flexShrink: 0 },
  classInfo: { flex: 1 },
  subject: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  teacher: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  statusRow: { flexDirection: 'row', marginBottom: 12 },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, flexShrink: 0 },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  statusSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },

  companyCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  companyHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  companyName: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  companyMeta: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, lineHeight: 16 },
  companyPhoto: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  companyPhotoText: { fontSize: 11, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  companyBottom: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 8 },

  noticeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 8, flexShrink: 0 },
  noticeText: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  noticeTime: { fontSize: 10, color: COLORS.textMuted, marginLeft: 8 },

  eventsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  eventCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  eventCardInner: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  eventName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 10 },
  eventDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, lineHeight: 15 },
  regBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  regBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },

  emptyText: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 8 },
});