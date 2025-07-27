import {
  ShopDataSchema,
  DesignStylesSchema,
  SiteDataSchema,
  ExchangeRatesSchema,
} from "../../schemas/shop.schema";
import { UserPublicSchema, AdminPublicSchema } from "../../schemas/user.schema";
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

export const SiteDataResponse = {
  description: "General site data",
  content: {
    "application/json": {
      schema: SiteDataSchema,
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

export const CurrentUserResponse = {
  description: "Current user record",
  content: {
    "application/json": {
      schema: UserPublicSchema,
    },
  },
};

export const CurrentAdminResponse = {
  description: "Current admin record",
  content: {
    "application/json": {
      schema: AdminPublicSchema,
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
