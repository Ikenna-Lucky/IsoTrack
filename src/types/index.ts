// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "business" | "driver" | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
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

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

export interface Shipment {
  id: string;
  trackingId: string;
  status: ShipmentStatus;

  // Parties
  businessId: string;
  driverId?: string;
  customerId?: string;

  // Package info
  description: string;
  weight: number; // kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  // Locations
  pickupAddress: Address;
  deliveryAddress: Address;

  // Timestamps
  scheduledPickup?: string;
  actualPickup?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;

  // Financials
  price: number; // in kobo (NGN smallest unit)
  isPaid: boolean;
  paymentReference?: string;

  // Relations
  driver?: Driver;
  events?: ShipmentEvent[];
  currentLocation?: Coordinates;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  message: string;
  location?: Coordinates;
  timestamp: string;
}

// ─── Driver ───────────────────────────────────────────────────────────────────

export type DriverStatus = "available" | "on_delivery" | "offline";

export interface Driver {
  id: string;
  userId: string;
  user: User;
  vehicleType: "bike" | "car" | "van" | "truck";
  vehiclePlate: string;
  status: DriverStatus;
  currentLocation?: Coordinates;
  rating: number;
  totalDeliveries: number;
}

// ─── Business ─────────────────────────────────────────────────────────────────

export interface Business {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  logo?: string;
  address: Address;
  totalShipments: number;
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
  createdAt: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export interface WsLocationUpdate {
  shipmentId: string;
  driverId: string;
  coordinates: Coordinates;
  timestamp: string;
}

export interface WsStatusUpdate {
  shipmentId: string;
  status: ShipmentStatus;
  message: string;
  timestamp: string;
}

export type WsEvent =
  | { event: "location:update"; data: WsLocationUpdate }
  | { event: "status:update"; data: WsStatusUpdate }
  | { event: "driver:connected"; data: { driverId: string } }
  | { event: "driver:disconnected"; data: { driverId: string } };
