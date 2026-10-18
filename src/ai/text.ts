import type { Lang } from '../domain/types';

const ARABIC_CHAR = /[؀-ۿ]/;
const ARABIC_CHARS = /[؀-ۿ]/g;
const OTHER_SCRIPT = /[Ѐ-ӿऀ-ॿ぀-ヿ一-鿿가-힯฀-๿]/;
const LETTER = /[\p{L}\p{N}]/u;

export function detectLang(text: string): Lang {
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
  if (!letters) return 'en';
  const arabic = (text.match(ARABIC_CHARS) ?? []).length;
  if (arabic / letters.length > 0.3) return 'ar';
  if (OTHER_SCRIPT.test(text)) return 'other';
  return 'en';
}

/** Lower-case, Latin digits, and folded Arabic letter variants so spelling differences still match. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[ً-ْـ]/g, '') // diacritics and tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

const AR_PREFIXES = ['وال', 'بال', 'فال', 'كال', 'لل', 'ال', 'و', 'ب', 'ل', 'ف', 'ك'];

function isBoundary(ch: string | undefined): boolean {
  return ch === undefined || !LETTER.test(ch);
}

/** Every position where `kw` occurs as a whole word (Arabic allows clitic prefixes and short suffixes). */
export function findKeyword(text: string, kw: string): Array<{ start: number; end: number }> {
  const hits: Array<{ start: number; end: number }> = [];
  if (!kw) return hits;
  const arabic = ARABIC_CHAR.test(kw);
  let from = 0;
  for (;;) {
    const i = text.indexOf(kw, from);
    if (i < 0) break;
    from = i + 1;
    let startOk = isBoundary(text[i - 1]);
    let start = i;
    if (!startOk && arabic) {
      for (const p of AR_PREFIXES) {
        if (text.slice(i - p.length, i) === p && isBoundary(text[i - p.length - 1])) {
          startOk = true;
          start = i - p.length;
          break;
        }
      }
    }
    if (!startOk) continue;
    let end = i + kw.length;
    let endOk = isBoundary(text[end]);
    if (!endOk && !arabic && kw.length >= 3) {
      for (const suffix of ['s', 'es']) {
        if (text.startsWith(suffix, end) && isBoundary(text[end + suffix.length])) {
          endOk = true;
          end += suffix.length;
          break;
        }
      }
    }
    if (!endOk && arabic && kw.length >= 4) {
      for (let extra = 1; extra <= 2 && !endOk; extra++) {
        if (ARABIC_CHAR.test(text.slice(end, end + extra)) && isBoundary(text[end + extra])) {
          endOk = true;
          end += extra;
        }
      }
    }
    if (endOk) hits.push({ start, end });
  }
  return hits;
}

export interface KeywordEntry {
  key: string;
  kw: string[];
}

export interface Match {
  key: string;
  start: number;
  end: number;
  /** Quantity implied by the keyword itself, e.g. an Arabic dual form. */
  impliedQty?: number;
}

/** Longest-first, non-overlapping keyword matches. */
export function findMatches(text: string, entries: KeywordEntry[]): Match[] {
  const all: Array<Match & { len: number }> = [];
  for (const e of entries) {
    for (const raw of e.kw) {
      const [word, qty] = raw.split(':');
      const kw = normalize(word ?? '');
      for (const h of findKeyword(text, kw)) {
        all.push({ key: e.key, ...h, len: kw.length, impliedQty: qty ? Number(qty) : undefined });
      }
    }
  }
  all.sort((a, b) => b.len - a.len || a.start - b.start);
  const taken: Match[] = [];
  for (const m of all) {
    if (taken.some((t) => m.start < t.end && t.start < m.end)) continue;
    taken.push({ key: m.key, start: m.start, end: m.end, impliedQty: m.impliedQty });
  }
  return taken.sort((a, b) => a.start - b.start);
}

export function containsAny(text: string, words: string[]): boolean {
  return words.some((w) => findKeyword(text, normalize(w)).length > 0);
}

