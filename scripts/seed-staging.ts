import "dotenv/config";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

const isPreview = process.env.VERCEL_ENV === "preview";
const isStaging = process.env.MAVUNO_ENVIRONMENT === "staging";

if (!isPreview || !isStaging) {
  throw new Error("Refusing to seed: this script is allowed only on a Vercel Preview with MAVUNO_ENVIRONMENT=staging.");
}

const getStagingPassword = () => {
  const value = process.env.MAVUNO_STAGING_TEST_PASSWORD;
  if (!value || value.length < 12) {
    throw new Error("MAVUNO_STAGING_TEST_PASSWORD must be configured and at least 12 characters long.");
  }
  return value;
};

const roleUsers = [
  { name: "Staging Boss", email: "boss.staging@mavunoone.test", phone: "+255700000101", jobTitle: "Boss", role: "boss" as const },
  { name: "Staging Admin", email: "admin.staging@mavunoone.test", phone: "+255700000102", jobTitle: "Administrator", role: "admin" as const },
  { name: "Staging Operations Manager", email: "manager.staging@mavunoone.test", phone: "+255700000103", jobTitle: "Operations Manager", role: "manager" as const },
  { name: "Staging Cashier", email: "cashier.staging@mavunoone.test", phone: "+255700000104", jobTitle: "Cashier", role: "cashier" as const },
  { name: "Staging Storekeeper", email: "storekeeper.staging@mavunoone.test", phone: "+255700000105", jobTitle: "Storekeeper", role: "storekeeper" as const },
];

const categories = [
  { name: "Mahindi", description: "Mahindi na bidhaa zinazotokana na mahindi" },
  { name: "Alizeti", description: "Alizeti na bidhaa zinazotokana na alizeti" },
  { name: "Animal Feeds", description: "Chakula cha mifugo na malighafi zake" },
  { name: "Mafuta", description: "Mafuta ya alizeti kwa litre" },
];

async function main() {
  const passwordHash = await hashPassword(getStagingPassword());

  await db.transaction(async (tx) => {
    // This reset is intentionally limited to the isolated Preview database.
    await tx.delete(schema.saleItems);
    await tx.delete(schema.sales);
    await tx.delete(schema.stockOut);
    await tx.delete(schema.stockIn);
    await tx.delete(schema.deliveries);
    await tx.delete(schema.vehicles);
    await tx.delete(schema.machineJobs);
    await tx.delete(schema.expenses);
    await tx.delete(schema.dailyClosures);
    await tx.delete(schema.notifications);
    await tx.delete(schema.customers);
    await tx.delete(schema.products);
    await tx.delete(schema.categories);
    await tx.delete(schema.users);

    await tx.insert(schema.users).values(roleUsers.map((user) => ({ ...user, passwordHash, isActive: true })));
    const insertedCategories = await tx.insert(schema.categories).values(categories).returning();
    const categoryByName = new Map(insertedCategories.map((category) => [category.name, category.id]));
    const categoryId = (name: string) => {
      const id = categoryByName.get(name);
      if (id === undefined) throw new Error(`Missing staging category: ${name}`);
      return id;
    };

    await tx.insert(schema.products).values([
      { name: "Mahindi", productType: "raw_material", categoryId: categoryId("Mahindi"), unit: "kg", packageSizeKg: "1", costPrice: "800", sellPrice: "1200", wholesalePrice: "1000", lowStockThreshold: "50", currentStock: "500", isActive: true, isPublic: true, imageUrl: "/products/maize-cobs-commons.jpg" },
      { name: "Unga wa Mahindi", productType: "finished_goods", categoryId: categoryId("Mahindi"), unit: "kg", packageSizeKg: "1", costPrice: "1200", sellPrice: "1800", wholesalePrice: "1500", lowStockThreshold: "30", currentStock: "200", isActive: true, isPublic: true, imageUrl: "/products/maize-flour.jpg" },
      { name: "Alizeti", productType: "raw_material", categoryId: categoryId("Alizeti"), unit: "kg", packageSizeKg: "1", costPrice: "3000", sellPrice: "4500", wholesalePrice: "4000", lowStockThreshold: "20", currentStock: "150", isActive: true, isPublic: true, imageUrl: "/products/sunflower-flower-commons.jpg" },
      { name: "Mafuta ya Alizeti", productType: "finished_goods", categoryId: categoryId("Mafuta"), unit: "litre", packageSizeKg: "0.92", costPrice: "8000", sellPrice: "12000", wholesalePrice: "10000", lowStockThreshold: "10", currentStock: "80", isActive: true, isPublic: true, imageUrl: "/products/sunflower-oil-sizes.jpg" },
      { name: "Uduvi / Fishmeal", productType: "animal_feed", categoryId: categoryId("Animal Feeds"), unit: "kg", packageSizeKg: "1", costPrice: "4000", sellPrice: "6000", wholesalePrice: "5500", lowStockThreshold: "15", currentStock: "90", isActive: true, isPublic: true, imageUrl: "/products/uduv-fishmeal-neutral.jpg" },
      { name: "Chokaa ya Animal Feed", productType: "animal_feed", categoryId: categoryId("Animal Feeds"), unit: "kg", packageSizeKg: "1", costPrice: "500", sellPrice: "800", wholesalePrice: "700", lowStockThreshold: "40", currentStock: "300", isActive: true, isPublic: true, imageUrl: "/products/chokaa-feed-grade.jpg" },
    ]);
  });

  console.log("Staging seed complete: 5 role users, 4 categories, 6 products.");
  console.log("Test emails:", roleUsers.map((user) => user.email).join(", "));
}

main().catch((error) => {
  console.error("Staging seed failed:", error);
  process.exit(1);
});

export {};

