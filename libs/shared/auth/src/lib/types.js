// 🔐 User role constants
export const ROLES = {
    BUYER: 'buyer',
    VENDOR: 'vendor',
    BUYER_VENDOR: 'buyer_vendor',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
};
// ✅ Role check helpers
export const isBuyer = (user) => user?.role === ROLES.BUYER;
export const isVendor = (user) => user?.role === ROLES.VENDOR;
export const isBuyerVendor = (user) => user?.role === ROLES.BUYER_VENDOR;
export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;
// 🧩 Combined helpers
export const isVendorOrBuyerVendor = (user) => user?.role === ROLES.VENDOR || user?.role === ROLES.BUYER_VENDOR;
export const isAdminOrSuperAdmin = (user) => user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
//# sourceMappingURL=types.js.map