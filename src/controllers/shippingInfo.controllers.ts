import type { Request, Response } from "express";
import {
  CreateShippingInfoSchema,
  UpdateShippingInfoSchema,
  GetShippingInfoQuerySchema,
  ShippingInfoParamsSchema,
} from "../schemas/shippingInfo.schema";
import * as shippingInfoService from "../services/shippingInfo.services";
import { UserAuthSchema } from "../schemas/user.schema";

export const createShippingInfo = async (req: Request, res: Response) => {
  const parsed = CreateShippingInfoSchema.safeParse(req.body);
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
    const shippingInfo = await shippingInfoService.createShippingInfo(
      user,
      parsed.data
    );
    res.status(201).json({ status: "success", data: shippingInfo });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const getUserShippingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const queryParsed = GetShippingInfoQuerySchema.safeParse(req.query);

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
    const result = await shippingInfoService.getUserShippingInfo(
      user,
      page,
      limit
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getShippingInfoByUid = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = ShippingInfoParamsSchema.safeParse(req.params);

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
    const shippingInfo = await shippingInfoService.getShippingInfoByUid(user, uid);
    res.status(200).json({ data: shippingInfo });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateShippingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = ShippingInfoParamsSchema.safeParse(req.params);
  const bodyParsed = UpdateShippingInfoSchema.safeParse(req.body);

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
    const shippingInfo = await shippingInfoService.updateShippingInfo(
      user,
      uid,
      bodyParsed.data
    );
    res.status(200).json({ status: "success", data: shippingInfo });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const deleteShippingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = ShippingInfoParamsSchema.safeParse(req.params);

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
    const result = await shippingInfoService.deleteShippingInfo(user, uid);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDefaultShippingInfo = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;

  try {
    const shippingInfo = await shippingInfoService.getDefaultShippingInfo(user);
    if (!shippingInfo) {
      res.status(404).json({ error: "No default shipping information found" });
      return;
    }
    res.status(200).json({ data: shippingInfo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
