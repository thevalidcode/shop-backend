import type { Request, Response } from "express";
import {
  CreateBillingInfoSchema,
  UpdateBillingInfoSchema,
  GetBillingInfoQuerySchema,
  BillingInfoParamsSchema,
} from "../schemas/billingInfo.schema";
import * as billingInfoService from "../services/billingInfo.services";
import { UserAuthSchema } from "../schemas/user.schema";

export const createBillingInfo = async (req: Request, res: Response) => {
  const parsed = CreateBillingInfoSchema.safeParse(req.body);
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user, shopId } = authParsed.data;
  user.shopId = shopId;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const billingInfo = await billingInfoService.createBillingInfo(
      user,
      parsed.data
    );
    res.status(201).json({ status: "success", data: billingInfo });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const getUserBillingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const queryParsed = GetBillingInfoQuerySchema.safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        query: !queryParsed.success ? queryParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { page, limit } = queryParsed.data;

  try {
    const result = await billingInfoService.getUserBillingInfo(
      user,
      page,
      limit
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBillingInfoByUid = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = BillingInfoParamsSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const billingInfo = await billingInfoService.getBillingInfoByUid(user, uid);
    res.status(200).json({ data: billingInfo });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateBillingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = BillingInfoParamsSchema.safeParse(req.params);
  const bodyParsed = UpdateBillingInfoSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const billingInfo = await billingInfoService.updateBillingInfo(
      user,
      uid,
      bodyParsed.data
    );
    res.status(200).json({ status: "success", data: billingInfo });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const deleteBillingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = BillingInfoParamsSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const result = await billingInfoService.deleteBillingInfo(user, uid);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDefaultBillingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;

  try {
    const billingInfo = await billingInfoService.getDefaultBillingInfo(user);
    if (!billingInfo) {
      res.status(404).json({ error: "No default billing information found" });
      return;
    }
    res.status(200).json({ data: billingInfo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
