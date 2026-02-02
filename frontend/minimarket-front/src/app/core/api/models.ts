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
