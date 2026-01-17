import { AdminSchema } from "../../schemas/admin.schema";
import {
  ShopDataSchema,
  DesignStylesSchema,
  ExchangeRatesSchema,
  ShopGeneralDataResponseSchema,
} from "../../schemas/shop.schema";
import { UserPublicSchema } from "../../schemas/user.schema";
import { z } from "zod";

export const ShopDataResponse = {
  description: "Shop Data lookup result",
  content: {
    "application/json": {
      schema: ShopDataSchema,
    },
  },
};

export const DesignStylesResponse = {
  description: "Design styles configuration",
  content: {
    "application/json": {
      schema: DesignStylesSchema,
    },
  },
};

export const GeneralDataResponse = {
  description: "General Data lookup result",
  content: {
    "application/json": {
      schema: ShopGeneralDataResponseSchema,
    },
  },
};

export const ExchangeRatesResponse = {
  description: "Latest currency exchange rates",
  content: {
    "application/json": {
      schema: ExchangeRatesSchema,
    },
  },
};

export const NotFound = {
  description: "Resource not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.string().describe("Error message"),
      }),
    },
  },
};

export const OnboardingCompletedResponse = {
  description: "Onboarding completed successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Onboarding completed"),
        setting: ShopGeneralDataResponseSchema,
      }),
    },
  },
};
