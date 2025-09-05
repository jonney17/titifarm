export function generateBookingCode(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `BK${y}${m}${d}-${rand}`;
}


