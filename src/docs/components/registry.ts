import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

// Cookie-based auth
registry.registerComponent("securitySchemes", "CookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "auth_token",
});

// CSRF token in headers
registry.registerComponent("securitySchemes", "CsrfHeader", {
  type: "apiKey",
  in: "header",
  name: "x-csrf-token",
});

// CSRF token in cookies
registry.registerComponent("securitySchemes", "CsrfCookie", {
  type: "apiKey",
  in: "cookie",
  name: "csrf_token",
});

// Origin token in cookies
registry.registerComponent("securitySchemes", "OriginHeader", {
  type: "apiKey",
  in: "header",
  name: "origin",
});

export { registry };
