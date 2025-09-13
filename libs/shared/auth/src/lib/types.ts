export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  BUYER_SELLER: 'buyer_seller',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  VENDOR: 'vendor',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface AuthPayload {
  userId?: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  vendorId?: string;
}

export const isBuyer = (user?: AuthPayload) => user?.role === ROLES.BUYER;
export const isSeller = (user?: AuthPayload) => user?.role === ROLES.SELLER;
export const isAdmin = (user?: AuthPayload) => user?.role === ROLES.ADMIN;
