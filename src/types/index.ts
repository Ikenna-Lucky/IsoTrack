// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "business" | "driver" | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  emergencyContact?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Shipment ─────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled";

export interface Coordinates {
  lat: number;
  lng: number;
}

// Matches the jsonb shape stored in the backend
export interface Address {
  street: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  status: ShipmentStatus;

  // Parties
  businessId: string;
  driverId?: string | null;
  customerId?: string | null;

  // Package info
  description: string;
  weightKg: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  } | null;

  // Locations
  pickupAddress: Address;
  deliveryAddress: Address;
  currentLocation?: Coordinates | null;

  // Timestamps
  scheduledPickup?: string | null;
  actualPickup?: string | null;
  estimatedDelivery?: string | null;
  actualDelivery?: string | null;
  createdAt: string;
  updatedAt: string;

  // Financials — stored in kobo (1 NGN = 100 kobo)
  priceKobo: number;
  isPaid: boolean;

  // Populated relations (present when backend joins them)
  driver?: Driver | null;
  customer?: User | null;
  business?: Business | null;
  events?: ShipmentEvent[];
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  message: string;
  location?: Coordinates | null;
  createdAt: string;
}

// ─── Driver ───────────────────────────────────────────────────────────────────

export type DriverStatus = "available" | "on_delivery" | "offline";
export type VehicleType = "bike" | "car" | "van" | "truck";

export interface NotificationPreferences {
  newDelivery:      { push: boolean; email: boolean };
  pickupReminder:   { push: boolean; email: boolean };
  deliveryComplete: { push: boolean; email: boolean };
  deliveryFailed:   { push: boolean; email: boolean };
  customerMessage:  { push: boolean; email: boolean };
  ratingReceived:   { push: boolean; email: boolean };
  payoutProcessed:  { push: boolean; email: boolean };
  weeklyReport:     { push: boolean; email: boolean };
}

export interface Driver {
  id: string;
  userId: string;
  user: User;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel?: string | null;
  vehicleColor?: string | null;
  vehicleYear?: string | null;
  vehicleInsurance?: string | null;
  notificationPreferences?: NotificationPreferences | null;
  status: DriverStatus;
  currentLocation?: Coordinates | null;
  rating: number;
  totalDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Business ─────────────────────────────────────────────────────────────────

export interface Business {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  logo?: string | null;
  address?: Address | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Business analytics (returned by GET /business/analytics) ─────────────────

export interface BusinessAnalytics {
  statusBreakdown: Partial<Record<ShipmentStatus, number>>;
  totalShipments: number;
  totalRevenueKobo: number;
  recentShipments: Shipment[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = "email" | "sms" | "push";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  status?: string;
  metadata?: string | null;
  createdAt: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Format kobo (1/100 NGN) as a Naira currency string */
export function formatKobo(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}
