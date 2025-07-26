"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = void 0;
// This file centralizes all path registrations
const registry_1 = require("../components/registry");
Object.defineProperty(exports, "registry", { enumerable: true, get: function () { return registry_1.registry; } });
require("./user.paths");
require("./product.paths");
require("./category.paths");
require("./shop.paths");
require("./auth.paths");
require("./order.paths");
require("./blog.paths");
require("./faq.paths");
