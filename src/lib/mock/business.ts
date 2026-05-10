// ─── Types ───────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled";

export type DriverStatus = "active" | "idle" | "offline";
export type VehicleType = "motorcycle" | "car" | "van" | "truck";

export interface Shipment {
  id: string;
  trackingId: string;
  customer: { name: string; phone: string };
  pickup: { address: string; city: string };
  delivery: { address: string; city: string };
  status: ShipmentStatus;
  driver?: { id: string; name: string; rating: number };
  amount: number;
  createdAt: string;
  deliveredAt?: string;
  weight: string;
  packageType: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalDeliveries: number;
  status: DriverStatus;
  vehicleType: VehicleType;
  vehiclePlate: string;
  currentShipmentId?: string;
  joinedAt: string;
  monthlyEarnings: number;
  avatar: string; // initials
}

export interface DailyStats {
  day: string;
  shipments: number;
  revenue: number;
  delivered: number;
}

// ─── Mock Shipments ───────────────────────────────────────────────────────────

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "1",
    trackingId: "IST-K7X2M9PQ",
    customer: { name: "Adunola Fashola", phone: "+2348012345678" },
    pickup: { address: "14 Admiralty Way", city: "Lekki" },
    delivery: { address: "5 Bourdillon Road", city: "Ikoyi" },
    status: "delivered",
    driver: { id: "d1", name: "Babatunde Adeleke", rating: 4.8 },
    amount: 3500,
    createdAt: "2024-01-15T09:00:00Z",
    deliveredAt: "2024-01-15T13:42:00Z",
    weight: "2.5 kg",
    packageType: "Document",
  },
  {
    id: "2",
    trackingId: "IST-B3N8R4PT",
    customer: { name: "Chukwuemeka Obi", phone: "+2348023456789" },
    pickup: { address: "22 Allen Avenue", city: "Ikeja" },
    delivery: { address: "18 Ozumba Mbadiwe", city: "Victoria Island" },
    status: "in_transit",
    driver: { id: "d2", name: "Emeka Okafor", rating: 4.6 },
    amount: 5200,
    createdAt: "2024-01-15T11:30:00Z",
    weight: "4.1 kg",
    packageType: "Electronics",
  },
  {
    id: "3",
    trackingId: "IST-W9QK7LMN",
    customer: { name: "Blessing Nwosu", phone: "+2348034567890" },
    pickup: { address: "3 Gbagada Expressway", city: "Gbagada" },
    delivery: { address: "47 Opebi Road", city: "Ikeja" },
    status: "out_for_delivery",
    driver: { id: "d3", name: "Tunde Fashola", rating: 4.9 },
    amount: 2800,
    createdAt: "2024-01-15T08:15:00Z",
    weight: "1.2 kg",
    packageType: "Clothing",
  },
  {
    id: "4",
    trackingId: "IST-X2PR5VCZ",
    customer: { name: "Ngozi Eze", phone: "+2348045678901" },
    pickup: { address: "9 Eric Moore Road", city: "Surulere" },
    delivery: { address: "15 Agege Motor Road", city: "Oshodi" },
    status: "pending",
    amount: 1800,
    createdAt: "2024-01-15T13:00:00Z",
    weight: "0.8 kg",
    packageType: "Food",
  },
  {
    id: "5",
    trackingId: "IST-M4TY8HBW",
    customer: { name: "Femi Adeyinka", phone: "+2348056789012" },
    pickup: { address: "28 Bode Thomas Street", city: "Surulere" },
    delivery: { address: "12 Kofo Abayomi Street", city: "Victoria Island" },
    status: "delivered",
    driver: { id: "d4", name: "Yusuf Musa", rating: 4.7 },
    amount: 4100,
    createdAt: "2024-01-14T10:00:00Z",
    deliveredAt: "2024-01-14T14:20:00Z",
    weight: "3.0 kg",
    packageType: "Parcel",
  },
  {
    id: "6",
    trackingId: "IST-D6NF2QJR",
    customer: { name: "Aisha Bello", phone: "+2348067890123" },
    pickup: { address: "5 Rasheed Alaba", city: "Ojota" },
    delivery: { address: "34 Awolowo Road", city: "Ikoyi" },
    status: "failed",
    driver: { id: "d5", name: "Segun Adebayo", rating: 4.3 },
    amount: 2200,
    createdAt: "2024-01-14T09:30:00Z",
    weight: "1.5 kg",
    packageType: "Document",
    notes: "Customer unavailable at delivery address",
  },
  {
    id: "7",
    trackingId: "IST-T8VL3ZKP",
    customer: { name: "Rotimi Ajayi", phone: "+2348078901234" },
    pickup: { address: "19 Ikorodu Road", city: "Maryland" },
    delivery: { address: "7 Hospital Road", city: "Apapa" },
    status: "delivered",
    driver: { id: "d1", name: "Babatunde Adeleke", rating: 4.8 },
    amount: 6800,
    createdAt: "2024-01-14T08:00:00Z",
    deliveredAt: "2024-01-14T12:55:00Z",
    weight: "6.0 kg",
    packageType: "Electronics",
  },
  {
    id: "8",
    trackingId: "IST-Q5SC9YEA",
    customer: { name: "Chidinma Okonkwo", phone: "+2348089012345" },
    pickup: { address: "11 Iju Road", city: "Ifako-Ijaiye" },
    delivery: { address: "25 Simbiat Abiola Way", city: "Ikeja" },
    status: "in_transit",
    driver: { id: "d6", name: "Kayode Ola", rating: 4.5 },
    amount: 3100,
    createdAt: "2024-01-15T10:45:00Z",
    weight: "2.2 kg",
    packageType: "Clothing",
  },
  {
    id: "9",
    trackingId: "IST-H7JW4NTG",
    customer: { name: "Usman Garba", phone: "+2348090123456" },
    pickup: { address: "42 Lagos-Ibadan Expressway", city: "Berger" },
    delivery: { address: "6 Mobolaji Bank Anthony Way", city: "Maryland" },
    status: "pending",
    amount: 2500,
    createdAt: "2024-01-15T14:00:00Z",
    weight: "1.8 kg",
    packageType: "Parcel",
  },
  {
    id: "10",
    trackingId: "IST-R3KM6XUB",
    customer: { name: "Taiwo Salami", phone: "+2348001234567" },
    pickup: { address: "8 Lekki-Epe Expressway", city: "Ajah" },
    delivery: { address: "31 Idowu Taylor Street", city: "Victoria Island" },
    status: "delivered",
    driver: { id: "d3", name: "Tunde Fashola", rating: 4.9 },
    amount: 7200,
    createdAt: "2024-01-13T09:00:00Z",
    deliveredAt: "2024-01-13T15:30:00Z",
    weight: "5.5 kg",
    packageType: "Electronics",
  },
  {
    id: "11",
    trackingId: "IST-P2GN8WCV",
    customer: { name: "Olufunmilayo Adekunle", phone: "+2348011234567" },
    pickup: { address: "55 Obafemi Awolowo Way", city: "Ikeja" },
    delivery: { address: "10 Kingsway Road", city: "Ikoyi" },
    status: "cancelled",
    amount: 1900,
    createdAt: "2024-01-13T11:00:00Z",
    weight: "0.6 kg",
    packageType: "Document",
    notes: "Order cancelled by customer",
  },
  {
    id: "12",
    trackingId: "IST-C9XF1BQD",
    customer: { name: "Musa Ibrahim", phone: "+2348022345678" },
    pickup: { address: "17 Ikosi Road", city: "Ketu" },
    delivery: { address: "3 Ahmadu Bello Way", city: "Victoria Island" },
    status: "out_for_delivery",
    driver: { id: "d2", name: "Emeka Okafor", rating: 4.6 },
    amount: 4400,
    createdAt: "2024-01-15T07:30:00Z",
    weight: "3.8 kg",
    packageType: "Parcel",
  },
];

