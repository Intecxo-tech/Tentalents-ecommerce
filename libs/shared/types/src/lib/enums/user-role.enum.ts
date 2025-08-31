export const UserRole = {
  BUYER: 'buyer',
  SELLER: 'seller', // represents vendors too
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  BUYER_SELLER: 'buyer_seller',
} as const;

// 🔐 Type for strict usage
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
