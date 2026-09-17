"use client";

import { useMemo } from "react";
import { CalendarClock, DollarSign, Star, TrendingUp } from "lucide-react";
import { useDriverProfile } from "@/hooks/use-driver";
import { useDriverHistory } from "@/hooks/use-shipments";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function Metric({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: typeof DollarSign;
}) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-600">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-50">{value}</p>
          <p className="mt-1 text-xs font-bold text-stone-600">{sub}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-teal-400/20 bg-teal-400/10 text-teal-200">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function DriverEarningsPage() {
  const { data: driver } = useDriverProfile();
  const { data: allShipments = [] } = useDriverHistory({ pageSize: 200 });
  const delivered = allShipments.filter((shipment) => shipment.status === "delivered");

  const weeklyData = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return labels.map((day, index) => {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const shipments = delivered.filter((shipment) => {
        const date = new Date(shipment.actualDelivery ?? shipment.updatedAt);
        return date >= dayStart && date <= dayEnd;
      });
      return {
        day,
        deliveries: shipments.length,
        earning: shipments.reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0),
      };
    });
  }, [delivered]);

  const monthlyHistory = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
      const shipments = delivered.filter((shipment) => {
        const date = new Date(shipment.actualDelivery ?? shipment.updatedAt);
        return date >= start && date <= end;
      });
      return {
        month: month.toLocaleDateString("en-NG", { month: "short", year: "numeric" }),
        deliveries: shipments.length,
        earning: shipments.reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0),
      };
    }).reverse();
  }, [delivered]);

  const weekEarnings = weeklyData.reduce((sum, item) => sum + item.earning, 0);
  const weekDeliveries = weeklyData.reduce((sum, item) => sum + item.deliveries, 0);
  const allTime = delivered.reduce((sum, shipment) => sum + Math.round(shipment.priceKobo * 0.4), 0);
  const avgPerTrip = delivered.length > 0 ? Math.round(allTime / delivered.length) : 0;
  const maxWeek = Math.max(...weeklyData.map((item) => item.earning), 1);

  const nextFriday = useMemo(() => {
    const date = new Date();
    const daysUntilFriday = (5 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilFriday);
    return date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Payout board</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">Earnings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Track completed-trip income, weekly balance, and payout timing.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="This week" value={formatNaira(weekEarnings)} sub={`${weekDeliveries} deliveries`} Icon={TrendingUp} />
        <Metric label="Pending payout" value={formatNaira(weekEarnings)} sub={`Due ${nextFriday}`} Icon={CalendarClock} />
        <Metric label="All time" value={formatNaira(allTime)} sub={`${delivered.length} completed trips`} Icon={DollarSign} />
        <Metric label="Average trip" value={formatNaira(avgPerTrip)} sub={`Rating ${driver?.rating ? driver.rating.toFixed(1) : "new"}`} Icon={Star} />
      </div>

      <section className="rounded-md border border-white/[0.07] bg-[#0d1412] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Current week</p>
            <h3 className="mt-1 text-base font-black text-stone-50">Daily earnings</h3>
          </div>
          <p className="text-xs font-black text-amber-200">{formatNaira(weekEarnings)}</p>
        </div>
        <div className="mt-6 grid h-56 grid-cols-7 items-end gap-2">
          {weeklyData.map((item) => (
            <div key={item.day} className="flex h-full flex-col justify-end gap-2">
              <div className="flex flex-1 items-end rounded bg-white/[0.03]">
                <div className="w-full rounded bg-gradient-to-t from-amber-300 to-teal-200" style={{ height: `${Math.max(8, (item.earning / maxWeek) * 100)}%` }} title={formatNaira(item.earning)} />
              </div>
              <p className="text-center text-[10px] font-black text-stone-600">{item.day}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-white/[0.07] bg-[#0d1412]">
        <div className="border-b border-white/[0.07] px-4 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">History</p>
          <h3 className="mt-1 text-base font-black text-stone-50">Monthly summary</h3>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {monthlyHistory.map((item) => (
            <div key={item.month} className="grid grid-cols-[1fr,auto] items-center gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-black text-stone-100">{item.month}</p>
                <p className="text-xs text-stone-600">{item.deliveries} deliveries</p>
              </div>
              <p className="text-sm font-black text-stone-100">{formatNaira(item.earning)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
