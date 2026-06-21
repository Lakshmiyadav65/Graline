// Indian rupee + IST date formatters. Money is always Int paise in DB.

const IST_OFFSET_MIN = 330;

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const rupeeWithPaiseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format integer paise as Indian-formatted rupees.
 * formatRupees(5200) → "₹52"
 * formatRupees(109000) → "₹1,090"
 * formatRupees(5050, { showPaise: true }) → "₹50.50"
 */
export function formatRupees(
  paise: number,
  opts: { showPaise?: boolean } = {}
): string {
  const rupees = paise / 100;
  if (opts.showPaise) {
    return rupeeWithPaiseFormatter.format(rupees);
  }
  return rupeeFormatter.format(Math.round(rupees));
}

/**
 * Format kilograms.
 * formatKg(10) → "10 kg"
 * formatKg(0.25) → "250 g"
 */
export function formatKg(kg: number): string {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  if (Number.isInteger(kg)) return `${kg} kg`;
  return `${kg.toFixed(1)} kg`;
}

const istDateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const istDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** formatDate(d) → "Sat, 9 May 2026" (always IST) */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return istDateFormatter.format(d);
}

/** formatDateTime(d) → "Sat, 9 May 2026, 12:30 pm" (always IST) */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return istDateTimeFormatter.format(d);
}

/**
 * Get the upcoming Grainline delivery Saturday based on the Tue 21:00 IST cutoff.
 *
 * Rule: orders placed before the *next* Tue 21:00 IST cutoff are delivered on
 * the Saturday that follows that cutoff (Tue + 4 days).
 *
 * Returned Date is the Saturday at 12:00 IST (06:30 UTC).
 */
export function getNextSaturday(now: Date = new Date()): Date {
  const istMs = now.getTime() + IST_OFFSET_MIN * 60_000;
  const ist = new Date(istMs);
  const day = ist.getUTCDay();      // 0=Sun..6=Sat in IST clock
  const hour = ist.getUTCHours();   // 0..23 in IST clock

  // Days from "now" to next Tuesday 21:00 IST (the cutoff).
  let daysToTue: number;
  if (day < 2) {
    daysToTue = 2 - day;                    // Sun→2, Mon→1
  } else if (day === 2 && hour < 21) {
    daysToTue = 0;                          // it IS Tuesday before cutoff
  } else {
    daysToTue = 9 - day;                    // Tue past 21→7, Wed→6, ..., Sat→3
  }

  const daysToSat = daysToTue + 4;          // Saturday is Tue + 4

  // Saturday at 12:00 IST = 06:30 UTC
  return new Date(Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate() + daysToSat,
    6, 30, 0,
  ));
}

/** Returns Monday 00:00 IST (UTC stored) for the week containing `date`. */
export function getMondayOfWeek(date: Date = new Date()): Date {
  const istMs = date.getTime() + IST_OFFSET_MIN * 60_000;
  const ist = new Date(istMs);
  const day = ist.getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMon = (day + 6) % 7; // Sun→6, Mon→0, Tue→1...
  return new Date(Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate() - daysSinceMon,
    -5, -30, 0, // Monday 00:00 IST = previous Sunday 18:30 UTC
  ));
}

/** "GL-1284" style helper — pads to at least 4 digits. */
export function formatOrderNumber(seq: number): string {
  return `GL-${seq.toString().padStart(4, "0")}`;
}
