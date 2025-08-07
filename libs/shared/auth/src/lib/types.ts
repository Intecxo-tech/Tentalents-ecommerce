// 🔐 User role constants
export const ROLES = {
  BUYER: 'buyer',
  VENDOR: 'vendor',
  BUYER_VENDOR: 'buyer_vendor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// 🎯 Type: Role values
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// 👤 Type: Authenticated user payload
export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number; // Issued at (for JWT)
  exp?: number; // Expiry (for JWT)
}

// ✅ Role check helpers
export const isBuyer = (user?: AuthPayload) => user?.role === ROLES.BUYER;
export const isVendor = (user?: AuthPayload) => user?.role === ROLES.VENDOR;
export const isBuyerVendor = (user?: AuthPayload) => user?.role === ROLES.BUYER_VENDOR;
export const isAdmin = (user?: AuthPayload) => user?.role === ROLES.ADMIN;
export const isSuperAdmin = (user?: AuthPayload) => user?.role === ROLES.SUPER_ADMIN;

// 🧩 Combined helpers
export const isVendorOrBuyerVendor = (user?: AuthPayload) =>
  user?.role === ROLES.VENDOR || user?.role === ROLES.BUYER_VENDOR;

export const isAdminOrSuperAdmin = (user?: AuthPayload) =>
  user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
