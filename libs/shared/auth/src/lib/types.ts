// Define constant ROLES object
export const ROLES = {
  BUYER: 'buyer',
  VENDOR: 'vendor', // Replaced SELLER with VENDOR
  BUYER_VENDOR: 'buyer_vendor', // Combined role for buyer and vendor
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Create union type from ROLES values
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Auth payload to include optional userId and role (which can be an array of roles)
export interface AuthPayload {
  userId?: string;  // optional for vendors
  email: string;
  role: UserRole | UserRole[];  // Allowing role to be a single role or an array of roles
  iat?: number;
  exp?: number;
  vendorId?: string;
}

// Role-check helpers using ROLES constant

// Utility function to check if the user has a specific role
export const hasRole = (role: UserRole, user?: AuthPayload): boolean => {
  if (!user?.role) return false;
  // If role is an array, check if the role exists in the array, else check for single role
  return Array.isArray(user.role) ? user.role.includes(role) : user.role === role;
};

export const isBuyer = (user?: AuthPayload) => hasRole(ROLES.BUYER, user);
export const isVendor = (user?: AuthPayload) => hasRole(ROLES.VENDOR, user); // Updated to check for VENDOR
export const isBuyerVendor = (user?: AuthPayload) => hasRole(ROLES.BUYER_VENDOR, user); // For combined role
export const isAdmin = (user?: AuthPayload) => hasRole(ROLES.ADMIN, user);
export const isSuperAdmin = (user?: AuthPayload) => hasRole(ROLES.SUPER_ADMIN, user);
