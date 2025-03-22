export interface DeliveryPartner {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    currentLoad: number; 
    areas: string[];
    shift: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
    metrics: {
      rating: number;
      completedOrders: number;
      cancelledOrders: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface PartnerFormData {
    _id: string;
    name: string;
    phone: string;
    email: string;
    areas: string[];
    status: "active" | "inactive";
    shift: {
      start: string;
      end: string;
    };
  }
  
  
  export interface DeliveryPartnerMetrics {
    totalActive: number;
    avgRating: number;
    topAreas: string[];
  }
  
  // Order related interfaces
  export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
  }
  
  export interface Customer {
    name: string;
    phone: string;
    address: string;
  }
  
  export interface Order {
    _id?: string;
    orderNumber: string;
    customer: Customer;
    area: string;
    items: OrderItem[];
    status: 'pending' | 'assigned' | 'picked' | 'delivered';
    scheduledFor: string; // HH:mm
    assignedTo?: string; // partner ID
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface OrderFilters {
    status: string[];
    areas: string[];
    date: string;
  }
  
  // Assignment related interfaces
  export interface Assignment {
    _id?: string;
    orderId: string;
    partnerId: string;
    timestamp: Date;
    status: 'success' | 'failed';
    reason?: string;
  }
  
  export interface FailureReason {
    reason: string;
    count: number;
  }
  
  export interface AssignmentMetrics {
    totalAssigned: number;
    successRate: number;
    averageTime: number;
    failureReasons: FailureReason[];
  }
  
  export interface PartnerAvailability {
    available: number;
    busy: number;
    offline: number;
  }
  
  // Page props interfaces
  export interface DashboardPageProps {
    partners: DeliveryPartner[];
    orders: Order[];
    assignments: Assignment[];
    metrics: {
      totalOrders: number;
      completedOrders: number;
      activePartners: number;
    };
  }
  
  export interface PartnersPageProps {
    partners: DeliveryPartner[];
    metrics: DeliveryPartnerMetrics;
  }
  
  export interface OrdersPageProps {
    orders: Order[];
    filters: OrderFilters;
  }
  
  export interface AssignmentPageProps {
    activeAssignments: Assignment[];
    metrics: AssignmentMetrics;
    partners: PartnerAvailability;
  }
  
  // API response interfaces
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T> {
    count: number;
    page: number;
    totalPages: number;
  }