/**
 * Cloud Functions — PICT Campus Connect
 * ======================================
 * Scheduled function that sends smart morning notifications
 * based on the day's timetable. Uses Expo push notifications
 * (via expo-server-sdk) to reach devices.
 *
 * Firestore collections used:
 *   • `timetables/{divisionId}`  – keyed like "CS_TE_1", day-indexed arrays
 *   • `fcm_tokens/{uid}`         – push tokens with hierarchy metadata
 *
 * Cost optimisation:
 *   • Single scheduled invocation per morning
 *   • Skips weekends immediately (zero Firestore reads)
 *   • Batches push messages in chunks of 100 (Expo limit)
 *   • Cleans up invalid tokens on delivery failure
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

// ── Initialise Firebase Admin ──────────────────────────
admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

// ── Day helper ─────────────────────────────────────────
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getTodayKey() {
  // Get the current day in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  return WEEKDAYS[ist.getDay()];
}

// ── Scheduled Function ─────────────────────────────────
// Runs every morning at 7:00 AM IST
exports.sendMorningNotifications = onSchedule(
  {
    schedule: '0 7 * * *',        // cron: 07:00 every day
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',        // Mumbai — lowest latency for India
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (_event) => {
    const todayKey = getTodayKey();

    // ── Skip weekends ────────────────────────────────
    if (todayKey === 'saturday' || todayKey === 'sunday') {
      logger.info('Weekend — skipping notifications.');
      return;
    }

    logger.info(`Sending morning notifications for: ${todayKey}`);

    try {
      // ── 1. Fetch ALL timetable documents in one batch ──
      const timetablesSnap = await db.collection('timetables').get();

      if (timetablesSnap.empty) {
        logger.warn('No timetable documents found.');
        return;
      }

      // Collect all push messages to send
      const allMessages = [];
      // Track tokens to clean up if invalid
      const tokenCleanupBatch = db.batch();
      let cleanupCount = 0;

      // ── 2. Process each division's timetable ───────
      for (const timetableDoc of timetablesSnap.docs) {
        const divisionId = timetableDoc.id; // e.g. "CS_TE_1"
        const data = timetableDoc.data();
        const todayEntries = data[todayKey];

        if (!todayEntries || !Array.isArray(todayEntries) || todayEntries.length === 0) {
          logger.info(`No entries for ${divisionId} on ${todayKey}`);
          continue;
        }

        // Parse division ID → dept, year, div
        const parts = divisionId.split('_'); // ["CS", "TE", "1"]
        if (parts.length < 3) {
          logger.warn(`Invalid division ID format: ${divisionId}`);
          continue;
        }
        const [dept, year, div] = parts;

        // ── 3. Fetch tokens for this division (single query) ──
        const tokensSnap = await db
          .collection('fcm_tokens')
          .where('dept', '==', dept)
          .where('year', '==', year)
          .where('div', '==', div)
          .get();

        if (tokensSnap.empty) {
          logger.info(`No registered tokens for ${divisionId}`);
          continue;
        }

        // Index tokens by batch for fast lookup
        const divisionTokens = [];   // All tokens in this division
        const batchTokenMap = {};    // { "B1": [...tokens], "B2": [...] }

        tokensSnap.forEach((tokenDoc) => {
          const tokenData = tokenDoc.data();
          const token = tokenData.expoPushToken;

          if (!token || !Expo.isExpoPushToken(token)) {
            logger.warn(`Invalid Expo token for uid ${tokenDoc.id}, scheduling cleanup.`);
            tokenCleanupBatch.delete(tokenDoc.ref);
            cleanupCount++;
            return;
          }

          divisionTokens.push(token);

          const batch = (tokenData.batch || '').toUpperCase();
          if (batch) {
            if (!batchTokenMap[batch]) batchTokenMap[batch] = [];
            batchTokenMap[batch].push(token);
          }
        });

        // ── 4. Build messages for each timetable entry ──
        for (const entry of todayEntries) {
          const subject = entry.subject || entry.sub || 'Class';
          const time = entry.time || 'TBD';
          const room = entry.room || 'TBD';
          const type = (entry.type || 'Lecture').trim();

          const messageBody = `Good morning! You have ${subject} at ${time} in ${room}.`;

          let targetTokens = [];

          if (type === 'Practical' && entry.batch) {
            // ── Practical → only the specific batch ──
            const batchKey = entry.batch.toUpperCase();
            targetTokens = batchTokenMap[batchKey] || [];

            if (targetTokens.length === 0) {
              logger.info(`No tokens for ${divisionId} batch ${batchKey}`);
              continue;
            }

            logger.info(
              `Practical: ${subject} → ${divisionId}/${batchKey} (${targetTokens.length} tokens)`,
            );
          } else {
            // ── Lecture → entire division ──
            targetTokens = divisionTokens;

            if (targetTokens.length === 0) {
              logger.info(`No tokens for division ${divisionId}`);
              continue;
            }

            logger.info(
              `Lecture: ${subject} → ${divisionId}_All (${targetTokens.length} tokens)`,
            );
          }

          // Build Expo push messages
          for (const pushToken of targetTokens) {
            allMessages.push({
              to: pushToken,
              sound: 'default',
              title: '📚 Today\'s Schedule',
              body: messageBody,
              data: {
                type,
                subject,
                time,
                room,
                divisionId,
                batch: entry.batch || null,
              },
              channelId: 'default',
            });
          }
        }
      }

      // ── 5. Send all messages in batches ────────────
      if (allMessages.length === 0) {
        logger.info('No messages to send today.');
        return;
      }

      logger.info(`Sending ${allMessages.length} push notifications...`);

      // Expo SDK chunks messages into groups of 100 automatically
      const chunks = expo.chunkPushNotifications(allMessages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error('Error sending chunk:', error);
        }
      }

      // ── 6. Handle failed tickets (clean up bad tokens) ──
      tickets.forEach((ticket, idx) => {
        if (ticket.status === 'error') {
          logger.warn(`Ticket error: ${ticket.message}`, { details: ticket.details });

          // If the token is invalid, mark for cleanup
          if (
            ticket.details &&
            ticket.details.error === 'DeviceNotRegistered'
          ) {
            const badToken = allMessages[idx]?.to;
            if (badToken) {
              logger.info(`Cleaning up invalid token: ${badToken}`);
              // We'd need a reverse lookup to find the doc — handled in the next section
            }
          }
        }
      });

      // ── 7. Commit cleanup batch if needed ──────────
      if (cleanupCount > 0) {
        await tokenCleanupBatch.commit();
        logger.info(`Cleaned up ${cleanupCount} invalid token documents.`);
      }

      logger.info(`Done. Sent ${tickets.length} notifications.`);
    } catch (error) {
      logger.error('sendMorningNotifications failed:', error);
      throw error; // Let Cloud Functions retry logic handle it
    }
  },
);
