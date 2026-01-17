import { z } from "zod";
import { BillingInfoSchema } from "../../schemas/billingInfo.schema";

export const CreateBillingInfoResponse = {
  description: "Billing information created successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        data: BillingInfoSchema,
      }),
    },
  },
};

export const GetBillingInfoListResponse = {
  description: "List of billing information for user",
  content: {
    "application/json": {
      schema: z.object({
        data: z.array(BillingInfoSchema),
        pagination: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number(),
        }),
      }),
    },
  },
};

export const GetBillingInfoResponse = {
  description: "Single billing information retrieved",
  content: {
    "application/json": {
      schema: z.object({
        data: BillingInfoSchema,
      }),
    },
  },
};

export const UpdateBillingInfoResponse = {
  description: "Billing information updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        data: BillingInfoSchema,
      }),
    },
  },
};

export const DeleteBillingInfoResponse = {
  description: "Billing information deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        message: z.string(),
      }),
    },
  },
};

export const GetDefaultBillingInfoResponse = {
  description: "Default billing information retrieved",
  content: {
    "application/json": {
      schema: z.object({
        data: BillingInfoSchema,
      }),
    },
  },
};