/** Splits a message into phrases so quantities and times stay attached to the right request. */
export function splitSegments(text: string): Array<{ text: string; offset: number }> {
  const out: Array<{ text: string; offset: number }> = [];
  const re = /[,.;!?،؛\n]+|\s+(?:and also|and then|and|also|plus|then|but|as well as)\s+|\s+و(?=\s)|\s+(?=و[؀-ۿ]{3,})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), offset: last });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), offset: last });
  return out.filter((s) => s.text.trim());
}

const EN_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, single: 1, two: 2, couple: 2, pair: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};
const AR_NUMBERS: Record<string, number> = {
  واحد: 1, واحده: 1, اثنين: 2, اثنان: 2, اثنتين: 2, ثنتين: 2, زوج: 2, ثلاث: 3, ثلاثه: 3, اربع: 4, اربعه: 4, خمس: 5, خمسه: 5, ست: 6, سته: 6, سبع: 7, سبعه: 7, ثمان: 8, ثمانيه: 8, تسع: 9, تسعه: 9, عشر: 10, عشره: 10,
};

export function wordToNumber(word: string): number | undefined {
  const w = word.replace(/[^\p{L}\p{N}]/gu, '');
  if (/^\d{1,2}$/.test(w)) return Number(w);
  return EN_NUMBERS[w] ?? AR_NUMBERS[w];
}

/** Quantity for a match: up to three words before it (any language) or two after it (Arabic). */
export function quantityNear(segment: string, start: number, end: number): number | undefined {
  const before = segment.slice(0, start).trim().split(/\s+/).slice(-3).reverse();
  for (const w of before) {
    if (/^(extra|more|additional|fresh|clean|new|of|bottles?|please|me|us|send|bring|get|need|want|some|اضافيه|اضافي|زياده)$/.test(w)) continue;
    const n = wordToNumber(w);
    if (n !== undefined) return n;
    break;
  }
  const after = segment.slice(end).trim().split(/\s+/).slice(0, 2);
  for (const w of after) {
    const n = wordToNumber(w);
    if (n !== undefined && (ARABIC_CHAR.test(segment) || /^x?\d+$/.test(w))) return n;
  }
  const xForm = segment.slice(Math.max(0, start - 4), start).match(/(\d+)\s*x\s*$/);
  if (xForm) return Number(xForm[1]);
  return undefined;
}

export interface ParsedTime {
  time?: string; // HH:MM or "now"
  date?: 'today' | 'tomorrow';
  /** Hour given without am/pm, e.g. "for 8" — kept so the caller can decide. */
  bareHour?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function parseTime(raw: string): ParsedTime {
  const t = normalize(raw);
  const out: ParsedTime = {};
  if (/\b(tomorrow|tmrw)\b|بكره|بكرة|غدا|الغد/.test(t)) out.date = 'tomorrow';
  else if (/\b(today|tonight|this evening|this afternoon|this morning)\b|اليوم|الليله/.test(t)) out.date = 'today';

  if (/\b(now|right now|asap|immediately|right away)\b|الان|حالا|فورا/.test(t)) {
    out.time = 'now';
    return out;
  }
  if (/\bnoon|midday\b|الظهر/.test(t)) out.time = '12:00';
  if (/\bmidnight\b|منتصف الليل/.test(t)) out.time = '00:00';
  const evening = /\b(tonight|evening|night|pm|p\.m\.|dinner)\b|مساء|المساء|الليله|بالليل|عشاء/.test(t);
  const morning = /\b(morning|am|a\.m\.|breakfast)\b|صباحا|الصبح|الصباح/.test(t);

  const ampm = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/);
  if (ampm) {
    let h = Number(ampm[1]) % 12;
    if (ampm[3]?.startsWith('p')) h += 12;
    out.time = `${pad(h)}:${ampm[2] ?? '00'}`;
    return out;
  }
  const clock = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const atHour =
    clock ??
    t.match(/(?:\bat|\baround|\bby|الساعه|ساعه)\s*(\d{1,2})\b/) ??
    t.match(/\bfor\s+(\d{1,2})\s+(?:tonight|this evening|today|tomorrow)/);
  if (atHour) {
    let h = Number(atHour[1]);
    const m = clock ? Number(clock[2]) : 0;
    if (!clock || h <= 12) {
      if (h < 12 && evening && !morning) h += 12;
      else if (h >= 1 && h <= 6 && !morning) h += 12;
    }
    out.time = `${pad(h % 24)}:${pad(m)}`;
    return out;
  }
  const inMins = t.match(/\bin\s+(\d{1,3})\s*(minutes|mins|min|hours|hour|hrs|hr)\b|بعد\s*(\d{1,3})\s*(دقيقه|دقائق|ساعه|ساعات)/);
  if (inMins) {
    const n = Number(inMins[1] ?? inMins[3]);
    const unit = inMins[2] ?? inMins[4] ?? '';
    const mins = /h|ساع/.test(unit) ? n * 60 : n;
    out.time = `in ${mins} min`;
    return out;
  }
  const bare = t.match(/\bfor\s+(\d{1,2})\b(?!\s*(people|persons|guests|pax|adults|of us|ppl))/);
  if (bare) out.bareHour = Number(bare[1]);
  if (!out.time && /\btonight\b|الليله/.test(t)) out.time = undefined;
  return out;
}

