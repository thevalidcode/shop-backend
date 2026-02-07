import { z } from "zod";
import { ProductPublicSchema } from "../../schemas/product.schema";
import { ProductStatus } from "../../../prisma/generated";

// ======================= SHARED SCHEMAS =======================

const CountByEnumSchema = z.object({
  status: z.string().optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  productUid: z.string().optional(),
  _count: z.object({
    status: z.number().optional(),
    role: z.number().optional(),
    type: z.number().optional(),
    productUid: z.number().optional(),
  }),
});

const SumByEnumSchema = z.object({
  status: z.string(),
  _sum: z.object({
    amount: z.number().optional(),
  }),
});

// ======================= ADMIN RESPONSES =======================

export const AdminOverviewResponse = {
  description: "Admin overview statistics",
  content: {
    "application/json": {
      schema: z.object({
        totalOrders: z.number(),
        totalRevenue: z.number(),
        totalUsers: z.number(),
        totalProducts: z.number(),
        pendingOrders: z.number(),
        completedOrders: z.number(),
        activeProducts: z.number(),
        totalCategories: z.number(),
      }),
    },
  },
};

export const AdminOrderStatsResponse = {
  description: "Admin order statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        ordersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const AdminPaymentStatsResponse = {
  description: "Admin payment statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        paymentsByStatus: z.array(SumByEnumSchema),
      }),
    },
  },
};

export const AdminUserStatsResponse = {
  description: "Admin user statistics grouped by role and status",
  content: {
    "application/json": {
      schema: z.object({
        usersByRole: z.array(CountByEnumSchema),
        usersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const AdminProductStatsResponse = {
  description: "Admin product statistics grouped by category and status",
  content: {
    "application/json": {
      schema: z.object({
        productsByStatus: z.array(CountByEnumSchema),
        productsByCategory: z.array(
          z.object({
            categoryUid: z.string().nullable(),
            _count: z.object({
              categoryUid: z.number(),
            }),
          }),
        ),
        featuredProducts: z.number(),
        lowStockProducts: z.number(),
        totalProducts: z.number(),
      }),
    },
  },
};

// ======================= USER RESPONSES =======================

export const UserDashboardResponse = {
  description: "User overview statistics",
  content: {
    "application/json": {
      schema: z.object({
        yourOrders: z.number(),
        yourSpent: z.number(),
        shopOrders: z.number(),
        canceledOrders: z.number(),
        ordersData: z.array(
          z.object({
            month: z.string(),
            orders: z.number(),
            delivered: z.number(),
            amount: z.number(),
          }),
        ),
        recentlyAddedProducts: z.array(
          z.object({
            shopScopedId: z.number(),
            id: z.number(),
            uid: z.string(),
            name: z.string(),
            imageUrl: z.string().nullable(),
            price: z.number(),
            comparePrice: z.number().nullable(),
            stock: z.number(),
            isFeatured: z.boolean(),
            status: z.nativeEnum(ProductStatus),
            date: z.string(),
            categoryName: z.string(),
            categoryUid: z.string().nullable(),
          }),
        ),
        paymentsData: z.array(
          z.object({
            month: z.string(),
            successful: z.number(),
            failed: z.number(),
          }),
        ),
      }),
    },
  },
};

export const UserOrderStatsResponse = {
  description: "User order statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        ordersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const UserPaymentStatsResponse = {
  description: "User payment statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        paymentsByStatus: z.array(SumByEnumSchema),
      }),
    },
  },
};

export const UserProductStatsResponse = {
  description: "User product usage statistics grouped by product",
  content: {
    "application/json": {
      schema: z.object({
        productUsage: z.array(CountByEnumSchema),
      }),
    },
  },
};
