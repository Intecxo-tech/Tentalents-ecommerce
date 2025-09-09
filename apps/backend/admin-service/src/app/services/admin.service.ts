import {
  PrismaClient,
  User,
  Vendor,
  UserRole ,
  VendorStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

export const adminService = {
  getAllUsers: async (): Promise<
    Array<{
      id: string;
      email: string;
      role: UserRole;
      vendorStatus: VendorStatus | null;
    }>
  > => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        vendor: {
          select: {
            status: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      vendorStatus: user.vendor?.status ?? null,
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