export function parsePartySize(raw: string): number | undefined {
  const t = normalize(raw);
  const m =
    t.match(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(people|persons|person|guests|pax|adults|of us|ppl)\b/) ??
    t.match(/\btable for\s+(\d{1,2}|two|three|four|five|six|seven|eight|nine|ten)\b(?!\s*(pm|am|:|tonight|o'clock))/) ??
    t.match(/(\d{1,2}|اثنين|ثلاثه|اربعه|خمسه|سته)\s*(اشخاص|شخص|افراد|نفر)/);
  if (m) return wordToNumber(m[1] ?? '');
  if (/\bjust (the )?two of us|\bfor two\b|\bfor us two\b|شخصين|لشخصين/.test(t)) return 2;
  if (/\bjust me\b|\bfor one\b|\bonly me\b|شخص واحد/.test(t)) return 1;
  return undefined;
}

export function isAffirmative(raw: string): boolean {
  const t = normalize(raw).replace(/[!.]/g, '');
  return /^(yes|yes please|yeah|yep|yup|sure|ok|okay|confirm|confirmed|go ahead|please do|place it|perfect|correct|that's right|sounds good|نعم|ايوه|ايوا|اي|اكيد|تمام|اوكي|موافق|اكد|نعم من فضلك|ok please)\b/.test(t);
}

export function isNegative(raw: string): boolean {
  const t = normalize(raw);
  return /^(no|nope|not yet|change|wait|cancel|لا|مو|غير|الغاء)\b/.test(t);
}

export function isQuestion(raw: string): boolean {
  const t = normalize(raw);
  return (
    /\?|؟/.test(raw) ||
    /^(what|when|where|which|who|how|is there|are there|do you|does|is the|are the|can i|may i|could you tell)\b/.test(t) ||
    /^(متي|اين|وين|كم|هل|ما هي|ما هو|شو|ايش|كيف|فين)\b/.test(t)
  );
}

export function hasRequestMarker(raw: string): boolean {
  const t = normalize(raw);
  return /\b(can i (get|have|order|book)|could i (get|have)|can you|could you|can we|please|i need|we need|i'd like|i would like|we'd like|send|bring|book|order|reserve|arrange|i want|we want|get me|need)\b|ممكن|ابغي|ابي|اريد|لو سمحت|من فضلك|ارسل|احجز|اطلب|نبغي|نحتاج|احتاج/.test(t);
}

export function hasProblemMarker(raw: string): boolean {
  const t = normalize(raw);
  return /\b(not working|isn't working|doesn't work|does not work|won't|broken|stopped|problem|issue|can't connect|cannot connect|slow|leaking|too (hot|cold|loud)|keeps|stuck|faulty)\b|لا يعمل|ما يشتغل|مايشتغل|خربان|عطلان|معطل|عطل|بطيء|مشكله/.test(t);
}
