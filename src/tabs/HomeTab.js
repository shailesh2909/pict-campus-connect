import React, { useEffect, useState } from 'react';
import { 
  Alert,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../api/firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [todayCompany, setTodayCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser?.uid) {
          setLoading(false);
          return;
        }

        // 1. Fetch User Profile
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const profile = userSnap.data();
          setUserData(profile);

          // 2. Fetch Timetable based on Dept_Year_Div (e.g., CS_TE_1)
          const classValue = String(profile.class || profile.className || '').trim();
          const classParts = classValue.includes('-')
            ? classValue.split('-')
            : classValue.split('_');
          const division = String(classParts[classParts.length - 1] || '1').trim();
          const year = String(profile.year || profile.academicYear || 'TE').trim();
          const dept = String(profile.dept || 'CS').trim().toUpperCase();
          const timetableId = `${dept}_${year}_${division}`;

          const ttSnap = await getDoc(doc(db, 'timetables', timetableId));
          
          if (ttSnap.exists()) {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = days[new Date().getDay()];
            const dayClasses = ttSnap.data()?.[currentDay] || [];
            setTodayClasses(Array.isArray(dayClasses) ? dayClasses : []);
          } else {
            setTodayClasses([]);
          }
        }

        // 3. Fetch Today's Company (Live from TnP)
        const q = query(collection(db, 'placement_drives'), where('status', '==', 'today'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setTodayCompany(snapshot.docs[0].data());
        } else {
          setTodayCompany(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Home Data Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color="#1a73e8" /></View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello, {userData?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.idText}>PICT ID: {userData?.pictId}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileIcon}>
            <Ionicons name="person-circle" size={45} color="#1a73e8" />
          </TouchableOpacity>
        </View>

        {/* Action Grid (The 5 Buttons from your Wireframe) */}
        <View style={styles.gridContainer}>
          <MenuButton title="TT" label="Timetable" color="#E8F0FE" icon="calendar" textColor="#1a73e8" onPress={() => navigation.navigate('Timetable')} />
          <MenuButton title="NT" label="Notices" color="#FEF7E0" icon="notifications" textColor="#F9AB00" onPress={() => navigation.navigate('Notice')} />
          <MenuButton title="TNP" label="Placement" color="#E6F4EA" icon="briefcase" textColor="#1E8E3E" onPress={() => navigation.navigate('TNP')} />
          <MenuButton title="EV" label="Events" color="#FCE8E6" icon="trophy" textColor="#D93025" onPress={() => navigation.navigate('Events')} />
          <MenuButton title="HOL" label="Holidays" color="#F3E5F5" icon="sunny" textColor="#8E24AA" onPress={() => Alert.alert('Coming Soon', 'Holidays screen will be added soon.')} />
        </View>

        {/* Today's Classes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Timetable')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>

        {todayClasses.length > 0 ? todayClasses.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.classCard}>
            <View style={styles.classTime}>
              <Text style={styles.timeText}>{item.time}</Text>
              <View style={styles.verticalLine} />
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.subjectText}>{item.sub}</Text>
              <Text style={styles.teacherText}>{item.teacher} • Room {item.room}</Text>
            </View>
          </View>
        )) : <Text style={styles.emptyText}>No classes scheduled for today.</Text>}

        {/* Today's Company (TNP Quick View) */}
        {todayCompany && (
          <View style={styles.tnpSection}>
            <Text style={styles.sectionTitle}>Today's Company</Text>
            <TouchableOpacity style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <Text style={styles.companyName}>{todayCompany.companyName}</Text>
                <Text style={styles.lpaBadge}>{todayCompany.lpa} LPA</Text>
              </View>
              <Text style={styles.criteriaText}>📍 {todayCompany.venue} | 🕒 {todayCompany.reportingTime}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuButton = ({ title, label, color, icon, textColor, onPress }) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color={textColor} />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  idText: { fontSize: 14, color: '#777' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  gridItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { color: '#1a73e8', fontWeight: '600' },
  classCard: { flexDirection: 'row', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 10 },
  classTime: { width: 80, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 13, fontWeight: 'bold', color: '#1a73e8' },
  verticalLine: { width: 2, height: 20, backgroundColor: '#1a73e8', marginTop: 5 },
  classInfo: { flex: 1, marginLeft: 10 },
  subjectText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  teacherText: { fontSize: 13, color: '#777' },
  tnpSection: { marginTop: 20 },
  companyCard: { backgroundColor: '#1a73e8', padding: 18, borderRadius: 15, marginTop: 10 },
  companyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  lpaBadge: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: 'bold' },
  criteriaText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8 },
  emptyText: { color: '#999', fontStyle: 'italic', marginBottom: 20 }
});