import type { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../services/subscription.services";
import type { SubscriptionPlanFeatures } from "../schemas/shop.schema";

/**
 * Middleware to validate that the shop has an active subscription
 * Checks subscription status from Core Platform (with Redis caching)
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get shopId from authenticated request
    const auth = (req as any).auth;
    if (!auth || !auth.shopId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const { shopId } = auth;

    // Get shop data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(shopId);

    if (!coreStore) {
      res.status(403).json({
        error: "Active Subscription Required",
        message: "Unable to verify shop subscription. Please contact support.",
      });
      return;
    }

    // Check if shop is active
    if (coreStore.status !== "ACTIVE") {
      res.status(403).json({
        error: "Store Inactive",
        message: `Store status is ${coreStore.status}. Please activate your shop to continue.`,
      });
      return;
    }

    // Get subscription data for shop owner (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(shopId);

    if (!validation.valid) {
      res.status(403).json({
        error: "Active Subscription Required",
        message:
          validation.reason ||
          "Active subscription required to perform this action",
        subscriptionStatus: validation.subscription?.status || "NONE",
      });
      return;
    }

    // Attach subscription and shop info to request for downstream use
    (req as any).subscription = {
      data: validation.subscription,
      shop: coreStore,
      features: validation.subscription?.plan?.features || {},
    };

    next();
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to validate subscription",
    });
  }
};

/**
 * Middleware variant for operations that need graceful degradation
 * Adds subscription info if available but doesn't block the request
 */
export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = (req as any).auth;
    if (!auth || !auth.shopId) {
      next();
      return;
    }

    const { shopId } = auth;

    // Get shop data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(shopId);

    if (!coreStore) {
      next();
      return;
    }

    // Get subscription data for shop owner (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(shopId);

    // Attach subscription info (even if invalid)
    (req as any).subscription = {
      valid: validation.valid,
      data: validation.subscription,
      shop: coreStore,
      features: validation.subscription?.plan?.features || {},
      reason: validation.reason,
    };

    next();
  } catch (error: any) {
    // Don't block request on error
    next();
  }
};

/**
 * Factory function to create middleware that checks for a specific feature
 * @param featureName - The name of the feature to check (e.g., "api_access", "custom_domain")
 * @param requireEnabled - Whether the feature must be enabled (true) or just present
 */
export const requireFeature = (
  featureName: string,
  requireEnabled: boolean = true,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Get shopId from authenticated request
      const auth = (req as any).auth;
      if (!auth || !auth.shopId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const { shopId } = auth;

      // Get shop from Core Platform (cached)
      const coreStore = await subscriptionService.getStoreData(shopId);

      if (!coreStore || coreStore.status !== "ACTIVE") {
        res.status(403).json({
          error: "Store Inactive",
          message: "Store must be active to use this feature",
        });
        return;
      }

      // Get subscription data for shop owner (cached)
      const validation =
        await subscriptionService.getValidatedSubscription(shopId);

      if (!validation.valid || !validation.subscription) {
        res.status(403).json({
          error: "Subscription Required",
          message: "Active subscription required to use this feature",
        });
        return;
      }

      const features: SubscriptionPlanFeatures =
        validation.subscription.plan.features;

      // Check if feature exists in plan
      if (!(featureName in features)) {
        res.status(403).json({
          error: "Feature Not Available",
          message: `The feature "${featureName}" is not available in your subscription plan`,
          upgradeRequired: true,
        });
        return;
      }

      // Check if feature is enabled (if required)
      if (requireEnabled && !(features as any)[featureName]) {
        res.status(403).json({
          error: "Feature Not Enabled",
          message: `The feature "${featureName}" is not enabled in your subscription plan`,
          upgradeRequired: true,
        });
        return;
      }

      // Attach feature info to request
      (req as any).feature = {
        name: featureName,
        enabled: (features as any)[featureName],
        allFeatures: features,
      };

      next();
    } catch (error: any) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify feature access",
      });
    }
  };
};
