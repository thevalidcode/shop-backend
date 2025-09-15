import { registry } from "../components/registry";
import { CreateOrderSchema } from "../../schemas/checkout.schema";
import { OrderSchema } from "../../schemas/order.schema";
import { BadRequest, Forbidden, ServerError } from "../responses/common.response";

registry.registerPath({
  method: "post",
  path: "/checkouts",
  summary: "Create an order from the user's cart",
  description: "Atomically creates an order, decrements stock, and clears the user's cart.",
  tags: ["Checkout"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateOrderSchema } } },
  },
  responses: {
    201: {
      description: "Order created successfully.",
      content: { "application/json": { schema: OrderSchema } },
    },
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});