/** Email validation */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Password: min 8 chars, at least 1 letter and 1 digit */
export function validatePassword(pw) {
  return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
}

/** Phone: exactly 10 digits */
export function validatePhone(phone) {
  return /^\d{10}$/.test(phone.replace(/\s+/g, ''));
}

/** Name: 2–50 chars, letters/spaces/hyphens */
export function validateName(name) {
  return /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name.trim());
}

/** Date of birth: must be a valid past date, user >= 13 years old */
export function validateDob(dob) {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  if (d > new Date()) return false;
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 13);
  return d <= minAge;
}

/** Mood note: optional but max 500 chars */
export function validateNote(note) {
  return !note || note.length <= 500;
}

/** Mood level: integer 1–10 */
export function validateMoodLevel(level) {
  return Number.isInteger(Number(level)) && level >= 1 && level <= 10;
}

/** Generic required string */
export function validateRequired(val) {
  return typeof val === 'string' ? val.trim().length > 0 : Boolean(val);
}

/** Emergency contact phone */
export function validateContactPhone(phone) {
  return /^\+?[\d\s\-().]{7,15}$/.test(phone.trim());
}

/** Validate relation field */
export function validateRelation(relation) {
  return relation.trim().length >= 2 && relation.trim().length <= 50;
}

/**
 * Run multiple validators and return first error or null
 * @param {any} value
 * @param {Array<{fn: Function, message: string}>} rules
 */
export function runValidators(value, rules) {
  for (const rule of rules) {
    if (!rule.fn(value)) return rule.message;
  }
  return null;
}
