import { prisma } from "../config/db.config";

if (require.main === module) {
  (async () => {
    console.log(await prisma.admin.findMany());
    console.log(await prisma.shop.findMany());
    const result = await prisma.admin.updateMany({
      where: { id: 1 },
      data: {
        password:
          "$2a$12$lPZwvy1FFz87pdOWlpdlj.VEDuZ/FiyvDAUsako5iOlbt/rshjxCu",
      },
    });

    await prisma.shop.update({
      where: { shopId: 10 },
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
