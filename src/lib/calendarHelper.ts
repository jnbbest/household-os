/**
 * Helper to generate Google Calendar URLs and downloadable .ics files
 * for the 15-Minute Weekly Sunday Reset
 */

export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent("15-Min Household OS Reset");
  const details = encodeURIComponent(
    "Weekly Household Alignment Ritual:\n" +
    "1. Chores review & upcoming travel\n" +
    "2. Domestic staff ledger & salary check\n" +
    "3. Bills autodebit verification\n" +
    "4. Weekly AI meal plan & grocery briefing\n\n" +
    "App: Open your Household OS on mobile"
  );
  const location = encodeURIComponent("Living Room / Kitchen Coffee");
  
  // Format dates: Next Sunday 09:00 AM - 09:15 AM
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(9, 0, 0, 0);

  const endSunday = new Date(nextSunday);
  endSunday.setMinutes(nextSunday.getMinutes() + 15);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const dates = `${formatGCalDate(nextSunday)}/${formatGCalDate(endSunday)}`;
  const rrule = encodeURIComponent("RRULE:FREQ=WEEKLY;BYDAY=SU");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&recur=${rrule}`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GrowthX//Household OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "SUMMARY:15-Min Household OS Reset",
    "DESCRIPTION:Weekly alignment: Chores review, staff ledger, bills autodebit, and meal planning.",
    "LOCATION:Living Room",
    "RRULE:FREQ=WEEKLY;BYDAY=SU",
    "DTSTART:20261004T033000Z", // 9:00 AM IST in UTC is 03:30 AM UTC
    "DTEND:20261004T034500Z",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", "household-os-sunday-reset.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
