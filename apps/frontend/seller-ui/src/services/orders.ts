// src/types/orders.ts

export interface Product {
  id: string;
  title: string;
  imageUrls?: string[];
  originalPrice?: string;
}

export interface ShippingAddress {
  city: string;
  street?: string;
  state?: string;
  zip?: string;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus?: string;
  dispatchStatus?: string;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  paymentMethod?: string;
}

export interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  product?: Product;
  order?: Order;
  createdAt: string;
}