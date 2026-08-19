import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { customers, products, saleItems, sales } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { checkRateLimit, formatResetTime, getClientId, RATE_LIMITS } from "@/lib/rate-limit";

const orderSchema = z.object({
  fullName: z.string().trim().min(2).max(256),
  phone: z.string().trim().min(9).max(32),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  address: z.string().trim().min(4).max(512),
  city: z.string().trim().min(2).max(64),
  paymentMethod: z.enum(["cash", "mpesa", "tigopesa", "bank"]),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().positive().max(100000) })).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`shop-order:${getClientId(request)}`, RATE_LIMITS.PUBLIC);
  if (!rate.allowed) return NextResponse.json({ message: `Oda nyingi zimetumwa. Jaribu tena baada ya ${formatResetTime(rate.resetTime)}.` }, { status: 429 });
  try {
    const input = orderSchema.parse(await request.json());
    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const catalog = await db.query.products.findMany({
      where: and(inArray(products.id, productIds), eq(products.isActive, true)),
    });
    const catalogById = new Map(catalog.map((product) => [product.id, product]));
    if (catalog.length !== productIds.length) {
      return NextResponse.json({ message: "Baadhi ya bidhaa hazipatikani tena kwenye Shop." }, { status: 400 });
    }

    const pricedItems = input.items.map((item) => {
      const product = catalogById.get(item.productId)!;
      const packageSizeKg = Number(product.packageSizeKg || 1);
      const baseQuantity = item.quantity * packageSizeKg;
      if (Number(product.currentStock || 0) < baseQuantity) {
        throw new Error(`Stock haitoshi kwa ${product.name}.`);
      }
      const unitPrice = Number(product.sellPrice || 0);
      return { item, product, packageSizeKg, baseQuantity, unitPrice, total: unitPrice * item.quantity };
    });
    const subtotal = pricedItems.reduce((sum, entry) => sum + entry.total, 0);
    const tax = subtotal * 0.18;
    const totalAmount = subtotal + tax;
    const invoiceNumber = `SHOP-${Date.now()}-${randomInt(100, 1000)}`;

    const result = await db.transaction(async (tx) => {
      const existingCustomer = await tx.query.customers.findFirst({ where: eq(customers.phone, input.phone) });
      const customer = existingCustomer ?? (await tx.insert(customers).values({
        name: input.fullName,
        phone: input.phone,
        email: input.email || null,
        customerType: "retail",
        balance: "0",
        creditLimit: "0",
        isActive: true,
      }).returning())[0];

      const [sale] = await tx.insert(sales).values({
        invoiceNumber,
        customerId: customer?.id,
        customerType: "shop",
        totalAmount: totalAmount.toFixed(2),
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        paidAmount: "0",
        balance: totalAmount.toFixed(2),
        status: "pending",
        cashierId: null,
      }).returning();

      await tx.insert(saleItems).values(pricedItems.map(({ item, product, baseQuantity, unitPrice, total }) => ({
        saleId: sale.id,
        productId: product.id,
        quantity: item.quantity.toFixed(2),
        baseQuantity: baseQuantity.toFixed(3),
        unitPrice: unitPrice.toFixed(2),
        discount: "0",
        total: total.toFixed(2),
      })));

      return { id: sale.id, invoiceNumber, totalAmount };
    });

    await recordAuditLog({
      action: "create",
      tableName: "sales",
      recordId: result.id,
      newValue: { source: "public_shop", invoiceNumber: result.invoiceNumber, paymentMethod: input.paymentMethod, itemCount: input.items.length, deliveryCity: input.city },
    });

    return NextResponse.json({
      success: true,
      orderNumber: result.invoiceNumber,
      totalAmount: result.totalAmount,
      status: "pending",
      message: "Oda limepokelewa. Timu ya MavunoOne itawasiliana nawe kuthibitisha stock, delivery na malipo.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message: "Taarifa za oda hazijakamilika au zina format isiyokubalika." }, { status: 400 });
    console.error("Public shop order failed:", error);
    return NextResponse.json({ message: "Oda haikuweza kuhifadhiwa kwa sasa. Jaribu tena baadaye." }, { status: 500 });
  }
}
