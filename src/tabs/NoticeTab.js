import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../api/firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function NoticeScreen() {
  const [activeTab, setActiveTab] = useState('academics'); // academics, holidays, general
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read all notices in one listener and filter/sort client-side to avoid composite index requirements.
    const unsubscribe = onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setNotices(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredNotices = notices
    .filter((item) => (item.type || item.category || '').toLowerCase() === activeTab)
    .sort((a, b) => {
      const aTime = typeof a.timestamp?.toMillis === 'function' ? a.timestamp.toMillis() : 0;
      const bTime = typeof b.timestamp?.toMillis === 'function' ? b.timestamp.toMillis() : 0;
      return bTime - aTime;
    });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high': return { borderLeftColor: '#dc3545', bg: '#fff5f5' }; // Red
      case 'medium': return { borderLeftColor: '#ffc107', bg: '#fffdf5' }; // Yellow
      case 'low': return { borderLeftColor: '#1a73e8', bg: '#f5f9ff' }; // Blue
      default: return { borderLeftColor: '#ddd', bg: '#fff' };
    }
  };

  const renderNotice = ({ item }) => {
    const style = getSeverityStyle(item.severity);
    return (
      <View style={[styles.card, { borderLeftColor: style.borderLeftColor, backgroundColor: style.bg }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          {item.severity === 'high' && (
            <Ionicons name="alert-circle" size={20} color="#dc3545" />
          )}
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>
          {item.timestamp?.toDate().toLocaleDateString() || 'Recently'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        {['academics', 'holidays', 'general'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => { setLoading(true); setActiveTab(tab); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredNotices}
          keyExtractor={(item) => item.id}
          renderItem={renderNotice}
          ListEmptyComponent={<Text style={styles.empty}>No notices in this category.</Text>}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#1a73e8' },
  tabText: { fontWeight: '600', color: '#888', textTransform: 'capitalize' },
  activeTabText: { color: '#1a73e8' },
  card: { 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 12, 
    borderLeftWidth: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },
  date: { fontSize: 11, color: '#999', marginTop: 10, textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});