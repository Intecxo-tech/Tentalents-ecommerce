import {
  PrismaClient,
  User,
  Vendor,
  UserRole ,
  VendorStatus,
  BankDetail,
   ProductListing,  // ✅ Add this
  Product,
} from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export const adminService = {
   createAdminWithVendor: async (): Promise<{
    user: User;
    vendor: Vendor;
  }> => {
    const username = 'tentalents@gmail.com';
    const plainPassword = 'GST234MH45';

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: username },  // Assuming email is used as username
    });

    if (existingUser) {
      throw new Error(`User with username ${username} already exists.`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create user with role 'ADMIN' (assuming 'ADMIN' is a valid UserRole)
    const user = await prisma.user.create({
      data: {
        email: username,
        password: hashedPassword,  // Assuming you have a password field in User model
        role: 'admin',
      },
    });

    // Create vendor linked to this user (you can adjust vendor data accordingly)
    const vendor = await prisma.vendor.create({
    data: {
    userId: user.id,
    status: VendorStatus.approved, // use enum value here for better type safety
    name: 'Tentalents',
    email: 'tentalents@gmail.com',
    businessName: 'Admin Business',
  },
    });

    return { user, vendor };
  },
  getAllVendorsWithProducts: async (): Promise<
  (Vendor & {
    user: Pick<User, 'id' | 'email' | 'password' | 'role'> | null;
    productListings: (ProductListing & { product: Product })[];
  })[]
> => {
  return prisma.vendor.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          password: true, // hashed password, for admin view only
          role: true,
        },
      },
      productListings: {
        include: {
          product: true,
        },
      },
    },
  });
},

getAllUsers: async (): Promise<
  Array<{
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    altPhone: string | null;
    role: UserRole;
    profileImage: string | null;
    addresses: Array<{
      id: string;
      name: string;
      phone: string;
      country: string;
      state: string;
      city: string;
      pinCode: string;
      addressLine1: string;
      addressLine2: string | null;
      addressType: string;
      isDefault: boolean;
    }>;
    vendor: {
      id: string;
      name: string;
      email: string;
      businessName: string;
      phone: string | null;
      status: VendorStatus;
      gstNumber: string | null;
      panNumber: string | null;
      AadharNumber: string | null;
  
    } | null;
  }>
> => {
  const users = await prisma.user.findMany({
    include: {
      addresses: {
        select: {
          id: true,
          name: true,
          phone: true,
          country: true,
          state: true,
          city: true,
          pinCode: true,
          addressLine1: true,
          addressLine2: true,
          addressType: true,
          isDefault: true,
        },
      },
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          phone: true,
          status: true,
          gstNumber: true,
          panNumber: true,
          AadharNumber: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    altPhone: user.altPhone,
    role: user.role,
    profileImage: user.profileImage,
    addresses: user.addresses,
    vendor: user.vendor,
  }));
},


  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const validRoles: UserRole[] = Object.values(UserRole);

    if (!validRoles.includes(role)) {
      throw new Error(`Invalid user role: ${role}`);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },

 getPendingVendors: async (): Promise<
  (Vendor & {
    user: Pick<User, 'id' | 'email' | 'role'> | null;
    bankDetail: Pick<
      BankDetail,
      | 'id'
      | 'accountHolder'
      | 'accountNumber'
      | 'ifscCode'
      | 'bankName'
      | 'branchName'
      | 'upiId'
      | 'isVerified'
      | 'cancelledcheque'
    > | null;
  })[]
> => {
  return prisma.vendor.findMany({
    where: { status: VendorStatus.pending },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      bankDetail: {
        select: {
          id: true,
          accountHolder: true,
          accountNumber: true,
          ifscCode: true,
          bankName: true,
          branchName: true,
          upiId: true,
          isVerified: true,
          cancelledcheque: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
},


  updateVendorStatus: async (
    vendorId: string,
    approve: boolean
  ): Promise<Vendor> => {
    const newStatus: VendorStatus = approve
      ? VendorStatus.approved
      : VendorStatus.rejected;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error(`Vendor not found with ID: ${vendorId}`);
    }

    return prisma.vendor.update({
      where: { id: vendorId },
      data: { status: newStatus },
    });
  },

  getDashboardSummary: async (): Promise<{
    userCount: number;
    vendorCount: number;
  }> => {
    const [userCount, vendorCount] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
    ]);

    return { userCount, vendorCount };
  },
  getAllVendors: async (): Promise<
  (Vendor & {
    user: Pick<User, 'id' | 'email' | 'role'> | null;
  })[]
> => {
  return prisma.vendor.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
},

};
