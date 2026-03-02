import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    const result = await prisma.admin.update({
      where: { id: 1, shopId: 1 },
      data: {
        password:
          "$2a$12$lPZwvy1FFz87pdOWlpdlj.VEDuZ/FiyvDAUsako5iOlbt/rshjxCu",
      },
    });

    await prisma.shop.update({
      where: { shopId: 1 },
      data: {
        status: "ACTIVE",
      },
    });

    console.log("Admin updated successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error updating shop:", err);
    process.exit(1);
  });
}
