import { format } from "date-fns";

interface ICSEvent {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  durationMinutes: number;
}

function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

export function generateICSFile(event: ICSEvent): string {
  const endDate = new Date(event.startDate.getTime() + event.durationMinutes * 60000);
  
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ResumeAI//Interview Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    ...(event.location ? [`LOCATION:${event.location}`] : []),
    `UID:${crypto.randomUUID()}@resumeai`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Interview in 1 hour",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Interview tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return ics;
}

export function downloadICS(event: ICSEvent, filename: string) {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}
