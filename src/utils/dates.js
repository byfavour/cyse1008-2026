// Handles Firestore Timestamp, plain POJO {seconds,nanoseconds},
// Date, ISO string, and epoch (s or ms).
export function toDate(v) {
  if (!v) return null;

  // Real Firestore Timestamp
  if (typeof v?.toDate === 'function') {
    const d = v.toDate();
    return Number.isNaN(d?.getTime?.()) ? null : d;
  }

  // Plain object (from JSON) {seconds,nanoseconds} or {_seconds,_nanoseconds}
  if (typeof v?.seconds === 'number') {
    return new Date(v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6));
  }
  if (typeof v?._seconds === 'number') {
    return new Date(v._seconds * 1000 + Math.floor((v._nanoseconds || 0) / 1e6));
  }

  // Epoch number (s or ms)
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v);

  // Date instance
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;

  // ISO string
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}
