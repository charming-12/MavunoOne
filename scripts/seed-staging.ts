import { eq, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

const isPreview = process.env.VERCEL_ENV === "preview";
const isStaging = process.env.MAVUNO_ENVIRONMENT === "staging";

if (!isPreview || !isStaging) {
  throw new Error("Refusing to seed: this script is allowed only on a Vercel Preview with MAVUNO_ENVIRONMENT=staging.");
}

const CLEAN_START_MARKER = "staging.training-zero-state.v2";
const protectedUsers = [
  { name: "Staging Boss", email: "boss.staging@mavunoone.test", phone: "+255700000101", jobTitle: "Boss", role: "boss" as const },
  { name: "Staging Admin", email: "admin.staging@mavunoone.test", phone: "+255700000102", jobTitle: "Administrator", role: "admin" as const },
];

const getStagingPassword = () => {
  const value = process.env.MAVUNO_STAGING_TEST_PASSWORD;
  if (!value || value.length < 12) {
    throw new Error("MAVUNO_STAGING_TEST_PASSWORD must be configured and at least 12 characters long.");
  }
  return value;
};

async function main() {
  const passwordHash = await hashPassword(getStagingPassword());

  await db.transaction(async (tx) => {
    const existingMarker = await tx
      .select({ id: schema.configurations.id })
      .from(schema.configurations)
      .where(eq(schema.configurations.key, CLEAN_START_MARKER))
      .limit(1);
    const needsCleanStart = existingMarker.length === 0;

    const protectedEmails = protectedUsers.map((user) => user.email);
    let protectedAdminId: number | null = null;

    for (const user of protectedUsers) {
      const [saved] = await tx
        .insert(schema.users)
        .values({ ...user, passwordHash, isActive: true })
        .onConflictDoUpdate({
          target: schema.users.email,
          set: {
            name: user.name,
            phone: user.phone,
            jobTitle: user.jobTitle,
            role: user.role,
            passwordHash,
            isActive: true,
            passwordResetToken: null,
            passwordResetExpires: null,
          },
        })
        .returning({ id: schema.users.id, email: schema.users.email });
      if (!saved) throw new Error(`Could not initialize protected account ${user.email}.`);
      if (user.email === "admin.staging@mavunoone.test") protectedAdminId = saved.id;
    }

    if (needsCleanStart) {
      // This branch runs once, only in the isolated staging Preview database.
      // It intentionally removes test transactions and all non-protected seed users.
      await tx.delete(schema.farmerPaymentApprovals);
      await tx.delete(schema.farmerPayments);
      await tx.delete(schema.stockReconciliations);
      await tx.delete(schema.saleItems);
      await tx.delete(schema.sales);
      await tx.delete(schema.stockOut);
      await tx.delete(schema.stockIn);
      await tx.delete(schema.deliveries);
      await tx.delete(schema.vehicles);
      await tx.delete(schema.machineJobs);
      await tx.delete(schema.maintenanceCosts);
      await tx.delete(schema.expenses);
      await tx.delete(schema.dailyClosures);
      await tx.delete(schema.notifications);
      await tx.delete(schema.customers);
      await tx.delete(schema.farmers);
      await tx.delete(schema.errorLogs);
      await tx.delete(schema.auditLogs);
      await tx.delete(schema.passwordResetTokens);
      await tx.delete(schema.products);
      await tx.delete(schema.categories);

      const removableUsers = await tx
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(notInArray(schema.users.email, protectedEmails));
      for (const user of removableUsers) {
        await tx.delete(schema.users).where(eq(schema.users.id, user.id));
      }
    }

    const [animalFeedsCategory] = await tx
      .insert(schema.categories)
      .values({ name: "Animal Feeds", description: "Chakula cha mifugo na malighafi zake" })
      .onConflictDoNothing()
      .returning({ id: schema.categories.id });
    const category = animalFeedsCategory ?? (await tx
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.name, "Animal Feeds"))
      .limit(1))[0];
    if (!category) throw new Error("Animal Feeds category could not be initialized.");

    const existingUduvi = await tx
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.name, "Uduvi / Fishmeal"))
      .limit(1);
    if (existingUduvi.length === 0) {
      await tx.insert(schema.products).values({
        name: "Uduvi / Fishmeal",
        categoryId: category.id,
        unit: "kg",
        costPrice: "4000",
        sellPrice: "6000",
        wholesalePrice: "5500",
        lowStockThreshold: "15",
        currentStock: "0",
        isActive: true,
        isPublic: true,
      });
    }

    const internalProducts: Array<typeof schema.products.$inferInsert> = [
      { name: "Mahindi", productType: "raw_material", unit: "kg", packageSizeKg: "1", costPrice: "0", sellPrice: "0", wholesalePrice: "0", lowStockThreshold: "0", currentStock: "0", isActive: true, isPublic: false },
      { name: "Unga wa Mahindi", productType: "finished_goods", unit: "kg", packageSizeKg: "1", costPrice: "0", sellPrice: "0", wholesalePrice: "0", lowStockThreshold: "0", currentStock: "0", isActive: true, isPublic: false },
      { name: "Alizeti", productType: "raw_material", unit: "kg", packageSizeKg: "1", costPrice: "0", sellPrice: "0", wholesalePrice: "0", lowStockThreshold: "0", currentStock: "0", isActive: true, isPublic: false },
      { name: "Mafuta ya Alizeti", productType: "finished_goods", unit: "litre", packageSizeKg: "1", costPrice: "0", sellPrice: "0", wholesalePrice: "0", lowStockThreshold: "0", currentStock: "0", isActive: true, isPublic: false },
      { name: "Chokaa ya Animal Feed", productType: "animal_feed", unit: "kg", packageSizeKg: "1", costPrice: "0", sellPrice: "0", wholesalePrice: "0", lowStockThreshold: "0", currentStock: "0", isActive: true, isPublic: false },
    ];
    for (const product of internalProducts) {
      const existing = await tx.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.name, product.name)).limit(1);
      if (existing.length === 0) await tx.insert(schema.products).values(product);
    }

    if (needsCleanStart) {
      await tx.insert(schema.configurations).values({
        key: CLEAN_START_MARKER,
        value: "completed",
        description: "One-time staging training workspace clean start completed; future deployments preserve manual data.",
        isEncrypted: false,
        updatedBy: protectedAdminId,
      });
    }
  });

  console.log("Staging training workspace ready: protected Boss/Admin retained; only Uduvi / Fishmeal retained; future manual data is preserved.");
}

main().catch((error) => {
  console.error("Staging seed failed:", error);
  process.exit(1);
});

export {};

