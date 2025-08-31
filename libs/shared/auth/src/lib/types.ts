// Define constant ROLES object
export const ROLES = {
 BUYER: 'buyer',
  SELLER: 'seller',
  BUYER_SELLER: 'buyer_seller',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  VENDOR: 'vendor',
} as const;

// Create union type from ROLES values
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface AuthPayload {
  userId?: string; // optional for vendors
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  vendorId?: string;
}

// ✅ Role-check helpers using ROLES constant
export const isBuyer = (user?: AuthPayload) => user?.role === ROLES.BUYER;
export const isSeller = (user?: AuthPayload) => user?.role === ROLES.SELLER;
export const isBuyerSeller = (user?: AuthPayload) =>
  user?.role === ROLES.BUYER_SELLER;
export const isAdmin = (user?: AuthPayload) => user?.role === ROLES.ADMIN;
export const isSuperAdmin = (user?: AuthPayload) =>
  user?.role === ROLES.SUPER_ADMIN;