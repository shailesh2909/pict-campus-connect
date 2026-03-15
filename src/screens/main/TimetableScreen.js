import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../../api/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { loadFromCache, saveToCache } from '../../utils/cache';

const { width } = Dimensions.get('window');

const weekdayTabs = [
  { key: 'monday', short: 'Mon', date: '01' },
  { key: 'tuesday', short: 'Tue', date: '02' },
  { key: 'wednesday', short: 'Wed', date: '03' },
  { key: 'thursday', short: 'Thu', date: '04' },
  { key: 'friday', short: 'Fri', date: '05' },
];

export default function TimetableScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [timetable, setTimetable] = useState({});
  const [hasCachedData, setHasCachedData] = useState(false);

  // 1. Logic Helpers
  const getTodayKey = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayKey = useMemo(() => getTodayKey(), []);
  const isWeekend = todayKey === 'saturday' || todayKey === 'sunday';

  const buildClassKey = (userData) => {
    const dept = String(userData?.dept || 'CS').trim().toUpperCase();
    const year = String(userData?.year || 'TE').trim().toUpperCase();
    const rawClass = String(userData?.class || '').trim();
    let division = '1';
    if (rawClass && rawClass.includes('-')) {
      division = rawClass.split('-')[1];
    }
    return `${dept}_${year}_${division}`;
  };

  useEffect(() => {
    const initialDay = weekdayTabs.some((d) => d.key === todayKey) ? todayKey : 'monday';
    setSelectedDay(initialDay);

    const fetchTimetable = async () => {
      let cachedTimetable = null;
      try {
        const user = auth.currentUser;
        if (!user?.uid) {
          setError('User session not found. Please log in again.');
          setLoading(false);
          return;
        }

        const cacheKey = `timetable_${user.uid}`;
        const cachedPayload = await loadFromCache(cacheKey);
        if (cachedPayload?.timetable && typeof cachedPayload.timetable === 'object') {
          cachedTimetable = cachedPayload.timetable;
          setTimetable(cachedTimetable);
          setHasCachedData(Object.keys(cachedTimetable).length > 0);
          setLoading(false);
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const classKey = buildClassKey(userDoc.data());
          const timetableDoc = await getDoc(doc(db, 'timetables', classKey));
          if (timetableDoc.exists()) {
            const freshTimetable = timetableDoc.data();
            const cachedString = JSON.stringify(cachedTimetable || {});
            const freshString = JSON.stringify(freshTimetable || {});

            if (freshString !== cachedString) {
              setTimetable(freshTimetable);
              await saveToCache(cacheKey, {
                timetable: freshTimetable,
                classKey,
                updatedAt: Date.now(),
              });
            }
            setHasCachedData(Object.keys(freshTimetable || {}).length > 0);
          } else {
            if (!cachedTimetable) {
              setError(`Schedule not found for ${classKey}`);
            }
          }
        } else if (!cachedTimetable) {
          setError('User profile not found.');
        }
      } catch (e) {
        if (!cachedTimetable) {
          setError('Error loading schedule');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [todayKey]);

  const lectures = useMemo(() => {
    const dayData = timetable?.[selectedDay] || [];
    return dayData.map(item => ({
      subject: item?.subject || item?.sub || 'Lecture',
      time: item?.time || 'TBD',
      room: item?.room || 'TBD',
      teacher: item?.teacher || 'Faculty',
    }));
  }, [timetable, selectedDay]);

  const shouldShowBlockingLoader = loading && !hasCachedData && Object.keys(timetable || {}).length === 0;

  if (shouldShowBlockingLoader) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* --- HEADER --- */}
      <View className="bg-blue-600 px-6 pb-14 pt-4 rounded-b-[45px] shadow-2xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-white">Schedule</Text>
            <Text className="text-blue-100 font-medium opacity-90">PICT Campus Connect</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <Ionicons name="calendar-clear" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* --- FLOATING DAY SELECTOR --- */}
      <View className="mx-6 -mt-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
          {weekdayTabs.map((day) => {
            const isActive = day.key === selectedDay;
            return (
              <Pressable
                key={day.key}
                onPress={() => setSelectedDay(day.key)}
                className={`mr-3 items-center justify-center rounded-3xl px-6 py-4 shadow-sm ${
                  isActive ? 'bg-blue-600 shadow-blue-400' : 'bg-white'
                }`}
                style={{ elevation: isActive ? 8 : 2 }}
              >
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {day.short}
                </Text>
                <Text className={`text-xl font-black mt-1 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {day.date}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* --- TIMELINE CONTENT --- */}
      <ScrollView 
        className="flex-1 mt-4" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && hasCachedData ? (
          <View className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <Text className="text-xs font-semibold text-blue-700">Refreshing latest timetable...</Text>
          </View>
        ) : null}

        {isWeekend ? (
          <View className="items-center mt-10 p-10 bg-white rounded-[40px] shadow-sm border border-slate-50">
             <View className="bg-blue-50 p-6 rounded-full mb-6">
                <Ionicons name="cafe" size={50} color="#2563eb" />
             </View>
             <Text className="text-2xl font-black text-slate-800">Weekend Mode</Text>
             <Text className="text-center text-slate-500 mt-2 leading-5">No lectures scheduled. Go explore Pune or catch up on sleep!</Text>
          </View>
        ) : lectures.length === 0 ? (
          <View className="items-center mt-10">
            <Text className="text-slate-400 font-medium">No classes for {selectedDay}</Text>
          </View>
        ) : (
          lectures.map((lecture, index) => (
            <View key={index} className="flex-row mb-2">
              {/* Left Timeline Rail */}
              <View className="items-center mr-4 w-6">
                <View className={`h-4 w-4 rounded-full border-4 border-white z-10 ${index === 0 ? 'bg-blue-600' : 'bg-blue-200'}`} />
                {index < lectures.length - 1 && <View className="w-[2px] flex-1 bg-blue-100 -my-1" />}
              </View>

              {/* Lecture Card */}
              <View className="flex-1 bg-white mb-6 p-5 rounded-[30px] shadow-sm shadow-slate-200 border border-slate-50">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-black text-slate-800 tracking-tight">{lecture.subject}</Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time" size={14} color="#3b82f6" />
                      <Text className="ml-1 text-xs font-bold text-blue-600">{lecture.time}</Text>
                    </View>
                  </View>
                  <View className="bg-slate-50 px-3 py-2 rounded-2xl">
                    <Text className="text-[10px] font-black text-slate-500 uppercase">{lecture.room}</Text>
                  </View>
                </View>

                <View className="h-[1px] bg-slate-50 my-4" />

                <View className="flex-row items-center justify-between">
                   <View className="flex-row items-center">
                      <View className="h-7 w-7 bg-blue-50 rounded-full items-center justify-center">
                        <Ionicons name="person" size={12} color="#2563eb" />
                      </View>
                      <Text className="ml-2 text-xs font-semibold text-slate-500">{lecture.teacher}</Text>
                   </View>
                   <Pressable className="bg-blue-50 p-2 rounded-xl">
                      <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                   </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}