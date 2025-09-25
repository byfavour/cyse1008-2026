// src/utils/dates.ts
export function toDate(value) {
  if (!value) return null;

  // Firestore Timestamp
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value?._seconds === 'number') return new Date(value._seconds * 1000);

  // JS Date
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // Epoch ms / s
  if (typeof value === 'number') {
    // Heuristic: if it's 10 digits, assume seconds
    return new Date(value < 1e12 ? value * 1000 : value);
  }

  // ISO string
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}