// ─── Mock Drivers ─────────────────────────────────────────────────────────────

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Babatunde Adeleke",
    phone: "+2348031234567",
    email: "babatunde@isotrack.com",
    rating: 4.8,
    totalDeliveries: 287,
    status: "active",
    vehicleType: "motorcycle",
    vehiclePlate: "LAG-278-AB",
    currentShipmentId: "IST-K7X2M9PQ",
    joinedAt: "2023-06-12",
    monthlyEarnings: 142000,
    avatar: "BA",
  },
  {
    id: "d2",
    name: "Emeka Okafor",
    phone: "+2348042345678",
    email: "emeka@isotrack.com",
    rating: 4.6,
    totalDeliveries: 214,
    status: "active",
    vehicleType: "car",
    vehiclePlate: "LAG-445-XY",
    currentShipmentId: "IST-B3N8R4PT",
    joinedAt: "2023-08-01",
    monthlyEarnings: 118000,
    avatar: "EO",
  },
  {
    id: "d3",
    name: "Tunde Fashola",
    phone: "+2348053456789",
    email: "tunde@isotrack.com",
    rating: 4.9,
    totalDeliveries: 412,
    status: "active",
    vehicleType: "motorcycle",
    vehiclePlate: "LAG-112-CD",
    currentShipmentId: "IST-W9QK7LMN",
    joinedAt: "2023-03-15",
    monthlyEarnings: 198000,
    avatar: "TF",
  },
  {
    id: "d4",
    name: "Yusuf Musa",
    phone: "+2348064567890",
    email: "yusuf@isotrack.com",
    rating: 4.7,
    totalDeliveries: 176,
    status: "idle",
    vehicleType: "van",
    vehiclePlate: "LAG-089-PQ",
    joinedAt: "2023-09-20",
    monthlyEarnings: 95000,
    avatar: "YM",
  },
  {
    id: "d5",
    name: "Segun Adebayo",
    phone: "+2348075678901",
    email: "segun@isotrack.com",
    rating: 4.3,
    totalDeliveries: 98,
    status: "idle",
    vehicleType: "motorcycle",
    vehiclePlate: "LAG-334-EF",
    joinedAt: "2023-11-05",
    monthlyEarnings: 67000,
    avatar: "SA",
  },
  {
    id: "d6",
    name: "Kayode Ola",
    phone: "+2348086789012",
    email: "kayode@isotrack.com",
    rating: 4.5,
    totalDeliveries: 143,
    status: "active",
    vehicleType: "car",
    vehiclePlate: "LAG-567-GH",
    currentShipmentId: "IST-Q5SC9YEA",
    joinedAt: "2023-07-10",
    monthlyEarnings: 88000,
    avatar: "KO",
  },
  {
    id: "d7",
    name: "Amina Yusuf",
    phone: "+2348097890123",
    email: "amina@isotrack.com",
    rating: 4.4,
    totalDeliveries: 89,
    status: "offline",
    vehicleType: "motorcycle",
    vehiclePlate: "LAG-721-IJ",
    joinedAt: "2023-12-01",
    monthlyEarnings: 52000,
    avatar: "AY",
  },
  {
    id: "d8",
    name: "Chidi Nwosu",
    phone: "+2348008901234",
    email: "chidi@isotrack.com",
    rating: 4.6,
    totalDeliveries: 201,
    status: "offline",
    vehicleType: "van",
    vehiclePlate: "LAG-903-KL",
    joinedAt: "2023-05-22",
    monthlyEarnings: 112000,
    avatar: "CN",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export const DAILY_STATS: DailyStats[] = [
  { day: "Mon", shipments: 18, revenue: 74200, delivered: 15 },
  { day: "Tue", shipments: 24, revenue: 98500, delivered: 21 },
  { day: "Wed", shipments: 31, revenue: 127800, delivered: 28 },
  { day: "Thu", shipments: 22, revenue: 91000, delivered: 19 },
  { day: "Fri", shipments: 38, revenue: 156400, delivered: 34 },
  { day: "Sat", shipments: 45, revenue: 185200, delivered: 41 },
  { day: "Sun", shipments: 28, revenue: 115600, delivered: 25 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  ShipmentStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "#f59e0b",
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
  cancelled: {
    label: "Cancelled",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    dot: "#71717a",
  },
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motorcycle: "Motorcycle",
  car: "Car",
  van: "Van",
  truck: "Truck",
};

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
