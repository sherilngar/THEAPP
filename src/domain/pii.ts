/**
 * Masks payment card numbers, passport numbers and Emirates ID numbers before a
 * message is stored or sent anywhere. Returns what kinds of data were found so the
 * concierge can remind the guest not to share them.
 */
export type PiiKind = 'card' | 'passport' | 'emirates_id';

const ARABIC_DIGITS = /[٠-٩]/g;
const toLatinDigits = (s: string) => s.replace(ARABIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660));

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function maskPii(input: string): { text: string; found: PiiKind[] } {
  const found = new Set<PiiKind>();
  let text = toLatinDigits(input);

  // Emirates ID: 784-YYYY-NNNNNNN-N
  text = text.replace(/\b784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d\b/g, () => {
    found.add('emirates_id');
    return '•••-••••-•••••••-•';
  });

  // Card numbers: 13-19 digits, optionally grouped by spaces or dashes.
  text = text.replace(/\b(?:\d[\s-]?){12,18}\d\b/g, (m) => {
    const digits = m.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return m;
    if (!luhn(digits) && !/\d{4}[\s-]\d{4}[\s-]\d{4}/.test(m)) return m;
    found.add('card');
    return `•••• ${digits.slice(-4)}`;
  });

  // Passport: an explicit mention followed by an alphanumeric document number.
  text = text.replace(
    /\b(passport|جواز(?:\s*السفر)?|جوازي)(\s*(?:no\.?|number|num|#|رقم)?\s*[:#]?\s*)([A-Z]{0,2}\d{6,9}|[A-Z]\d{7,8})\b/gi,
    (_m, label: string, sep: string) => {
      found.add('passport');
      return `${label}${sep}•••••••`;
    },
  );
  // Bare passport-shaped token (1-2 letters + 7 digits) is masked as well.
  text = text.replace(/\b[A-Z]{1,2}\d{7}\b/g, () => {
    found.add('passport');
    return '•••••••';
  });

  return { text: found.size ? text : input, found: [...found] };
}
