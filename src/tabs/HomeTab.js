import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth, db } from '../api/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import StudentHomeTab from './StudentHomeTab';
import FacultyHomeTab from './Facultyhometab';

export default function HomeTab({ navigation }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) { setLoading(false); return; }
        const snap = await getDoc(doc(db, 'users', uid));
        setRole(snap.data()?.role || 'student');
      } catch (e) {
        console.error('HomeTab role fetch error:', e);
        setRole('student');
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3D6EE8" />
      </View>
    );
  }

  return role === 'faculty'
    ? <FacultyHomeTab navigation={navigation} />
    : <StudentHomeTab navigation={navigation} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});




// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { auth, db } from '../api/firebase/firebaseConfig';
// import { doc, getDoc } from 'firebase/firestore';
// import StudentHomeTab from './StudentHomeTab';
// import FacultyHomeTab from './Facultyhometab';

// const DEV_FORCE_FACULTY = true;


// export default function HomeTab({ navigation }) {
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Skip Firebase fetch when dev flag is on
//     if (DEV_FORCE_FACULTY) { setLoading(false); return; }

//     const fetchRole = async () => {
//       try {
//         const uid = auth.currentUser?.uid;
//         if (!uid) { setLoading(false); return; }
//         const snap = await getDoc(doc(db, 'users', uid));
//         setRole(snap.data()?.role || 'student');
//       } catch (e) {
//         console.error('HomeTab role fetch error:', e);
//         setRole('student');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRole();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#3D6EE8" />
//       </View>
//     );
//   }

//   // DEV: force faculty view when flag is true
//   if (DEV_FORCE_FACULTY) {
//     return <FacultyHomeTab navigation={navigation} />;
//   }

//   return role === 'faculty'
//     ? <FacultyHomeTab navigation={navigation} />
//     : <StudentHomeTab navigation={navigation} />;
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
// });