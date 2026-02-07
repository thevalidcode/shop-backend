import {
  LogoVars,
  TemplateResult,
  DesignColors,
} from "../components/EmailLayout";
import {
  forgotPassword,
  passwordChanged,
  welcomeEmail,
  accountVerified,
  accountSuspended,
  ForgotPasswordVars,
  WelcomeEmailVars,
  AccountVerifiedVars,
  AccountSuspendedVars,
} from "./user.templates";
import {
  adminForgotPassword,
  adminPasswordChanged,
  AdminForgotPasswordVars,
} from "./admin.templates";
import {
  orderConfirmed,
  orderShipped,
  orderDelivered,
  orderCanceled,
  orderRefunded,
  newOrderNotification,
  orderCanceledAdmin,
  refundRequestedAdmin,
  OrderConfirmedVars,
  OrderShippedVars,
  OrderDeliveredVars,
  OrderCanceledVars,
  OrderRefundedVars,
  NewOrderNotificationVars,
  OrderCanceledAdminVars,
  RefundRequestedAdminVars,
} from "./order.templates";
import {
  reviewApproved,
  reviewRejected,
  newReviewNotification,
  ReviewApprovedVars,
  ReviewRejectedVars,
  NewReviewNotificationVars,
} from "./review.templates";
import {
  paymentSuccessful,
  paymentFailed,
  refundProcessed,
  PaymentSuccessfulVars,
  PaymentFailedVars,
  RefundProcessedVars,
} from "./payment.templates";
import {
  ticketCreated,
  ticketUpdated,
  ticketResolved,
  newTicketNotification,
  TicketCreatedVars,
  TicketUpdatedVars,
  TicketResolvedVars,
  NewTicketNotificationVars,
} from "./support.templates";
import {
  shipmentCreated,
  orderInTransit,
  orderDeliveredShipping,
  failedDelivery,
  ShipmentCreatedVars,
  OrderInTransitVars,
  OrderDeliveredShippingVars,
  FailedDeliveryVars,
} from "./shipping.templates";
import {
  lowStockAlert,
  outOfStockAlert,
  LowStockAlertVars,
  OutOfStockAlertVars,
} from "./product.templates";

interface StoreSettings {
  logoUrl: string;
  shopName: string;
  shopUrl: string;
  designColors?: DesignColors;
}

// Map each template type string to the specific variable type it expects
export interface EmailTemplateVars {
  // User templates
  FORGOT_PASSWORD: ForgotPasswordVars;
  PASSWORD_CHANGED: LogoVars;
  WELCOME_EMAIL: WelcomeEmailVars;
  ACCOUNT_VERIFIED: AccountVerifiedVars;
  ACCOUNT_SUSPENDED: AccountSuspendedVars;

  // Admin templates
  ADMIN_FORGOT_PASSWORD: AdminForgotPasswordVars;
  ADMIN_PASSWORD_CHANGED: LogoVars;

  // Order templates (User)
  ORDER_CONFIRMED: OrderConfirmedVars;
  ORDER_SHIPPED: OrderShippedVars;
  ORDER_DELIVERED: OrderDeliveredVars;
  ORDER_CANCELED: OrderCanceledVars;
  ORDER_REFUNDED: OrderRefundedVars;

  // Order templates (Admin)
  NEW_ORDER_NOTIFICATION: NewOrderNotificationVars;
  ORDER_CANCELED_ADMIN: OrderCanceledAdminVars;
  REFUND_REQUESTED_ADMIN: RefundRequestedAdminVars;

  // Review templates (User)
  REVIEW_APPROVED: ReviewApprovedVars;
  REVIEW_REJECTED: ReviewRejectedVars;

  // Review templates (Admin)
  NEW_REVIEW_NOTIFICATION: NewReviewNotificationVars;

  // Payment templates
  PAYMENT_SUCCESSFUL: PaymentSuccessfulVars;
  PAYMENT_FAILED: PaymentFailedVars;
  REFUND_PROCESSED: RefundProcessedVars;

