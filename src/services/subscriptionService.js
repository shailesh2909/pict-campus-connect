/**
 * subscriptionService.js
 * ----------------------
 * Manages FCM token storage and topic metadata in Firestore.
 *
 * Instead of client-side FCM topic subscriptions (not available in Expo),
 * we store the push token alongside the user's hierarchy metadata
 * (dept, year, div, batch) in a `fcm_tokens` collection.
 *
 * The Cloud Function queries this collection to find matching tokens
 * when sending targeted notifications — identical behaviour to FCM topics
 * but fully compatible with Expo.
 *
 * Effective topic equivalents stored in the `topics` array:
 *   • {Dept}_{Year}_{Div}_All    – Division-wide (lectures + general notices)
 *   • {Dept}_{Year}_{Div}_{Batch} – Batch-specific (labs/practicals)
 *   • Global_Announcements        – College-wide news
 */

import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebaseConfig';
import { registerForPushNotificationsAsync } from './notificationService';

// ── Helpers ────────────────────────────────────────────

/**
 * Parse the `class` field (e.g. "TE-1") into a division string.
 * Falls back to "1" if the format is unexpected.
 */
function parseDivision(classField) {
  const raw = String(classField || '').trim();
  if (raw.includes('-')) {
    return raw.split('-')[1];
  }
  return '1';
}

/**
 * Build the three topic strings for a given user profile.
 *
 * @param {Object} userData – Firestore user document data
 * @returns {{ divisionTopic: string, batchTopic: string, globalTopic: string, div: string }}
 */
function buildTopics(userData) {
  const dept  = String(userData.dept  || 'CS').trim().toUpperCase();
  const year  = String(userData.year  || 'TE').trim().toUpperCase();
  const div   = parseDivision(userData.class);
  const batch = String(userData.batch || 'B1').trim().toUpperCase();

  return {
    divisionTopic: `${dept}_${year}_${div}_All`,   // e.g. CS_TE_1_All
    batchTopic:    `${dept}_${year}_${div}_${batch}`, // e.g. CS_TE_1_B3
    globalTopic:   'Global_Announcements',
    div,
  };
}

// ── Public API ─────────────────────────────────────────

/**
 * Register the device's push token and subscribe to notification topics.
 *
 * Call this after the user has logged in and their Firestore profile
 * has been fetched.
 *
 * @param {Object} userData – The user's Firestore profile document data.
 *   Required fields: dept, year, class (e.g. "TE-1"), batch (e.g. "B1")
 * @returns {Promise<boolean>} – true if registration succeeded
 */
export async function subscribeToTopics(userData) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('[Subscription] No authenticated user.');
      return false;
    }

    // 1. Get the Expo push token
    const expoPushToken = await registerForPushNotificationsAsync();
    if (!expoPushToken) {
      console.warn('[Subscription] Could not obtain push token.');
      return false;
    }

    // 2. Build topic metadata
    const { divisionTopic, batchTopic, globalTopic, div } = buildTopics(userData);

    const dept  = String(userData.dept  || 'CS').trim().toUpperCase();
    const year  = String(userData.year  || 'TE').trim().toUpperCase();
    const batch = String(userData.batch || 'B1').trim().toUpperCase();

    // 3. Write to Firestore  →  fcm_tokens/{uid}
    await setDoc(doc(db, 'fcm_tokens', user.uid), {
      expoPushToken,
      uid: user.uid,
      dept,
      year,
      div,
      batch,
      topics: [divisionTopic, batchTopic, globalTopic],
      updatedAt: serverTimestamp(),
    });

    console.log('[Subscription] Registered topics:', [divisionTopic, batchTopic, globalTopic]);
    return true;
  } catch (error) {
    console.error('[Subscription] Failed to subscribe:', error);
    return false;
  }
}

/**
 * Unsubscribe from all notification topics by removing the token document.
 *
 * Call this on logout or when the user changes their profile
 * (then re-subscribe with the updated data).
 *
 * @returns {Promise<boolean>} – true if cleanup succeeded
 */
export async function unsubscribeFromTopics() {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    await deleteDoc(doc(db, 'fcm_tokens', user.uid));
    console.log('[Subscription] Unsubscribed — token document deleted.');
    return true;
  } catch (error) {
    console.error('[Subscription] Failed to unsubscribe:', error);
    return false;
  }
}
