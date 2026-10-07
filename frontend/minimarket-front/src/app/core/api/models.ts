
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // index page (0-based)
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  category: string;
  price: number;
  currency: string;
  mainImageUrl?: string;
  active: boolean;
  images?: ProductImage[];
}

/** Corps des requêtes de création / modification de produit (back-office). */
export interface ProductPayload {
  name: string;
  sku: string;
  description?: string;
  brand?: string;
  model?: string;
  category: string;
  price: number;
  currency: string;
  mainImageUrl?: string;
  active?: boolean;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface AdminStats {
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  byStatus: Record<OrderStatus, number>;
  last14Days: { day: string; revenue: number; orders: number }[];
  topProducts: { productId: string; quantity: number }[];
}

export interface CartLine {
  productId: string;
  name: string;
  brand?: string;
  unitPrice: number;
  currency: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerEmail: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

export interface OrderResponse {
  id: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}
