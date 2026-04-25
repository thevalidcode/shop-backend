import { z } from "zod";
import { ShippingInfoSchema } from "../../schemas/shippingInfo.schema";

export const CreateShippingInfoResponse = {
  description: "Shipping information created successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        data: ShippingInfoSchema,
      }),
    },
  },
};

export const GetShippingInfoListResponse = {
  description: "List of shipping information for user",
  content: {
    "application/json": {
      schema: z.object({
        data: z.array(ShippingInfoSchema),
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

export const GetShippingInfoResponse = {
  description: "Single shipping information retrieved",
  content: {
    "application/json": {
      schema: z.object({
        data: ShippingInfoSchema,
      }),
    },
  },
};

export const UpdateShippingInfoResponse = {
  description: "Shipping information updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        data: ShippingInfoSchema,
      }),
    },
  },
};

export const DeleteShippingInfoResponse = {
  description: "Shipping information deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        message: z.string(),
      }),
    },
  },
};

export const GetDefaultShippingInfoResponse = {
  description: "Default shipping information retrieved",
  content: {
    "application/json": {
      schema: z.object({
        data: ShippingInfoSchema,
      }),
    },
  },
};
