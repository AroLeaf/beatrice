const suffixes = {
  ms: 1,
  milli: 1,
  millis: 1,
  millisec: 1,
  millisecs: 1,
  millisecond: 1,
  milliseconds: 1,
  
  s: 1_000,
  sec: 1_000,
  secs: 1_000,
  second: 1_000,
  seconds: 1_000,

  m: 60_000,
  min: 60_000,
  mins: 60_000,
  minute: 60_000,
  minutes: 60_000,

  h: 3_600_000,
  hs: 3_600_000,
  hour: 3_600_000,
  hours: 3_600_000,

  d: 24 * 3_600_000,
  day: 24 * 3_600_000,
  days: 24 * 3_600_000,

  w: 7 * 24 * 3_600_000,
  week: 7 * 24 * 3_600_000,
  weeks: 7 * 24 * 3_600_000,

  mo: 30 * 24 * 3_600_000,
  month: 30 * 24 * 3_600_000,
  months: 30 * 24 * 3_600_000,

  y: 365 * 24 * 3_600_000,
  year: 365 * 24 * 3_600_000,
  years: 365 * 24 * 3_600_000,

  dec: 10 * 365 * 24 * 3_600_000,
  decade: 10 * 365 * 24 * 3_600_000,
  decades: 10 * 365 * 24 * 3_600_000,

  cen: 100 * 365 * 24 * 3_600_000,
  cens: 100 * 365 * 24 * 3_600_000,
  cent: 100 * 365 * 24 * 3_600_000,
  cents: 100 * 365 * 24 * 3_600_000,
  century: 100 * 365 * 24 * 3_600_000,
  centurys: 100 * 365 * 24 * 3_600_000,

  mil: 1000 * 365 * 24 * 3_600_000,
  mils: 1000 * 365 * 24 * 3_600_000,
  millenium: 1000 * 365 * 24 * 3_600_000,
  millenia: 1000 * 365 * 24 * 3_600_000,

  aeon: 1_000_000_000 * 365 * 24 * 3_600_000,
  aeons: 1_000_000_000 * 365 * 24 * 3_600_000,
} as { [key: string]: number }

export default function duration(str: string) {
  if (!str) return;
  let time = 0;
  const parts = str.split(/[ \b]+/);
  for (let i = 0; i < parts.length; i++) {
    const match = /(\d+)([a-zA-Z]+)?/.exec(parts[i]);
    if (!match) return;
    const count = match[1];
    const suffix = match[2] || parts[++i];
    if (!suffix) return
    time += parseInt(count) * suffixes[suffix];
  }
  return time;
}