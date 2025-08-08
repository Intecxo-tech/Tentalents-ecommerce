export declare const ROLES: {
    readonly BUYER: "buyer";
    readonly VENDOR: "vendor";
    readonly BUYER_VENDOR: "buyer_vendor";
    readonly ADMIN: "admin";
    readonly SUPER_ADMIN: "super_admin";
};
export declare type UserRole = (typeof ROLES)[keyof typeof ROLES];
export interface AuthPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export declare const isBuyer: (user?: AuthPayload) => boolean;
export declare const isVendor: (user?: AuthPayload) => boolean;
export declare const isBuyerVendor: (user?: AuthPayload) => boolean;
export declare const isAdmin: (user?: AuthPayload) => boolean;
export declare const isSuperAdmin: (user?: AuthPayload) => boolean;
export declare const isVendorOrBuyerVendor: (user?: AuthPayload) => boolean;
export declare const isAdminOrSuperAdmin: (user?: AuthPayload) => boolean;
//# sourceMappingURL=types.d.ts.map