import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { db } from '../api/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TnpScreen() {
  const [tab, setTab] = useState('Today'); // Today, Upcoming, Visited
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mapping our UI tabs to your Firestore 'status' field
    const statusMap = { 'Today': 'today', 'Upcoming': 'upcoming', 'Visited': 'visited' };
    
    const q = query(
      collection(db, "placement_drives"), 
      where("status", "==", statusMap[tab])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrives(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tab]);

  const renderDriveCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.companyName}>{item.companyName}</Text>
        <Text style={styles.lpa}>{item.lpa} LPA</Text>
      </View>
      
      <Text style={styles.details}>Criteria: {item.criteria}</Text>
      
      {tab === 'Today' && (
        <View style={styles.todayInfo}>
          <Text style={styles.infoText}>📍 Venue: {item.venue}</Text>
          <Text style={styles.infoText}>🕒 Time: {item.reportingTime}</Text>
        </View>
      )}

      {tab === 'Upcoming' && (
        <TouchableOpacity 
          style={styles.regButton} 
          onPress={() => Linking.openURL(item.regLink)}
        >
          <Text style={styles.regButtonText}>Register Now</Text>
        </TouchableOpacity>
      )}

      {tab === 'Visited' && (
        <Text style={styles.hiredText}>Total Hired: {item.totalHired}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['Today', 'Upcoming', 'Visited'].map((t) => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tab, tab === t && styles.activeTab]} 
            onPress={() => {setLoading(true); setTab(t);}}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={drives}
          keyExtractor={(item) => item.id}
          renderItem={renderDriveCard}
          ListEmptyComponent={<Text style={styles.empty}>No drives currently in this category.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginBottom: 20, elevation: 2 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#1a73e8' },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#1a73e8' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  lpa: { fontSize: 16, color: '#28a745', fontWeight: '700' },
  details: { color: '#666', marginBottom: 10 },
  todayInfo: { backgroundColor: '#e8f0fe', padding: 10, borderRadius: 8 },
  infoText: { fontSize: 13, color: '#1a73e8', marginBottom: 2 },
  regButton: { backgroundColor: '#1a73e8', padding: 12, borderRadius: 8, alignItems: 'center' },
  regButtonText: { color: '#fff', fontWeight: 'bold' },
  hiredText: { fontWeight: 'bold', color: '#dc3545' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});