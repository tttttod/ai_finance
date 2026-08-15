/**
 * Market data refresh policy.
 *
 * Defines trading hours and auto-refresh intervals for A-share market.
 */

// A-share trading hours (Beijing time, UTC+8)
// Morning session: 9:30 - 11:30
// Afternoon session: 13:00 - 15:00

const TRADING_HOURS = [
  { start: { hour: 9, minute: 30 }, end: { hour: 11, minute: 30 } },
  { start: { hour: 13, minute: 0 }, end: { hour: 15, minute: 0 } },
];

// Auto-refresh interval during trading hours (30 minutes)
export const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

// Check if current time is within trading hours
export function isTradingTime(date: Date = new Date()): boolean {
  // Convert to Beijing time (UTC+8)
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const hours = beijingTime.getUTCHours();
  const minutes = beijingTime.getUTCMinutes();
  const currentMinutes = hours * 60 + minutes;

  return TRADING_HOURS.some((session) => {
    const startMinutes = session.start.hour * 60 + session.start.minute;
    const endMinutes = session.end.hour * 60 + session.end.minute;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  });
}

// Check if snapshot is stale (older than refresh interval)
export function isSnapshotStale(fetchedAt: string | undefined): boolean {
  if (!fetchedAt) return true;
  const fetched = new Date(fetchedAt).getTime();
  const now = Date.now();
  return now - fetched > REFRESH_INTERVAL_MS;
}

// Get next refresh time (end of current trading session or next session start)
export function getNextRefreshTime(date: Date = new Date()): Date {
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const hours = beijingTime.getUTCHours();
  const minutes = beijingTime.getUTCMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Find current or next trading session
  for (const session of TRADING_HOURS) {
    const startMinutes = session.start.hour * 60 + session.start.minute;
    const endMinutes = session.end.hour * 60 + session.end.minute;

    if (currentMinutes < startMinutes) {
      // Before this session, refresh at session start
      const nextTime = new Date(beijingTime);
      nextTime.setUTCHours(session.start.hour, session.start.minute, 0, 0);
      return new Date(nextTime.getTime() - 8 * 60 * 60 * 1000);
    }

    if (currentMinutes < endMinutes) {
      // Within this session, refresh at session end
      const nextTime = new Date(beijingTime);
      nextTime.setUTCHours(session.end.hour, session.end.minute, 0, 0);
      return new Date(nextTime.getTime() - 8 * 60 * 60 * 1000);
    }
  }

  // After all sessions, refresh at next day's morning session start
  const nextDay = new Date(beijingTime);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  nextDay.setUTCHours(9, 30, 0, 0);
  return new Date(nextDay.getTime() - 8 * 60 * 60 * 1000);
}
