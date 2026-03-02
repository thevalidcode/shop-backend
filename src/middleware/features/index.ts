import { Request, Response, NextFunction } from "express";
import { AdminAuthSchema } from "../../schemas/admin.schema";
import { SubscriptionPlanFeaturesSchema } from "../../schemas/shop.schema";
import { subscriptionService } from "../../services/subscription.services";
import { prisma } from "../../config/db.config";

/**
 * Middleware to check if automated shipping is allowed for the shop
 */
export async function checkAutomatedShippingAllowed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  try {
    const subscription = await subscriptionService.getSubscription(shopId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { max_shipping_accounts } = featuresParsed.data;

    if (!max_shipping_accounts || max_shipping_accounts === 0) {
      return res.status(403).json({
        error: "Automated shipping not allowed",
        message:
          "Your current plan does not include automated shipping features. Please upgrade your plan to access this feature.",
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking automated shipping feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop can connect more shipping accounts
 */
export async function checkShippingAccountLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  try {
    const [subscription, currentCount] = await Promise.all([
      subscriptionService.getSubscription(shopId),
      prisma.shippingAccount.count({
        where: { shopId, isActive: true },
      }),
    ]);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { max_shipping_accounts } = featuresParsed.data;

    if (currentCount >= max_shipping_accounts) {
      return res.status(403).json({
        error: "Shipping account limit reached",
        message: `Your current plan allows a maximum of ${max_shipping_accounts} shipping account(s). You currently have ${currentCount} active account(s). Please upgrade your plan or deactivate an existing account.`,
        limit: max_shipping_accounts,
        current: currentCount,
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking shipping account limit:", error);
    res.status(500).json({
      error: "Failed to verify account limit",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop can add more payment gateways
 */
export async function checkPaymentGatewayLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  try {
    const [subscription, currentCount] = await Promise.all([
      subscriptionService.getSubscription(shopId),
      prisma.paymentGateway.count({
        where: { shopId, status: "ACTIVE" },
      }),
    ]);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { payment_gateways } = featuresParsed.data;

    if (currentCount >= payment_gateways) {
      return res.status(403).json({
        error: "Payment gateway limit reached",
        message: `Your current plan allows a maximum of ${payment_gateways} payment gateway(s). You currently have ${currentCount} active gateway(s). Please upgrade your plan or deactivate an existing gateway.`,
        limit: payment_gateways,
        current: currentCount,
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking payment gateway limit:", error);
    res.status(500).json({
      error: "Failed to verify gateway limit",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop can add more products
 */
export async function checkProductLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  try {
    const [subscription, currentCount] = await Promise.all([
      subscriptionService.getSubscription(shopId),
      prisma.product.count({
        where: { shopId, status: "ACTIVE" },
      }),
    ]);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { unlimited_products, products } = featuresParsed.data;

    // If unlimited_products is true, allow
    if (unlimited_products) {
      return next();
    }

    // If products is null, deny creation (no limit set means 0 allowed)
    if (products === null || products === undefined) {
      return res.status(403).json({
        error: "Product limit not configured",
        message:
          "Your current plan does not have a product limit configured. Please contact support or upgrade your plan.",
      });
    }

    // Check against product limit
    if (currentCount >= products) {
      return res.status(403).json({
        error: "Product limit reached",
        message: `Your current plan allows a maximum of ${products} product(s). You currently have ${currentCount} active product(s). Please upgrade your plan to add more products.`,
        limit: products,
        current: currentCount,
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking product limit:", error);
    res.status(500).json({
      error: "Failed to verify product limit",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop can hide platform banner
 */
export async function checkHidePlatformBanner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  // Only check if trying to hide the banner (showBanner: false)
  if (req.body.showBanner !== false) {
    return next();
  }

  try {
    const subscription = await subscriptionService.getSubscription(shopId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { hide_platform_banner } = featuresParsed.data;

    if (!hide_platform_banner) {
      return res.status(403).json({
        error: "Hide platform banner not allowed",
        message:
          "Your current plan does not include the ability to hide the platform banner. Please upgrade your plan to access this feature.",
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking hide platform banner feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop can use custom branding
 */
export async function checkCustomBranding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    return res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;

  // Only check if trying to update branding elements
  const hasBrandingUpdate =
    req.body.logoUrl !== undefined ||
    req.body.faviconUrl !== undefined ||
    req.body.name !== undefined ||
    req.body.hex !== undefined ||
    req.body.schema !== undefined;

  if (!hasBrandingUpdate) {
    return next();
  }

  try {
    const subscription = await subscriptionService.getSubscription(shopId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { custom_branding } = featuresParsed.data;

    if (!custom_branding) {
      return res.status(403).json({
        error: "Custom branding not allowed",
        message:
          "Your current plan does not include custom branding features. Please upgrade your plan to customize your logo, favicon, and design styles.",
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking custom branding feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if shop has analytics access
 */
export async function checkAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { shopId } = req.auth!;

  try {
    const subscription = await subscriptionService.getSubscription(shopId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const featuresParsed = SubscriptionPlanFeaturesSchema.safeParse(
      subscription.plan.features,
    );

    if (!featuresParsed.success) {
      return res.status(500).json({
        error: "Invalid shop features configuration",
        details: featuresParsed.error.flatten(),
      });
    }

    const { analytics } = featuresParsed.data;

    if (!analytics) {
      return res.status(403).json({
        error: "Analytics not allowed",
        message:
          "Your current plan does not include analytics features. Please upgrade your plan to access analytics.",
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking analytics feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}
