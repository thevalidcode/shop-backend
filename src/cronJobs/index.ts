import cron from "node-cron";
import { syncExchangeRates } from "../controllers/rate.controllers";

function startCronJobs() {
  cron.schedule("0 6,14,22 * * *", async () => {
    await syncExchangeRates();
  });
}

export { startCronJobs };
