import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: Platform.select({
    ios: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID,
    default: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID,
  }),

  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId: Platform.select({
    ios: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS,
    android: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID,
    default: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID,
  }),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;