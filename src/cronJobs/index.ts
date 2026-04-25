import cron from "node-cron";
import { syncExchangeRates } from "../controllers/rate.controllers";
import {
  syncAllSupplierOrders,
  updateExistingSupplierOrders,
} from "../providers/order.provider";
import {
  syncAllSupplierProducts,
  updateExistingSupplierProducts,
} from "../providers/supplier.provider";

function startCronJobs() {
  cron.schedule("*/5 * * * *", () => {
    updateExistingSupplierOrders();
  });

  cron.schedule("0 */3 * * *", () => {
    updateExistingSupplierProducts();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    syncAllSupplierProducts();
    syncAllSupplierOrders();
  });

  cron.schedule("0 6,14,22 * * *", async () => {
    await syncExchangeRates();
  });
}

export { startCronJobs };
