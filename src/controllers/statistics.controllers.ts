import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AdminAuthSchema } from "../schemas/admin.schema";

// Utility: Parse and validate auth
const parseAuth = (req: Request) => AdminAuthSchema.safeParse(req.auth);
function mNamesToIdx(m: string): number {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.indexOf(m);
}

// ======================= ADMIN STATISTICS =======================

export const getAdminOverview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const [
      totalOrders,
      orderRevenue,
      totalUsers,
      totalProducts,
      pendingOrders,
      completedOrders,
      activeProducts,
      totalCategories,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.category.count(),
    ]);

    res.status(200).json({
      totalOrders,
      totalRevenue: orderRevenue._sum.totalAmount ?? 0,
      totalUsers,
      totalProducts,
      pendingOrders,
      completedOrders,
      activeProducts,
      totalCategories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminOrderStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.status(200).json({ ordersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminPaymentStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ["status"],
      _sum: { amount: true },
    });

    res.status(200).json({ paymentsByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminUserStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    const usersByStatus = await prisma.user.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.status(200).json({ usersByRole, usersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminProductStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    // Get all products to calculate low stock
    const allProducts = await prisma.product.findMany({
      where: { trackInventory: true },
      select: { stock: true, lowStockThreshold: true },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.lowStockThreshold !== null && p.stock <= p.lowStockThreshold,
    ).length;

    const [
      productsByStatus,
      productsByCategory,
      featuredProducts,
      totalProducts,
    ] = await Promise.all([
      prisma.product.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.product.groupBy({
        by: ["categoryUid"],
        _count: { categoryUid: true },
      }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count(),
    ]);

    res.status(200).json({
      productsByStatus,
      productsByCategory,
      featuredProducts,
      lowStockProducts,
      totalProducts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ======================= USER STATISTICS =======================

export const getUserDashboardData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { shopId, uid } = req.auth!;

  try {
    // Fetch user's orders
    const [
      userOrders,
      totalStoreOrders,
      canceledOrders,
      recentlyAddedProducts,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { shopId, userUid: uid },
        include: { items: true },
        orderBy: { timestamp: "desc" },
      }),
      prisma.order.count({ where: { shopId } }),
      prisma.order.count({
        where: { shopId, status: "CANCELED", userUid: uid },
      }),
      prisma.product.findMany({
        where: { shopId, status: "ACTIVE" },
        orderBy: { timestamp: "desc" },
        take: 5,
        include: { category: true },
      }),
    ]);

    // Count and total spent
    const yourOrders = userOrders.length;
    const yourSpent = userOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    const formattedProducts = recentlyAddedProducts.map((p) => ({
      shopScopedId: p.shopScopedId,
      id: p.id,
      category: p.category,
      uid: p.uid,
      name: p.name,
      imageUrl: p.imageUrl,
      price: p.price,
      comparePrice: p.comparePrice,
      stock: p.stock,
      isFeatured: p.isFeatured,
      status: p.status,
      date: new Date(p.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      categoryName: p.category?.name || "Uncategorized",
      categoryUid: p.categoryUid,
    }));

    // Generate labels for the last 6 months (current month inclusive)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        orders: 0,
        delivered: 0,
        amount: 0,
      };
    });

    // Fill orders chart data with user's orders only
    userOrders.forEach((order) => {
      const d = new Date(order.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const target = last6Months.find(
        (m) => `${m.year}-${mNamesToIdx(m.month)}` === key,
      );
      if (target) {
        target.orders += 1;
        target.amount += Number(order.totalAmount);
        if (order.status === "DELIVERED") target.delivered += 1;
      }
    });

    // Fetch user's payments
    const payments = await prisma.payment.findMany({
      where: { shopId, userUid: uid },
    });

    const paymentsData = last6Months.map((m) => ({
      month: `${m.month}`,
      successful: 0,
      failed: 0,
    }));

    payments.forEach((payment) => {
      const d = new Date(payment.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const target = paymentsData.find(
        (p) => p.month === monthNames[d.getMonth()],
      );
      if (
        target &&
        `${d.getFullYear()}-${d.getMonth()}` ===
          `${last6Months.find((m) => m.month === target.month)?.year}-${mNamesToIdx(target.month)}`
      ) {
        if (payment.status === "SUCCESS") {
          target.successful += Number(payment.amount);
        } else if (payment.status === "FAILED") {
          target.failed += Number(payment.amount);
        }
      }
    });

    res.json({
      yourOrders,
      yourSpent,
      canceledOrders,
      shopOrders: totalStoreOrders,
      recentlyAddedProducts: formattedProducts,
      ordersData: last6Months.map((m) => ({
        month: `${m.month}`,
        orders: m.orders,
        delivered: m.delivered,
        amount: m.amount,
      })),
      paymentsData,
    });
  } catch (err: any) {
    console.error("Error fetching shop dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch shop dashboard data." });
  }
};

export const getUserOrderStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: { userUid: uid },
      _count: { status: true },
    });

    res.status(200).json({ ordersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPaymentStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ["status"],
      where: { userUid: uid },
      _sum: { amount: true },
    });

    res.status(200).json({ paymentsByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserProductStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const productUsage = await prisma.orderItem.groupBy({
      by: ["productUid"],
      where: { order: { userUid: uid } },
      _count: { productUid: true },
    });

    res.status(200).json({ productUsage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
