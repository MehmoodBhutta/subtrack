// Mirrors lib/services/notifications_service.dart
// Schedules a local reminder 2 days before a subscription renews. Uses a
// trigger relative to "now + offset" so we never need the exact-alarm
// permission. Failures are swallowed so a denied permission can never block
// a save.
import * as Notifications from 'expo-notifications';
import { formatDate } from '../utils/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let channelSet = false;
async function ensureChannel() {
  if (channelSet) return;
  await Notifications.setNotificationChannelAsync('renewals', {
    name: 'Renewal reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
  channelSet = true;
}

export async function initNotifications() {
  await ensureChannel();
}

export async function requestPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (e) {
    // ignore
  }
}

const REMIND_OFFSET_DAYS = 2;

// Stable numeric id from a uuid string (32-bit positive, like the Dart impl).
function idFor(subId) {
  let h = 0;
  for (let i = 0; i < subId.length; i++) {
    h = (h * 31 + subId.charCodeAt(i)) | 0;
  }
  return (h & 0x7fffffff) >>> 0;
}

export async function scheduleFor(sub) {
  try {
    await ensureChannel();
    const renew = new Date(sub.nextRenewalDate);
    const when = new Date(renew.getTime() - REMIND_OFFSET_DAYS * 86400000);
    const now = Date.now();
    if (when.getTime() <= now) return; // already past, skip
    const secondsFromNow = Math.max(1, Math.round((when.getTime() - now) / 1000));

    await Notifications.scheduleNotificationAsync({
      identifier: String(idFor(sub.id)),
      content: {
        title: `Renewal soon: ${sub.name}`,
        body: `${sub.name} renews on ${formatDate(renew)}.`,
      },
      trigger: { type: 'timeInterval', seconds: secondsFromNow, repeats: false },
    });
  } catch (e) {
    // permission denied or scheduling unavailable — never block the save
  }
}

export async function cancelFor(subId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(String(idFor(subId)));
  } catch (e) {
    // ignore
  }
}

export async function cancelAll() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // ignore
  }
}
