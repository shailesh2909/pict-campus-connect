import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Linking,
    Pressable,
    RefreshControl,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Added for better text readability
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const filters = ['All', 'Technical', 'Non-Tech', 'Workshops'];
const fallbackImage = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80';

export default function EventScreen() {
    const [events, setEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [interestedMap, setInterestedMap] = useState({});

    const fetchEvents = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const snapshot = await getDocs(collection(db, 'events'));
            const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(parsed);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const filteredEvents = useMemo(() => {
        if (activeFilter === 'All') return events;
        return events.filter(e => e.category === activeFilter);
    }, [events, activeFilter]);

    const renderEventCard = (item, hero = false) => {
        const interested = Boolean(interestedMap[item.id]);

        return (
            <Pressable className={`mb-6 overflow-hidden rounded-[35px] shadow-xl shadow-slate-300 bg-white`}>
                <ImageBackground
                    source={{ uri: item.image || fallbackImage }}
                    style={{ height: hero ? 320 : 240 }}
                    imageStyle={{ borderRadius: 35 }}
                >
                    {/* Dark overlay for readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0 rounded-[35px]"
                    />

                    <View className="flex-1 justify-between p-5">
                        {/* Top Row: Category & Interested */}
                        <View className="flex-row justify-between items-start">
                            <View className="bg-blue-600/90 px-4 py-1.5 rounded-full border border-blue-400/30">
                                <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                                    {item.category || 'General'}
                                </Text>
                            </View>
                            <Pressable 
                                onPress={() => setInterestedMap(p => ({ ...p, [item.id]: !p[item.id] }))}
                                className="bg-white/20 p-2.5 rounded-full border border-white/30"
                            >
                                <Ionicons name={interested ? "heart" : "heart-outline"} size={20} color={interested ? "#fb7185" : "white"} />
                            </Pressable>
                        </View>

                        {/* Bottom Row: Info */}
                        <View>
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="calendar" size={12} color="#94a3b8" />
                                <Text className="ml-1 text-xs font-bold text-slate-300 uppercase tracking-tighter">
                                    {item.date} • {item.organizer}
                                </Text>
                            </View>
                            <Text className="text-2xl font-black text-white tracking-tight leading-7">
                                {item.title}
                            </Text>
                            
                            <View className="flex-row items-center justify-between mt-4">
                                <Text className="flex-1 text-xs text-slate-300 mr-4" numberOfLines={2}>
                                    {item.description}
                                </Text>
                                <Pressable 
                                    onPress={() => Linking.openURL(item.regLink || '#')}
                                    className="bg-white px-5 py-2.5 rounded-2xl shadow-sm"
                                >
                                    <Text className="text-xs font-black text-blue-900">Get Tickets</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Pressable>
        );
    };

    if (loading) return (
        <View className="flex-1 items-center justify-center bg-slate-50">
            <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Minimalist Header */}
            <View className="px-6 py-4 flex-row justify-between items-end">
                <View>
                    <Text className="text-xs font-black text-blue-600 uppercase tracking-[3px]">Discover</Text>
                    <Text className="text-3xl font-black text-slate-900 mt-1">Events</Text>
                </View>
                <Pressable className="bg-slate-200/50 p-2.5 rounded-full">
                    <Ionicons name="search" size={20} color="#1e293b" />
                </Pressable>
            </View>

            {/* Premium Filter Chips */}
            <View className="py-2">
                <FlatList
                    horizontal
                    data={filters}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => setActiveFilter(item)}
                            className={`mr-3 px-6 py-3 rounded-2xl ${activeFilter === item ? 'bg-slate-900 shadow-lg shadow-slate-400' : 'bg-white border border-slate-100'}`}
                        >
                            <Text className={`text-xs font-bold ${activeFilter === item ? 'text-white' : 'text-slate-500'}`}>
                                {item}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>

            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchEvents(true)} />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
                ListHeaderComponent={() => (
                    filteredEvents.length > 0 ? (
                        <Text className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Upcoming Highlights
                        </Text>
                    ) : null
                )}
                renderItem={({ item, index }) => renderEventCard(item, index === 0)}
                ListEmptyComponent={() => (
                    <View className="mt-20 items-center">
                        <Ionicons name="sparkles-outline" size={40} color="#cbd5e1" />
                        <Text className="mt-4 text-slate-400 font-bold">No events matching this category</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}