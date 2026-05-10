// ─── Types ───────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export interface Delivery {
  id: string;
  trackingId: string;
  customer: { name: string; phone: string };
  pickup: { address: string; city: string };
  delivery: { address: string; city: string };
  status: DeliveryStatus;
  assignedAt: string;
  completedAt?: string;
  amount: number;
  driverEarning: number;
  packageType: string;
  weight: string;
  notes?: string;
  distance: string;
  eta?: string;
}

export interface DailyEarning {
  day: string;
  deliveries: number;
  earning: number;
}

// ─── Current driver profile ───────────────────────────────────────────────────

export const CURRENT_DRIVER = {
  id: "d1",
  name: "Babatunde Adeleke",
  phone: "+2348031234567",
  email: "babatunde@isotrack.com",
  rating: 4.8,
  totalDeliveries: 287,
  vehicleType: "Motorcycle" as const,
  vehiclePlate: "LAG-278-AB",
  joinedAt: "2023-06-12",
  avatar: "BA",
};

// ─── Mock deliveries ──────────────────────────────────────────────────────────

export const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "1",
    trackingId: "IST-K7X2M9PQ",
    customer: { name: "Adunola Fashola", phone: "+2348012345678" },
    pickup: { address: "14 Admiralty Way", city: "Lekki" },
    delivery: { address: "5 Bourdillon Road", city: "Ikoyi" },
    status: "out_for_delivery",
    assignedAt: "2024-01-15T09:00:00Z",
    amount: 3500,
    driverEarning: 1400,
    packageType: "Document",
    weight: "2.5 kg",
    distance: "4.2 km",
    eta: "~8 min",
  },
  {
    id: "2",
    trackingId: "IST-T8VL3ZKP",
    customer: { name: "Rotimi Ajayi", phone: "+2348078901234" },
    pickup: { address: "19 Ikorodu Road", city: "Maryland" },
    delivery: { address: "7 Hospital Road", city: "Apapa" },
    status: "delivered",
    assignedAt: "2024-01-14T08:00:00Z",
    completedAt: "2024-01-14T12:55:00Z",
    amount: 6800,
    driverEarning: 2720,
    packageType: "Electronics",
    weight: "6.0 kg",
    distance: "12.7 km",
  },
  {
    id: "3",
    trackingId: "IST-R3KM6XUB",
    customer: { name: "Taiwo Salami", phone: "+2348001234567" },
    pickup: { address: "8 Lekki-Epe Expressway", city: "Ajah" },
    delivery: { address: "31 Idowu Taylor Street", city: "Victoria Island" },
    status: "delivered",
    assignedAt: "2024-01-13T09:00:00Z",
    completedAt: "2024-01-13T15:30:00Z",
    amount: 7200,
    driverEarning: 2880,
    packageType: "Electronics",
    weight: "5.5 kg",
    distance: "18.4 km",
  },
  {
    id: "4",
    trackingId: "IST-M4TY8HBW",
    customer: { name: "Femi Adeyinka", phone: "+2348056789012" },
    pickup: { address: "28 Bode Thomas Street", city: "Surulere" },
    delivery: { address: "12 Kofo Abayomi Street", city: "Victoria Island" },
    status: "delivered",
    assignedAt: "2024-01-14T10:00:00Z",
    completedAt: "2024-01-14T14:20:00Z",
    amount: 4100,
    driverEarning: 1640,
    packageType: "Parcel",
    weight: "3.0 kg",
    distance: "7.8 km",
  },
  {
    id: "5",
    trackingId: "IST-P9XN2WBQ",
    customer: { name: "Kemi Adeleye", phone: "+2348033456789" },
    pickup: { address: "3 Adetokunbo Ademola Street", city: "Victoria Island" },
    delivery: { address: "45 Ogunlana Drive", city: "Surulere" },
    status: "delivered",
    assignedAt: "2024-01-12T11:00:00Z",
    completedAt: "2024-01-12T13:45:00Z",
    amount: 2900,
    driverEarning: 1160,
    packageType: "Clothing",
    weight: "1.8 kg",
    distance: "8.1 km",
  },
  {
    id: "6",
    trackingId: "IST-H4FR7NKP",
    customer: { name: "Sola Bamgbose", phone: "+2348044567890" },
    pickup: { address: "22 Allen Avenue", city: "Ikeja" },
    delivery: { address: "10 Ribadu Road", city: "Ikoyi" },
    status: "failed",
    assignedAt: "2024-01-11T09:30:00Z",
    amount: 3200,
    driverEarning: 0,
    packageType: "Document",
    weight: "0.5 kg",
    notes: "Customer phone unreachable after 3 attempts",
    distance: "11.3 km",
  },
  {
    id: "7",
    trackingId: "IST-W2JG9MXC",
    customer: { name: "Ngozi Eze", phone: "+2348055678901" },
    pickup: { address: "9 Eric Moore Road", city: "Surulere" },
    delivery: { address: "33 Akin Adesola Street", city: "Victoria Island" },
    status: "delivered",
    assignedAt: "2024-01-11T07:30:00Z",
    completedAt: "2024-01-11T10:50:00Z",
    amount: 3800,
    driverEarning: 1520,
    packageType: "Food",
    weight: "2.2 kg",
    distance: "9.6 km",
  },
  {
    id: "8",
    trackingId: "IST-B6TK4CPZ",
    customer: { name: "Emeka Chukwu", phone: "+2348066789012" },
    pickup: { address: "18 Broad Street", city: "Lagos Island" },
    delivery: { address: "7 Idejo Street", city: "Victoria Island" },
    status: "delivered",
    assignedAt: "2024-01-10T10:00:00Z",
    completedAt: "2024-01-10T11:30:00Z",
    amount: 2400,
    driverEarning: 960,
    packageType: "Document",
    weight: "0.8 kg",
    distance: "3.2 km",
  },
];

// ─── Daily earnings (last 7 days) ─────────────────────────────────────────────

export const DAILY_EARNINGS: DailyEarning[] = [
  { day: "Mon", deliveries: 4, earning: 6240 },
  { day: "Tue", deliveries: 6, earning: 9120 },
  { day: "Wed", deliveries: 5, earning: 7800 },
  { day: "Thu", deliveries: 7, earning: 10640 },
  { day: "Fri", deliveries: 8, earning: 12800 },
  { day: "Sat", deliveries: 9, earning: 14400 },
  { day: "Sun", deliveries: 3, earning: 4560 },
];

// ─── Status meta ──────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  assigned: {
    label: "Assigned",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "#f59e0b",
  },
  picked_up: {
    label: "Picked Up",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    dot: "#0ea5e9",
  },
  in_transit: {
    label: "In Transit",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    dot: "#0ea5e9",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    dot: "#8b5cf6",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "#10b981",
  },
  failed: {
    label: "Failed",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "#f43f5e",
  },
};

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