  // Support templates (User)
  TICKET_CREATED: TicketCreatedVars;
  TICKET_UPDATED: TicketUpdatedVars;
  TICKET_RESOLVED: TicketResolvedVars;

  // Support templates (Admin)
  NEW_TICKET_NOTIFICATION: NewTicketNotificationVars;

  // Shipping templates (User)
  SHIPMENT_CREATED: ShipmentCreatedVars;
  ORDER_IN_TRANSIT: OrderInTransitVars;
  ORDER_DELIVERED_SHIPPING: OrderDeliveredShippingVars;
  FAILED_DELIVERY: FailedDeliveryVars;

  // Product templates (Admin)
  LOW_STOCK_ALERT: LowStockAlertVars;
  OUT_OF_STOCK_ALERT: OutOfStockAlertVars;
}

// Typed templates for dev-time safety
const typedTemplates: {
  [K in keyof EmailTemplateVars]: (
    vars: EmailTemplateVars[K],
    shopSettings: StoreSettings,
  ) => TemplateResult;
} = {
  // User templates
  FORGOT_PASSWORD: forgotPassword,
  PASSWORD_CHANGED: passwordChanged,
  WELCOME_EMAIL: welcomeEmail,
  ACCOUNT_VERIFIED: accountVerified,
  ACCOUNT_SUSPENDED: accountSuspended,

  // Admin templates
  ADMIN_FORGOT_PASSWORD: adminForgotPassword,
  ADMIN_PASSWORD_CHANGED: adminPasswordChanged,

  // Order templates (User)
  ORDER_CONFIRMED: orderConfirmed,
  ORDER_SHIPPED: orderShipped,
  ORDER_DELIVERED: orderDelivered,
  ORDER_CANCELED: orderCanceled,
  ORDER_REFUNDED: orderRefunded,

  ORDER_CANCELED_ADMIN: orderCanceledAdmin,
  REFUND_REQUESTED_ADMIN: refundRequestedAdmin,
  // Order templates (Admin)
  NEW_ORDER_NOTIFICATION: newOrderNotification,

  // Review templates (User)
  REVIEW_APPROVED: reviewApproved,
  REVIEW_REJECTED: reviewRejected,

  // Review templates (Admin)
  NEW_REVIEW_NOTIFICATION: newReviewNotification,

  // Payment templates
  PAYMENT_SUCCESSFUL: paymentSuccessful,
  PAYMENT_FAILED: paymentFailed,
  REFUND_PROCESSED: refundProcessed,

  // Support templates (User)
  TICKET_CREATED: ticketCreated,
  TICKET_UPDATED: ticketUpdated,
  TICKET_RESOLVED: ticketResolved,

  // Support templates (Admin)
  NEW_TICKET_NOTIFICATION: newTicketNotification,

  // Shipping templates (User)

  // Product templates (Admin)
  LOW_STOCK_ALERT: lowStockAlert,
  OUT_OF_STOCK_ALERT: outOfStockAlert,
  SHIPMENT_CREATED: shipmentCreated,
  ORDER_IN_TRANSIT: orderInTransit,
  ORDER_DELIVERED_SHIPPING: orderDeliveredShipping,
  FAILED_DELIVERY: failedDelivery,
};

/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - Template type as string
 * @param variables - Variables specific to that template
 * @param shopSettings - Store-specific settings (logo, name, url)
 * @returns Rendered email HTML and subject
 */
export function getTemplate<K extends keyof EmailTemplateVars>(
  type: K,
  variables: Record<string, any>,
  shopSettings: StoreSettings,
): TemplateResult {
  const templateFn = typedTemplates[type as keyof typeof typedTemplates] as
    | ((
        vars: Record<string, any>,
        shopSettings: StoreSettings,
      ) => TemplateResult)
    | undefined;
  if (!templateFn) {
    throw new Error(`Email template for type "${type}" not found.`);
  }

  return templateFn(variables, shopSettings);
}
