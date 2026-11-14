export type ShipmentStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled";

export interface TimelineEvent {
  label: string;
  sub: string;
  time: string;
  state: "done" | "current" | "pending";
}

export interface CustomerShipment {
  id: string;
  trackingId: string;
  pickup: { address: string; city: string };
  delivery: { address: string; city: string };
  status: ShipmentStatus;
  driver?: { name: string; phone: string; rating: number; vehicle: string; plate: string; eta?: string };
  amount: number;
  createdAt: string;
  deliveredAt?: string;
  packageType: string;
  timeline: TimelineEvent[];
}

export const CURRENT_CUSTOMER = {
  name: "Adunola Fashola",
  email: "adunola@gmail.com",
  phone: "+2348012345678",
  avatar: "AF",
};

export const CUSTOMER_SHIPMENTS: CustomerShipment[] = [
  {
    id: "1",
    trackingId: "IST-K7X2M9PQ",
    pickup: { address: "14 Admiralty Way", city: "Lekki" },
    delivery: { address: "5 Bourdillon Road", city: "Ikoyi" },
    status: "out_for_delivery",
    driver: {
      name: "Babatunde Adeleke",
      phone: "+2348031234567",
      rating: 4.8,
      vehicle: "Motorcycle",
      plate: "LAG-278-AB",
      eta: "~8 min",
    },
    amount: 3500,
    createdAt: "2024-01-15T09:00:00Z",
    packageType: "Document",
    timeline: [
      { label: "Order placed", sub: "Your shipment request was received", time: "9:00 AM", state: "done" },
      { label: "Driver assigned", sub: "Babatunde Adeleke accepted your order", time: "9:14 AM", state: "done" },
      { label: "Package picked up", sub: "Driver collected your package", time: "10:02 AM", state: "done" },
      { label: "Out for delivery", sub: "On the way to your address", time: "10:48 AM", state: "current" },
      { label: "Delivered", sub: "Awaiting delivery", time: "ETA ~8 min", state: "pending" },
    ],
  },
  {
    id: "2",
    trackingId: "IST-X2PR5VCZ",
    pickup: { address: "9 Eric Moore Road", city: "Surulere" },
    delivery: { address: "15 Agege Motor Road", city: "Oshodi" },
    status: "pending",
    amount: 1800,
    createdAt: "2024-01-15T13:00:00Z",
    packageType: "Food",
    timeline: [
      { label: "Order placed", sub: "Your shipment request was received", time: "1:00 PM", state: "current" },
      { label: "Driver assigned", sub: "Awaiting driver acceptance", time: "—", state: "pending" },
      { label: "Package picked up", sub: "—", time: "—", state: "pending" },
      { label: "Out for delivery", sub: "—", time: "—", state: "pending" },
      { label: "Delivered", sub: "—", time: "—", state: "pending" },
    ],
  },
  {
    id: "3",
    trackingId: "IST-M4TY8HBW",
    pickup: { address: "28 Bode Thomas Street", city: "Surulere" },
    delivery: { address: "12 Kofo Abayomi Street", city: "Victoria Island" },
    status: "delivered",
    driver: {
      name: "Yusuf Musa",
      phone: "+2348064567890",
      rating: 4.7,
      vehicle: "Van",
      plate: "LAG-089-PQ",
    },
    amount: 4100,
    createdAt: "2024-01-14T10:00:00Z",
    deliveredAt: "2024-01-14T14:20:00Z",
    packageType: "Parcel",
    timeline: [
      { label: "Order placed", sub: "Your shipment request was received", time: "10:00 AM", state: "done" },
      { label: "Driver assigned", sub: "Yusuf Musa accepted your order", time: "10:12 AM", state: "done" },
      { label: "Package picked up", sub: "Driver collected your package", time: "11:30 AM", state: "done" },
      { label: "Out for delivery", sub: "On the way to your address", time: "1:45 PM", state: "done" },
      { label: "Delivered", sub: "Package delivered successfully", time: "2:20 PM", state: "done" },
    ],
  },
  {
    id: "4",
    trackingId: "IST-D6NF2QJR",
    pickup: { address: "5 Rasheed Alaba", city: "Ojota" },
    delivery: { address: "34 Awolowo Road", city: "Ikoyi" },
    status: "failed",
    driver: {
      name: "Segun Adebayo",
      phone: "+2348075678901",
      rating: 4.3,
      vehicle: "Motorcycle",
      plate: "LAG-334-EF",
    },
    amount: 2200,
    createdAt: "2024-01-14T09:30:00Z",
    packageType: "Document",
    timeline: [
      { label: "Order placed", sub: "Your shipment request was received", time: "9:30 AM", state: "done" },
      { label: "Driver assigned", sub: "Segun Adebayo accepted your order", time: "9:45 AM", state: "done" },
      { label: "Package picked up", sub: "Driver collected your package", time: "10:30 AM", state: "done" },
      { label: "Delivery failed", sub: "Address could not be reached", time: "12:15 PM", state: "done" },
    ],
  },
  {
    id: "5",
    trackingId: "IST-R3KM6XUB",
    pickup: { address: "8 Lekki-Epe Expressway", city: "Ajah" },
    delivery: { address: "31 Idowu Taylor Street", city: "Victoria Island" },
    status: "delivered",
    driver: {
      name: "Tunde Fashola",
      phone: "+2348053456789",
      rating: 4.9,
      vehicle: "Motorcycle",
      plate: "LAG-112-CD",
    },
    amount: 7200,
    createdAt: "2024-01-13T09:00:00Z",
    deliveredAt: "2024-01-13T15:30:00Z",
    packageType: "Electronics",
    timeline: [
      { label: "Order placed", sub: "Your shipment request was received", time: "9:00 AM", state: "done" },
      { label: "Driver assigned", sub: "Tunde Fashola accepted your order", time: "9:08 AM", state: "done" },
      { label: "Package picked up", sub: "Driver collected your package", time: "10:45 AM", state: "done" },
      { label: "Out for delivery", sub: "On the way to your address", time: "2:00 PM", state: "done" },
      { label: "Delivered", sub: "Package delivered successfully", time: "3:30 PM", state: "done" },
    ],
  },
];

export const STATUS_META: Record<
  ShipmentStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "#f59e0b" },
  assigned: { label: "Driver Assigned", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "#0ea5e9" },
  picked_up: { label: "Picked Up", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "#0ea5e9" },
  in_transit: { label: "In Transit", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "#0ea5e9" },
  out_for_delivery: { label: "Out for Delivery", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "#8b5cf6" },
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#10b981" },
  failed: { label: "Failed", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", dot: "#f43f5e" },
  cancelled: { label: "Cancelled", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20", dot: "#71717a" },
};

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
