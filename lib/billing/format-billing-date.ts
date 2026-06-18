import { parisCalendarIsoDate } from "@/lib/dates/timezone";
import { formatParisCalendarDate } from "@/lib/format/datetime";

export function formatBillingDateLabel(isoDate: string): string {
  const calendarDate = isoDate.includes("T")
    ? parisCalendarIsoDate(new Date(isoDate))
    : isoDate.slice(0, 10);

  return formatParisCalendarDate(calendarDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
