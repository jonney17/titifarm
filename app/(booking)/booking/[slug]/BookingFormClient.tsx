"use client";
import { useMemo, useState } from "react";

type Departure = {
  id: string;
  date: string; // ISO
};

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function BookingFormClient({
  tourId,
  departures,
}: {
  tourId: string;
  departures: Departure[];
}) {
  const dateToSlot = useMemo(() => {
    const map = new Map<string, Departure>();
    for (const dep of departures) {
      map.set(toDateInputValue(dep.date), dep);
    }
    return map;
  }, [departures]);

  const availableDates = useMemo(() => Array.from(dateToSlot.keys()).sort(), [dateToSlot]);
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] ?? "");
  const selected = selectedDate ? dateToSlot.get(selectedDate) : undefined;
  // allow any date submission; backend will upsert/count per-date

  return (
    <form action={`/api/booking`} method="post" className="space-y-4">
      <input type="hidden" name="tourId" value={tourId} />
      <input type="hidden" name="departureSlotId" value={selected?.id ?? ""} />
      <input type="hidden" name="date" value={selectedDate} />

      <label className="block">
        <span className="text-sm">Chọn ngày khởi hành</span>
        <input
          type="date"
          required
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </label>

      <label className="block">
        <span className="text-sm">Số khách</span>
        <input name="numGuests" type="number" min={1} defaultValue={1} className="w-full border rounded px-3 py-2 mt-1" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Họ tên</span>
          <input name="customerName" required className="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input name="customerEmail" type="email" required className="w-full border rounded px-3 py-2 mt-1" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm">Số điện thoại</span>
        <input name="customerPhone" className="w-full border rounded px-3 py-2 mt-1" />
      </label>

      <button className="bg-black text-white rounded px-4 py-2">Tạo đơn</button>
    </form>
  );
}


