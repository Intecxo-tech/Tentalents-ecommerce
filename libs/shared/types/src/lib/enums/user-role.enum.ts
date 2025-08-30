export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'vendor',         // Updated to lowercase 'vendor' instead of 'VENDOR'
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  BUYER_SELLER = 'buyer_vendor', // combined buyer and vendor role
}
