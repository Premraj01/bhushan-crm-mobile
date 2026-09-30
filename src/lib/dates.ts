/** The clinic works in Pune time, whatever the phone's timezone (matches the web app). */
export const CLINIC_TZ = "Asia/Kolkata";

/** Today's clinic calendar day as YYYY-MM-DD. */
export function clinicToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TZ }).format(new Date());
}

/** "10:30" and "AM" for an ISO instant, in clinic time. */
export function clinicTime(iso: string): { time: string; period: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { time: `${get("hour")}:${get("minute")}`, period: get("dayPeriod").toUpperCase() };
}

/** "Good morning" / "Good afternoon" / "Good evening" in clinic time. */
export function greetingFor(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: CLINIC_TZ, hour: "numeric", hour12: false }).format(now),
  );
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/** "Wednesday, 30 September" for a YYYY-MM-DD day. */
export function longDate(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "12 Sep 2026" for a YYYY-MM-DD day. */
export function shortDate(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
