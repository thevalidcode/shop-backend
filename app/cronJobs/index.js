"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const currency_1 = require("../utils/currency");
function startCronJobs() {
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, currency_1.saveRates)();
    });
}
