/** Calendar parts in Asia/Kathmandu (Nepal). */
function kathmanduParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: parseInt(get("hour"), 10),
    mmdd: `${get("month")}-${get("day")}`,
  };
}

const NEPAL_SPECIAL: Record<string, string> = {
  "01-11": "Prithvi Jayanti — honouring the unifier of Nepal.",
  "01-15": "Maghe Sankranti — warm wishes from the hills.",
  "02-18": "Martyrs' Day — remembering those who shaped Nepal.",
  "03-08": "International Women's Day — celebrated with pride in Nepal and worldwide.",
  "04-14": "Nepali New Year season — Naya Barṣa ko shubhakamana.",
  "05-28": "Republic Day of Nepal.",
  "09-20": "Constitution Day & National Day of Nepal.",
};

const INTERNATIONAL_SPECIAL: Record<string, string> = {
  "01-01": "Happy New Year!",
  "02-14": "Valentine's Day — here's to meaningful connections.",
  "04-22": "Earth Day — small sustainable choices add up.",
  "05-01": "International Workers' Day.",
  "06-05": "World Environment Day.",
  "10-24": "United Nations Day.",
  "10-31": "Halloween — may your deploys stay treat, not trick.",
  "12-25": "Merry Christmas!",
  "12-31": "New Year's Eve — finish the year strong.",
};

function timeGreetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

export type AdminGreeting = {
  timeGreeting: string;
  /** Nepal + international notes for today (Kathmandu calendar), deduped when same copy. */
  specialLines: string[];
  kathmanduLabel: string;
};

export function getAdminGreeting(now: Date = new Date()): AdminGreeting {
  const { hour, mmdd } = kathmanduParts(now);
  const timeGreeting = timeGreetingForHour(hour);

  const nepal = NEPAL_SPECIAL[mmdd];
  const intl = INTERNATIONAL_SPECIAL[mmdd];
  const lines: string[] = [];
  if (nepal) lines.push(nepal);
  if (intl && intl !== nepal) lines.push(intl);

  const kathmanduLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return {
    timeGreeting,
    specialLines: lines,
    kathmanduLabel,
  };
}
