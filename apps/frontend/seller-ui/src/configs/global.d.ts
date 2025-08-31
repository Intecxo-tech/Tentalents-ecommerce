// libs/shared/types/src/global.d.ts
import type { StaticImageData } from 'next/image';

/* ────────────────────────────────
   📦  Inventory
──────────────────────────────── */
export type InventoryStatus = 'Avail' | 'Restock' | 'Empty';

export type Variant = {
  id: number;
  name: string; // e.g., "Black / 128GB"
  stock: number;
  status: InventoryStatus;
};

export type InventoryItem = {
  id: number;
  variants: Variant[]; // ✅ New: List of variants
};
export type DropdownOption<T = string> = {
  label: string;
  value: T;
};
/* ────────────────────────────────
   🛍️  Product
──────────────────────────────── */
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: StaticImageData;
  inventory: InventoryItem;
   sold?: number;
   
};
interface RawVendorOrder {
  id: string;
  orderId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  dispatchStatus: string;
  product: {
    id: string;
    title: string;
    imageUrls: string[];
  };
  order: {
    shippingAddress: {
      city: string;
      // other address fields if needed
    };
    paymentStatus: string;
    status: string;
  };
}
/* ────────────────────────────────
   📦  Orders
──────────────────────────────── */
export type OrderStatus =
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'fulfilled'
  | 'in process'
  | 'refunded'
  | 'unfulfilled'
  | 'paid, in process'
  | 'paid, fulfilled'
  | 'unpaid, in process';
export interface VendorOrder {
  id: string;
  orderId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  dispatchStatus: string;
  product: {
    title: string;
    imageUrls: string[];
  };
}
export type ProductOrder = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  city: string;
  status: OrderStatus;
    paymentStatus?: string;     // e.g., "Paid", "Pending", "Cash on Delivery"
  dispatchStatus?: string; 
};

export {};
