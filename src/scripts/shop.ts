import { CreateShop } from "../services/shop";
import { v4 as uuidv4 } from "uuid";

if (require.main === module) {
  (async () => {
    const result = await CreateShop({
      name: "Valid Shop",
      shopDomain: "localhost:3000",
      adminUid: uuidv4(),
      shopId: 1,
      adminId: 1,
      description: "Your trusted shop for quality products and exceptional service.",
      planId: 1,
      adminEmail: "admin@validpanel.com",
      adminUsername: "validadmin",
      fullName: "Valid Admin",
    });

    console.log("Shop created successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error creating shop:", err);
    process.exit(1);
  });
}
