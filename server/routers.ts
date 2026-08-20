import { router, publicProcedure, protectedProcedure, officeProcedure, financeProcedure } from "./trpc";
import { z } from "zod";
import { db } from "@/lib/db";
import { 
  products, sales, saleItems, stockIn, stockOut, machineJobs,
  vehicles, deliveries, expenses, dailyClosures, notifications,
  customers, categories, users, auditLogs, publicContent, farmers, farmerPayments, maintenanceCosts,
  stockReconciliations, farmerPaymentApprovals
} from "@/drizzle/schema";
import { desc, eq, and, gt, gte, lte, inArray, isNull, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { recordAuditLog } from "@/lib/audit";
import { calculateTax, getTaxSettings } from "@/lib/tax";

const decimalString = (value?: number | string | null, fallback = "0") => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return fallback;
  }
  return String(value);
};

async function notifyRoles(roles: Array<typeof users.$inferSelect.role>, type: string, title: string, message: string) {
  const recipients = await db.select({ id: users.id }).from(users).where(inArray(users.role, roles));
  if (recipients.length === 0) return;
  await db.insert(notifications).values(recipients.map((recipient) => ({ type, title, message, userId: recipient.id, isRead: false })));
}

export const appRouter = router({
  // ===== PUBLIC CONTENT =====
  content: router({
    publicList: publicProcedure.query(async () => {
      return await db.select().from(publicContent).where(and(eq(publicContent.isPublic, true), eq(publicContent.status, "published"))).orderBy(publicContent.sortOrder, desc(publicContent.publishedAt));
    }),

    list: officeProcedure.query(async () => {
      return await db.select({
        id: publicContent.id,
        slug: publicContent.slug,
        contentType: publicContent.contentType,
        title: publicContent.title,
        subtitle: publicContent.subtitle,
        body: publicContent.body,
        imageUrl: publicContent.imageUrl,
        ctaLabel: publicContent.ctaLabel,
        ctaHref: publicContent.ctaHref,
        status: publicContent.status,
        isPublic: publicContent.isPublic,
        sortOrder: publicContent.sortOrder,
        createdBy: publicContent.createdBy,
        reviewedBy: publicContent.reviewedBy,
        publishedBy: publicContent.publishedBy,
        createdAt: publicContent.createdAt,
        updatedAt: publicContent.updatedAt,
        reviewedAt: publicContent.reviewedAt,
        publishedAt: publicContent.publishedAt,
        creatorName: users.name,
      }).from(publicContent).leftJoin(users, eq(publicContent.createdBy, users.id)).orderBy(desc(publicContent.updatedAt));
    }),

    save: officeProcedure.input(z.object({
      id: z.number().optional(),
      slug: z.string().trim().min(2).max(160),
      contentType: z.string().trim().min(2).max(32).default("announcement"),
      title: z.string().trim().min(2).max(256),
      subtitle: z.string().trim().max(512).optional(),
      body: z.string().trim().optional(),
      imageUrl: z.string().trim().url().optional().or(z.literal("")),
      ctaLabel: z.string().trim().max(128).optional(),
      ctaHref: z.string().trim().max(512).optional(),
      sortOrder: z.number().int().default(0),
    })).mutation(async ({ input, ctx }) => {
      const allowedRoles = ["admin", "owner"];
      if (!allowedRoles.includes(ctx.user.role)) throw new Error("Content management hairuhusiwi kwa role hii");
      const values = {
        slug: input.slug,
        contentType: input.contentType,
        title: input.title,
        subtitle: input.subtitle || null,
        body: input.body || null,
        imageUrl: input.imageUrl || null,
        ctaLabel: input.ctaLabel || null,
        ctaHref: input.ctaHref || null,
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      };
      if (input.id) {
        const before = await db.query.publicContent.findFirst({ where: eq(publicContent.id, input.id) });
        if (!before) throw new Error("Public content haipatikani");
        const [updated] = await db.update(publicContent).set({ ...values, status: "draft", isPublic: false, reviewedBy: null, publishedBy: null, reviewedAt: null, publishedAt: null }).where(eq(publicContent.id, input.id)).returning();
        await recordAuditLog({ userId: ctx.user.id, action: "update", tableName: "public_content", recordId: updated.id, oldValue: before, newValue: updated });
        return updated;
      }
      const [created] = await db.insert(publicContent).values({ ...values, createdBy: ctx.user.id, status: "draft", isPublic: false }).returning();
      await recordAuditLog({ userId: ctx.user.id, action: "create", tableName: "public_content", recordId: created.id, newValue: created });
      return created;
    }),

    changeStatus: officeProcedure.input(z.object({ id: z.number(), status: z.enum(["draft", "review", "approved", "published", "archived"]) })).mutation(async ({ input, ctx }) => {
      const content = await db.query.publicContent.findFirst({ where: eq(publicContent.id, input.id) });
      if (!content) throw new Error("Public content haipatikani");
      if (["review", "approved", "published"].includes(input.status) && !["admin", "owner"].includes(ctx.user.role)) throw new Error("Content review hairuhusiwi kwa role hii");
      if (input.status === "published" && !["admin", "owner"].includes(ctx.user.role)) throw new Error("Publish inaruhusiwa kwa Admin au Owner pekee");
      if (input.status === "published" && content.status !== "approved") throw new Error("Content lazima iidhinishwe kabla ya ku-publish");
      const [updated] = await db.update(publicContent).set({
        status: input.status,
        isPublic: input.status === "published",
        reviewedBy: input.status === "approved" ? ctx.user.id : content.reviewedBy,
        publishedBy: input.status === "published" ? ctx.user.id : input.status === "archived" ? null : content.publishedBy,
        reviewedAt: input.status === "approved" ? new Date() : content.reviewedAt,
        publishedAt: input.status === "published" ? new Date() : input.status === "archived" ? null : content.publishedAt,
        updatedAt: new Date(),
      }).where(eq(publicContent.id, input.id)).returning();
      await recordAuditLog({ userId: ctx.user.id, action: "status_change", tableName: "public_content", recordId: updated.id, oldValue: { status: content.status, isPublic: content.isPublic }, newValue: { status: updated.status, isPublic: updated.isPublic } });
      return updated;
    }),
  }),

  // ===== PRODUCTS =====
  products: router({
    list: officeProcedure.query(async () => {
      return await db.query.products.findMany({
        where: eq(products.isActive, true),
        orderBy: desc(products.name),
        limit: 500,
      });
    }),

    publicList: publicProcedure.query(async () => {
      return await db
        .select({
          id: products.id,
          name: products.name,
          productType: products.productType,
          unit: products.unit,
          packageSizeKg: products.packageSizeKg,
          sellPrice: products.sellPrice,
          currentStock: products.currentStock,
          lowStockThreshold: products.lowStockThreshold,
          imageUrl: products.imageUrl,
          available: sql<boolean>`${products.currentStock} > 0`,
        })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.name))
        .limit(500);
    }),
    
    create: officeProcedure
      .input(z.object({
        name: z.string().trim().min(1).max(160),
        barcode: z.string().trim().min(3).max(64).optional(),
        imageUrl: z.string().trim().max(1000).refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), "Picha lazima iwe local approved asset au HTTPS URL").optional(),
        productType: z.enum(["raw_material", "finished_goods", "animal_feed", "byproduct", "packaging", "service"]).default("finished_goods"),
        categoryId: z.number().optional(),
        unit: z.string().trim().min(1).max(32).default("kg"),
        packageSizeKg: z.number().positive().max(100000).default(1),
        costPrice: z.number().nonnegative(),
        sellPrice: z.number().nonnegative(),
        wholesalePrice: z.number().nonnegative().optional(),
        lowStockThreshold: z.number().nonnegative().default(10),
        currentStock: z.number().nonnegative().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!["admin", "manager"].includes(ctx.user?.role ?? "")) {
          throw new Error("Product catalog hairuhusiwi kwa role hii");
        }
        const [created] = await db.insert(products).values({
          ...input,
          barcode: input.barcode || undefined,
          productType: input.productType,
          packageSizeKg: decimalString(input.packageSizeKg),
          costPrice: decimalString(input.costPrice),
          sellPrice: decimalString(input.sellPrice),
          wholesalePrice: input.wholesalePrice !== undefined ? decimalString(input.wholesalePrice) : undefined,
          lowStockThreshold: decimalString(input.lowStockThreshold),
          currentStock: decimalString(input.currentStock * input.packageSizeKg),
        }).returning();
        await recordAuditLog({
          userId: ctx.user?.id,
          action: "create",
          tableName: "products",
          recordId: created?.id,
          newValue: { ...input, currentStockKg: input.currentStock * input.packageSizeKg },
        });
        return created;
      }),

    byBarcode: protectedProcedure.input(z.object({ barcode: z.string().min(3) })).query(async ({ input }) => {
      return await db.query.products.findFirst({ where: and(eq(products.barcode, input.barcode.trim()), eq(products.isActive, true)) });
    }),
    updatePricing: financeProcedure.input(z.object({ id: z.number(), costPrice: z.number().nonnegative(), sellPrice: z.number().nonnegative(), wholesalePrice: z.number().nonnegative().optional() })).mutation(async ({ input, ctx }) => {
      const isFinanceManager = ctx.user?.role === "manager" && ctx.user.jobTitle === "finance";
      if (!ctx.user || (!(ctx.user.role === "admin" || ctx.user.role === "owner") && !isFinanceManager)) {
        throw new Error("Kubadilisha bei kunaruhusiwa kwa Admin au Finance Manager pekee");
      }
      const before = await db.query.products.findFirst({ where: eq(products.id, input.id) });
      const [updated] = await db.update(products).set({ costPrice: decimalString(input.costPrice), sellPrice: decimalString(input.sellPrice), wholesalePrice: input.wholesalePrice === undefined ? undefined : decimalString(input.wholesalePrice), updatedAt: new Date() }).where(eq(products.id, input.id)).returning();
      if (!updated) throw new Error("Product haipatikani");
      await recordAuditLog({ userId: ctx.user?.id, action: "update", tableName: "products", recordId: updated.id, oldValue: before ? { costPrice: before.costPrice, sellPrice: before.sellPrice, wholesalePrice: before.wholesalePrice } : undefined, newValue: { costPrice: input.costPrice, sellPrice: input.sellPrice, wholesalePrice: input.wholesalePrice } });
      return updated;
    }),
    
    updateStock: officeProcedure
      .input(z.object({ id: z.number(), amount: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const [updated] = await db.update(products)
          .set({ currentStock: sql`currentStock + ${input.amount}` })
          .where(eq(products.id, input.id))
          .returning();

        if (updated) {
          await recordAuditLog({
            userId: ctx.user?.id,
            action: "update",
            tableName: "products",
            recordId: updated.id,
            newValue: { field: "currentStock", adjustment: input.amount, currentStock: updated.currentStock },
          });
        }

        try {
          if (updated && Number(updated.currentStock) <= Number(updated.lowStockThreshold)) {
            const manager = await db.query.users.findFirst({
              where: eq(users.role, "boss"),
            });

            if (manager?.phone) {
              const { sendStockAlertSms } = await import("@/server/utils/sms");
              await sendStockAlertSms(
                manager.phone,
                updated.name,
                Number(updated.currentStock),
                Number(updated.lowStockThreshold)
              );
            }
          }
        } catch (smsError) {
          console.error("[SMS] Failed to send low-stock alert:", smsError);
        }

        return updated;
      }),

    audit: protectedProcedure.query(async () => {
      return await db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        recordId: auditLogs.recordId,
        oldValueJson: auditLogs.oldValueJson,
        newValueJson: auditLogs.newValueJson,
        timestamp: auditLogs.timestamp,
        userName: users.name,
        userEmail: users.email,
      }).from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id)).where(eq(auditLogs.tableName, "products")).orderBy(desc(auditLogs.timestamp)).limit(200);
    }),

    lowStock: protectedProcedure.query(async () => {
      return await db.query.products.findMany({
        where: and(
          lte(products.currentStock, products.lowStockThreshold),
          eq(products.isActive, true)
        ),
      });
    }),

    stockMovementSummary: protectedProcedure.query(async () => {
      const [productRows, inRows, outRows] = await Promise.all([
        db.query.products.findMany({ where: eq(products.isActive, true), orderBy: desc(products.name), limit: 500 }),
        db.query.stockIn.findMany({ limit: 5000 }),
        db.query.stockOut.findMany({ limit: 5000 }),
      ]);
      const incoming = new Map<number, { units: number; kg: number }>();
      const outgoing = new Map<number, { units: number; kg: number }>();
      for (const row of inRows) {
        const kg = Number(row.baseQuantity || row.quantity || 0);
        const units = Number(row.quantity || 0);
        const current = incoming.get(row.productId) || { units: 0, kg: 0 };
        incoming.set(row.productId, { units: current.units + units, kg: current.kg + kg });
      }
      for (const row of outRows) {
        const kg = Number(row.baseQuantity || row.quantity || 0);
        const units = Number(row.quantity || 0);
        const current = outgoing.get(row.productId) || { units: 0, kg: 0 };
        outgoing.set(row.productId, { units: current.units + units, kg: current.kg + kg });
      }
      return productRows.map((product) => {
        const packageSizeKg = Number(product.packageSizeKg || 1);
        const stockKg = Number(product.currentStock || 0);
        const inMovement = incoming.get(product.id) || { units: 0, kg: 0 };
        const outMovement = outgoing.get(product.id) || { units: 0, kg: 0 };
        return {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          packageSizeKg,
          stockKg,
          balanceUnits: stockKg / packageSizeKg,
          stockInUnits: inMovement.units,
          stockInKg: inMovement.kg,
          stockOutUnits: outMovement.units,
          stockOutKg: outMovement.kg,
        };
      });
    }),
  }),

  // ===== SALES =====
  sales: router({
    list: protectedProcedure.query(async () => {
      const saleRows = await db.query.sales.findMany({ orderBy: desc(sales.createdAt), limit: 100 });
      const saleIds = saleRows.map((sale) => sale.id);
      const customerIds = saleRows.flatMap((sale) => sale.customerId ? [sale.customerId] : []);
      const [itemRows, customerRows] = await Promise.all([
        saleIds.length ? db.query.saleItems.findMany({ where: inArray(saleItems.saleId, saleIds) }) : Promise.resolve([]),
        customerIds.length ? db.query.customers.findMany({ where: inArray(customers.id, customerIds) }) : Promise.resolve([]),
      ]);
      const productIds = itemRows.map((item) => item.productId);
      const productRows = productIds.length ? await db.query.products.findMany({ where: inArray(products.id, productIds) }) : [];
      const itemCounts = new Map<number, number>();
      for (const item of itemRows) itemCounts.set(item.saleId, (itemCounts.get(item.saleId) ?? 0) + 1);
      const customerNames = new Map(customerRows.map((customer) => [customer.id, customer.name]));
      const productNames = new Map(productRows.map((product) => [product.id, product.name]));
      const productUnits = new Map(productRows.map((product) => [product.id, { unit: product.unit, packageSizeKg: product.packageSizeKg }]));
      return saleRows.map((sale) => ({
        ...sale,
        itemCount: itemCounts.get(sale.id) ?? 0,
        customerName: sale.customerId ? customerNames.get(sale.customerId) ?? "Customer" : "Walk-in customer",
        items: itemRows.filter((item) => item.saleId === sale.id).map((item) => ({
          productId: item.productId,
          productName: productNames.get(item.productId) ?? "Product",
          quantity: item.quantity,
          unit: productUnits.get(item.productId)?.unit ?? "unit",
          packageSizeKg: productUnits.get(item.productId)?.packageSizeKg ?? "1",
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      }));
    }),

    create: officeProcedure
      .input(z.object({
        customerId: z.number().optional(),
        customerType: z.string().default("walk_in"),
        totalAmount: z.number(),
        paymentMethod: z.string().default("cash"),
        paidAmount: z.number().optional(),
        balance: z.number().default(0),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
          discount: z.number().default(0),
          total: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.items.length === 0) throw new Error("Sale lazima iwe na bidhaa angalau moja");
        const normalizedItems = [] as Array<{ item: (typeof input.items)[number]; product: typeof products.$inferSelect; baseQuantity: number; unitPrice: number; lineTotal: number }>;
        for (const item of input.items) {
          if (item.quantity <= 0) throw new Error("Quantity lazima iwe zaidi ya sifuri");
          const product = await db.query.products.findFirst({ where: and(eq(products.id, item.productId), eq(products.isActive, true)) });
          if (!product) throw new Error(`Product haipatikani: ${item.productId}`);
          const baseQuantity = item.quantity * Number(product.packageSizeKg || 1);
          if (Number(product.currentStock) < baseQuantity) throw new Error(`Stock haitoshi kwa ${product.name}. Inayohitajika: ${baseQuantity} ${product.unit}; iliyopo: ${product.currentStock} kg base`);
          const unitPrice = Number(product.sellPrice || 0);
          const discount = Math.max(0, Math.min(Number(item.discount || 0), unitPrice * item.quantity));
          const lineTotal = (unitPrice * item.quantity) - discount;
          normalizedItems.push({ item, product, baseQuantity, unitPrice, lineTotal });
        }
        const invoiceNumber = `INV-${Date.now()}`;
        const subtotal = normalizedItems.reduce((sum, entry) => sum + entry.lineTotal, 0);
        const taxSettings = await getTaxSettings();
        const { taxAmount, totalAmount } = calculateTax(subtotal, taxSettings);

        const [newSale] = await db.insert(sales).values({
          invoiceNumber,
          customerId: input.customerId,
          customerType: input.customerType,
          subtotal: decimalString(subtotal),
          taxRate: taxSettings.enabled ? decimalString(taxSettings.rate) : "0",
          taxAmount: decimalString(taxAmount),
          totalAmount: decimalString(totalAmount),
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === "cash" ? "paid" : "pending",
          paidAmount: decimalString(input.paymentMethod === "cash" ? totalAmount : 0),
          balance: decimalString(input.paymentMethod === "cash" ? 0 : totalAmount),
          cashierId: ctx.user?.id,
        }).returning();

        for (const { item, product, baseQuantity, unitPrice, lineTotal } of normalizedItems) {
          await db.insert(saleItems).values({
            saleId: newSale.id,
            productId: item.productId,
            quantity: decimalString(item.quantity),
            baseQuantity: decimalString(baseQuantity),
            unitPrice: decimalString(unitPrice),
            discount: decimalString(Math.max(0, Math.min(Number(item.discount || 0), unitPrice * item.quantity))),
            total: decimalString(lineTotal),
          });

          const [updatedProduct] = await db.update(products)
            .set({ currentStock: sql`${products.currentStock} - ${baseQuantity}` })
            .where(and(eq(products.id, item.productId), gte(products.currentStock, decimalString(baseQuantity))))
            .returning();
          if (!updatedProduct) throw new Error(`Stock imebadilika wakati wa sale; tafadhali jaribu tena kwa product ${item.productId}`);
          await db.insert(stockOut).values({ productId: item.productId, quantity: decimalString(item.quantity), baseQuantity: decimalString(baseQuantity), reason: "sale", notes: `Sale ${invoiceNumber}: ${item.quantity} ${product.unit} = ${baseQuantity} kg` });
        }

        if (input.paymentMethod === "credit" && input.customerId) {
          const balanceValue = decimalString(input.balance);
          await db.update(customers)
            .set({ balance: sql`${customers.balance} + ${balanceValue}` })
            .where(eq(customers.id, input.customerId));
        }

        // ===== SMS HOOKS: sale receipt + low stock alerts =====
        // Best-effort: SMS failures must never fail the sale itself.
        try {
          if (input.customerId) {
            const customer = await db.query.customers.findFirst({
              where: eq(customers.id, input.customerId),
            });

            if (customer?.phone) {
              const { sendSalesReceiptSms } = await import("@/server/utils/sms");
              const saleEntries = await db.query.saleItems.findMany({
                where: eq(saleItems.saleId, newSale.id),
              });

              const itemDetails = [] as Array<{ name: string; quantity: number; price: number }>;
              for (const saleEntry of saleEntries) {
                const product = await db.query.products.findFirst({
                  where: eq(products.id, saleEntry.productId),
                });

                if (product) {
                  itemDetails.push({
                    name: product.name,
                    quantity: Number(saleEntry.quantity || 0),
                    price: Number(saleEntry.unitPrice || 0),
                  });
                }
              }

              await sendSalesReceiptSms(
                customer.phone,
                customer.name,
                invoiceNumber,
                itemDetails,
                Number(newSale.totalAmount || 0)
              );
            }
          }

          const { sendStockAlertSms } = await import("@/server/utils/sms");
          for (const item of input.items) {
            const product = await db.query.products.findFirst({
              where: eq(products.id, item.productId),
            });

            if (
              product &&
              Number(product.currentStock) <= Number(product.lowStockThreshold)
            ) {
              const manager = await db.query.users.findFirst({
                where: eq(users.role, "boss"),
              });

              if (manager?.phone) {
                await sendStockAlertSms(
                  manager.phone,
                  product.name,
                  Number(product.currentStock),
                  Number(product.lowStockThreshold)
                );
              }
            }
          }
        } catch (smsError) {
          console.error("[SMS] Failed to send sale-related notifications:", smsError);
        }

        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "sales", recordId: newSale.id, newValue: { invoiceNumber, subtotal, taxRate: taxSettings.enabled ? taxSettings.rate : 0, taxAmount, totalAmount, paymentMethod: input.paymentMethod, itemCount: input.items.length } });
        return { success: true, saleId: newSale.id, invoiceNumber, subtotal, taxRate: taxSettings.enabled ? taxSettings.rate : 0, taxAmount, totalAmount, paymentStatus: newSale.paymentStatus };
      }),
  }),

  // ===== STOCK =====
  stock: router({
    stockIn: router({
      list: protectedProcedure.query(async () => {
        return await db.query.stockIn.findMany({ orderBy: desc(stockIn.date), limit: 200 });
      }),

      create: officeProcedure
        .input(z.object({
          productId: z.number(),
          quantity: z.number().positive(),
          entryUnit: z.enum(["kg", "debe", "gunia", "unit"]).default("kg"),
          supplierName: z.string().trim().optional(),
          supplierPhone: z.string().trim().optional(),
          sourceType: z.enum(["supplier", "farmer", "production", "return", "other"]).default("supplier"),
          purchaseReference: z.string().trim().optional(),
          batchNumber: z.string().trim().optional(),
          vehicleReference: z.string().trim().optional(),
          warehouseLocation: z.string().trim().optional(),
          receivedBy: z.string().trim().optional(),
          qualityStatus: z.enum(["accepted", "hold", "rejected"]).default("accepted"),
          costPerUnit: z.number().nonnegative().default(0),
          notes: z.string().trim().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const product = await db.query.products.findFirst({ where: eq(products.id, input.productId) });
          if (!product) throw new Error("Product haipatikani");
          const packageSizeKg = Number(product.packageSizeKg || 1);
          if (!Number.isFinite(packageSizeKg) || packageSizeKg <= 0) throw new Error("Package size ya bidhaa si sahihi");
          const baseQuantity = input.entryUnit === "kg" ? input.quantity : input.quantity * packageSizeKg;
          const totalCost = input.quantity * input.costPerUnit;
          const receivedBy = input.receivedBy || ctx.user?.name || ctx.user?.email || "Office user";
          const [savedStockIn] = await db.transaction(async (tx) => {
            const [created] = await tx.insert(stockIn).values({
              productId: input.productId,
              quantity: decimalString(input.quantity),
              entryUnit: input.entryUnit,
              baseQuantity: decimalString(baseQuantity),
              supplierName: input.supplierName,
              supplierPhone: input.supplierPhone,
              sourceType: input.sourceType,
              purchaseReference: input.purchaseReference,
              batchNumber: input.batchNumber,
              vehicleReference: input.vehicleReference,
              warehouseLocation: input.warehouseLocation,
              receivedBy,
              qualityStatus: input.qualityStatus,
              costPerUnit: decimalString(input.costPerUnit),
              totalCost: decimalString(totalCost),
              notes: `${input.notes || ""} Received: ${input.quantity} ${input.entryUnit} = ${baseQuantity} kg`.trim(),
            }).returning();
            if (input.qualityStatus !== "rejected") {
              await tx.update(products)
                .set({ currentStock: sql`${products.currentStock} + ${baseQuantity}` })
                .where(eq(products.id, input.productId));
            }
            return [created];
          });
          await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "stock_in", recordId: savedStockIn.id, newValue: { productId: input.productId, quantity: input.quantity, entryUnit: input.entryUnit, baseQuantity, sourceType: input.sourceType, purchaseReference: input.purchaseReference, batchNumber: input.batchNumber, vehicleReference: input.vehicleReference, warehouseLocation: input.warehouseLocation, receivedBy, qualityStatus: input.qualityStatus, totalCost } });

          return { success: true, id: savedStockIn.id, baseQuantity, totalCost, stockAdded: input.qualityStatus !== "rejected" };
        }),
    }),

    stockOut: router({
      list: officeProcedure.query(async ({ ctx }) => {
        if (!["admin", "owner", "storekeeper"].includes(ctx.user.role) && !(ctx.user.role === "manager" && ctx.user.jobTitle !== "finance")) throw new Error("Stock out haikuruhusiwi kwa role hii");
        return await db.query.stockOut.findMany({ orderBy: desc(stockOut.date), limit: 200 });
      }),

      create: officeProcedure
        .input(z.object({
          productId: z.number(),
          quantity: z.number(),
          reason: z.string().default("sale"),
          notes: z.string().optional(),
        }))
                .mutation(async ({ input, ctx }) => {
          if (!["admin", "owner", "storekeeper"].includes(ctx.user.role) && !(ctx.user.role === "manager" && ctx.user.jobTitle !== "finance")) throw new Error("Stock out haikuruhusiwi kwa role hii");
          const product = await db.query.products.findFirst({ where: eq(products.id, input.productId) });
          if (!product) throw new Error("Product haipatikani");
          const baseQuantity = input.quantity * Number(product.packageSizeKg || 1);
          const [updatedProduct] = await db.update(products)
            .set({ currentStock: sql`${products.currentStock} - ${baseQuantity}` })
            .where(and(eq(products.id, input.productId), gte(products.currentStock, decimalString(baseQuantity))))
            .returning();
          if (!updatedProduct) throw new Error(`Stock haitoshi kwa ${product.name}`);
          const [savedStockOut] = await db.insert(stockOut).values({
            productId: input.productId,
            quantity: decimalString(input.quantity),
            baseQuantity: decimalString(baseQuantity),
            reason: input.reason,
            notes: `${input.notes || ""} Issued: ${input.quantity} ${product.unit} = ${baseQuantity} kg`.trim(),
          }).returning();
          await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "stock_out", recordId: savedStockOut.id, newValue: { productId: input.productId, quantity: input.quantity, unit: product.unit, baseQuantity, reason: input.reason } });
          if (Number(updatedProduct.currentStock) <= Number(product.lowStockThreshold)) {
            await notifyRoles(
              ["admin", "owner", "manager", "storekeeper"],
              "stock_alert",
              `Stock iko chini: ${product.name}`,
              `${product.name} imefika ${Number(updatedProduct.currentStock).toLocaleString()} kg, chini ya threshold ya ${Number(product.lowStockThreshold).toLocaleString()} kg. Tafadhali panga replenishment.`
            );
          }

          return { success: true, id: savedStockOut.id };
        }),
    }),
  }),

  // ===== MACHINE JOBS =====
  machineJobs: router({
    create: officeProcedure
      .input(z.object({
        customerId: z.number().optional(),
        operationType: z.enum(["customer_service", "internal_production"]).default("internal_production"),
        jobType: z.string(),
        inputProduct: z.string(),
        inputKg: z.number(),
        inputUnit: z.string().default("kg"),
        inputQuantity: z.number().positive().optional(),
        inputUnitSize: z.number().positive().default(1),
        outputProduct1: z.string().optional(),
        outputKg1: z.number().default(0),
        outputProduct2: z.string().optional(),
        outputKg2: z.number().default(0),
        serviceFee: z.number().default(0),
        serviceUnit: z.string().default("kg"),
        serviceQuantity: z.number().positive().optional(),
        serviceRate: z.number().nonnegative().default(0),
        paymentMethod: z.string().default("cash"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const isCustomerService = input.operationType === "customer_service";
        const totalOutput = isCustomerService ? 0 : (input.outputKg1 || 0) + (input.outputKg2 || 0);
        const efficiency = isCustomerService ? 100 : (totalOutput / input.inputKg) * 100;
        if (input.inputKg <= 0 || !Number.isFinite(efficiency)) throw new Error("Kiasi cha input lazima kiwe zaidi ya sifuri");
        const inputQuantity = input.inputQuantity ?? input.inputKg;
        const serviceQuantity = input.serviceQuantity ?? inputQuantity;
        const serviceFee = input.serviceFee || serviceQuantity * (input.serviceRate || 0);
        const saved = await db.transaction(async (tx) => {
          const inputProduct = isCustomerService ? null : await tx.query.products.findFirst({ where: and(eq(products.name, input.inputProduct), eq(products.isActive, true)) });
          if (!isCustomerService && !inputProduct) throw new Error(`Input product haipo kwenye inventory: ${input.inputProduct}`);
          if (!isCustomerService && Number(inputProduct?.currentStock ?? 0) < input.inputKg) throw new Error(`Stock haitoshi kwa ${input.inputProduct}. Iliyopo: ${inputProduct?.currentStock ?? 0}`);
          const outputNames = isCustomerService ? [] : [input.outputProduct1, input.outputProduct2].filter((name): name is string => Boolean(name));
          for (const outputName of outputNames) {
            const outputProduct = await tx.query.products.findFirst({ where: and(eq(products.name, outputName), eq(products.isActive, true)) });
            if (!outputProduct) throw new Error(`Output product haipo kwenye inventory: ${outputName}`);
          }
          const [job] = await tx.insert(machineJobs).values({
            customerId: input.customerId,
            jobType: input.jobType,
            inputProduct: input.inputProduct,
            operationType: input.operationType,
            inputKg: decimalString(input.inputKg),
            inputUnit: input.inputUnit,
            inputQuantity: decimalString(inputQuantity),
            inputUnitSize: decimalString(input.inputUnitSize),
            outputProduct1: isCustomerService ? undefined : input.outputProduct1,
            outputKg1: decimalString(input.outputKg1),
            outputProduct2: isCustomerService ? undefined : input.outputProduct2,
            outputKg2: decimalString(isCustomerService ? 0 : input.outputKg2),
            serviceFee: decimalString(serviceFee),
            serviceUnit: input.serviceUnit,
            serviceQuantity: decimalString(serviceQuantity),
            serviceRate: decimalString(input.serviceRate),
            paymentMethod: input.paymentMethod,
            notes: input.notes,
            operatorId: ctx.user?.id,
            efficiency: decimalString(efficiency),
            status: "completed",
          }).returning();
          if (isCustomerService) return job;
          await tx.update(products).set({ currentStock: sql`${products.currentStock} - ${input.inputKg}` }).where(eq(products.id, inputProduct!.id));
          await tx.insert(stockOut).values({ productId: inputProduct!.id, quantity: decimalString(input.inputKg), baseQuantity: decimalString(input.inputKg), reason: `machine_${input.jobType}`, notes: `Machine job #${job.id}` });
          for (const [productName, quantity] of [[input.outputProduct1, input.outputKg1], [input.outputProduct2, input.outputKg2]] as Array<[string | undefined, number]>) {
            if (!productName || quantity <= 0) continue;
            const outputProduct = await tx.query.products.findFirst({ where: and(eq(products.name, productName), eq(products.isActive, true)) });
            if (!outputProduct) throw new Error(`Output product haipo kwenye inventory: ${productName}`);
            await tx.update(products).set({ currentStock: sql`${products.currentStock} + ${quantity}` }).where(eq(products.id, outputProduct.id));
            await tx.insert(stockIn).values({ productId: outputProduct.id, quantity: decimalString(quantity), supplierName: "MavunoOne Production", costPerUnit: "0", totalCost: "0", notes: `Output ya machine job #${job.id}` });
          }
          return job;
        });
        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "machine_jobs", recordId: saved.id, newValue: saved });
        try {
          if (input.customerId) {
            const customer = await db.query.customers.findFirst({ where: eq(customers.id, input.customerId) });
            if (customer?.phone) {
              const { sendMachineServiceSms } = await import("@/server/utils/sms");
              const outputs = [input.outputProduct1 ? `${input.outputProduct1} ${input.outputKg1}kg` : "", input.outputProduct2 ? `${input.outputProduct2} ${input.outputKg2}kg` : ""].filter(Boolean).join(", ");
              await sendMachineServiceSms(customer.phone, customer.name, input.jobType, input.inputKg, outputs || "huduma imekamilika", serviceFee);
            }
          }
        } catch (smsError) { console.error("[SMS] Machine service notification failed:", smsError); }
        return saved;
      }),

    list: protectedProcedure.query(async () => {
      return await db.query.machineJobs.findMany({
        orderBy: desc(machineJobs.createdAt),
        limit: 100,
      });
    }),
  }),

  // ===== VEHICLES & DELIVERIES =====
  vehicles: router({
    list: protectedProcedure.query(async () => {
      return await db.query.vehicles.findMany({
        orderBy: desc(vehicles.lastUpdate),
        limit: 200,
      });
    }),

    updatePosition: officeProcedure
      .input(z.object({
        id: z.number(),
        lat: z.number(),
        lng: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.update(vehicles)
          .set({
            lastPositionLat: decimalString(input.lat),
            lastPositionLng: decimalString(input.lng),
            status: "moving",
            lastUpdate: new Date(),
          })
          .where(eq(vehicles.id, input.id))
          .returning();
      }),
  }),

  deliveries: router({
    create: officeProcedure
      .input(z.object({
        vehicleId: z.number().optional(),
        driverName: z.string(),
        driverPhone: z.string(),
        destination: z.string(),
        totalWeight: z.number().default(0),
        invoiceNumber: z.string().optional(),
        recipientPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const [savedDelivery] = await db.insert(deliveries).values({
          vehicleId: input.vehicleId,
          driverName: input.driverName,
          driverPhone: input.driverPhone,
          destination: input.destination,
          totalWeight: decimalString(input.totalWeight),
          departureTime: new Date(),
          status: "scheduled",
        }).returning();

        try {
          const vehicleInfo = input.vehicleId
            ? await db.query.vehicles.findFirst({ where: eq(vehicles.id, input.vehicleId) })
            : null;

          const recipientPhone = input.recipientPhone || input.driverPhone;
          if (recipientPhone) {
            const { sendVehicleDispatchSms } = await import("@/server/utils/sms");
            await sendVehicleDispatchSms({
              recipientPhone,
              invoiceNumber: input.invoiceNumber || `INV-${savedDelivery.id}`,
              destination: input.destination,
              vehicleNumber: vehicleInfo?.plateNumber || "N/A",
              driverName: input.driverName,
              driverPhone: input.driverPhone,
            });
          }
        } catch (smsError) {
          console.error("[SMS] Failed to send delivery dispatch SMS:", smsError);
        }

        return savedDelivery;
      }),
  }),

  // ===== EXPENSES =====
  expenses: router({
    create: financeProcedure
      .input(z.object({
        category: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        date: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const [savedExpense] = await db.insert(expenses).values({
          category: input.category,
          amount: decimalString(input.amount),
          description: input.description,
          date: input.date ? new Date(input.date) : new Date(),
        }).returning();
        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "expenses", recordId: savedExpense.id, newValue: { category: input.category, amount: input.amount, description: input.description, date: input.date } });
        return savedExpense;
      }),

    list: financeProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        let where = undefined;
        if (input.startDate && input.endDate) {
          where = and(
            gte(expenses.date, input.startDate),
            lte(expenses.date, input.endDate)
          );
        }
        return await db.query.expenses.findMany({ where, orderBy: desc(expenses.date), limit: 200 });
      }),
  }),

  // ===== FARMERS & FARMER PAYMENTS =====
  farmers: router({
    list: protectedProcedure.query(async () => {
      const rows = await db.query.farmers.findMany({ where: eq(farmers.isActive, true), orderBy: desc(farmers.createdAt), limit: 500 });
      const ledger = await db.query.farmerPayments.findMany({ orderBy: desc(farmerPayments.createdAt), limit: 1000 });
      return rows.map((farmer) => {
        const records = ledger.filter((entry) => entry.farmerId === farmer.id);
        const totalSupplied = records.reduce((sum, entry) => sum + Number(entry.quantityKg || 0), 0);
        const totalAmount = records.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0);
        const totalPaid = records.reduce((sum, entry) => sum + Number(entry.paidAmount || 0), 0);
        return { ...farmer, totalSupplied, totalAmount, totalPaid, balance: totalAmount - totalPaid };
      });
    }),
    payments: financeProcedure.query(async () => db.query.farmerPayments.findMany({ orderBy: desc(farmerPayments.createdAt), limit: 500 })),
    create: financeProcedure.input(z.object({ name: z.string().min(2), phone: z.string().optional(), location: z.string().optional(), farmSize: z.number().nonnegative().optional() })).mutation(async ({ input, ctx }) => {
      const farmerNumber = `F-${Date.now().toString().slice(-8)}`;
      const [farmer] = await db.insert(farmers).values({ farmerNumber, name: input.name, phone: input.phone, location: input.location, farmSize: input.farmSize ? decimalString(input.farmSize) : null }).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "farmers", recordId: farmer.id, newValue: farmer });
      return farmer;
    }),
    recordPurchase: financeProcedure.input(z.object({ farmerId: z.number(), productName: z.string().min(1), quantityKg: z.number().positive(), pricePerKg: z.number().positive(), paidAmount: z.number().nonnegative(), paymentMethod: z.string().default("cash"), paymentReference: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const farmer = await db.query.farmers.findFirst({ where: eq(farmers.id, input.farmerId) });
      if (!farmer) throw new Error("Farmer not found");
      const totalAmount = input.quantityKg * input.pricePerKg;
      const paidAmount = Math.min(input.paidAmount, totalAmount);
      const [record] = await db.insert(farmerPayments).values({ farmerId: input.farmerId, productName: input.productName, quantityKg: decimalString(input.quantityKg), pricePerKg: decimalString(input.pricePerKg), totalAmount: decimalString(totalAmount), paidAmount: decimalString(paidAmount), balance: decimalString(totalAmount - paidAmount), paymentMethod: input.paymentMethod, paymentReference: input.paymentReference, paymentStatus: paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid", createdBy: ctx.user?.id }).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "farmer_payments", recordId: record.id, newValue: record });
      try {
        if (farmer.phone && paidAmount > 0) {
          const { sendFarmerPaymentSms } = await import("@/server/utils/sms");
          await sendFarmerPaymentSms(farmer.phone, farmer.name, input.productName, paidAmount, totalAmount - paidAmount);
        }
      } catch (smsError) { console.error("[SMS] Farmer payment notification failed:", smsError); }
      return record;
    }),
  }),

  // ===== MACHINE MAINTENANCE =====
  maintenance: router({
    list: financeProcedure.query(async () => db.query.maintenanceCosts.findMany({ orderBy: desc(maintenanceCosts.serviceDate), limit: 200 })),
    create: financeProcedure.input(z.object({ machineName: z.string().min(2), maintenanceType: z.string().min(2), amount: z.number().positive(), serviceDate: z.string().optional(), nextDueDate: z.string().optional(), vendorName: z.string().optional(), notes: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const [record] = await db.insert(maintenanceCosts).values({ machineName: input.machineName, maintenanceType: input.maintenanceType, amount: decimalString(input.amount), serviceDate: input.serviceDate ? new Date(input.serviceDate) : new Date(), nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : undefined, vendorName: input.vendorName, notes: input.notes, createdBy: ctx.user?.id }).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "maintenance_costs", recordId: record.id, newValue: record });
      return record;
    }),
  }),

  // ===== DAILY CLOSURES =====
  dailyClosures: router({
    create: financeProcedure
      .input(z.object({
        openingBalance: z.number(),
        closingBalance: z.number(),
        expectedBalance: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const variance = input.closingBalance - input.expectedBalance;

        return await db.insert(dailyClosures).values({
          openingBalance: decimalString(input.openingBalance),
          closingBalance: decimalString(input.closingBalance),
          expectedBalance: decimalString(input.expectedBalance),
          variance: decimalString(variance),
          cashierId: ctx.user?.id,
          date: new Date(),
        }).returning();
      }),
  }),

  // ===== DASHBOARD STATS =====
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todaySales = await db.query.sales.findMany({
        where: gte(sales.createdAt, todayStart),
      });
      const [todayStockIn, todayStockOut, inventoryProducts] = await Promise.all([
        db.query.stockIn.findMany({ where: gte(stockIn.date, todayStart) }),
        db.query.stockOut.findMany({ where: gte(stockOut.date, todayStart) }),
        db.query.products.findMany({ where: eq(products.isActive, true) }),
      ]);

      const lowStock = await db.query.products.findMany({
        where: and(
          lte(products.currentStock, products.lowStockThreshold),
          eq(products.isActive, true)
        ),
      });

      const totalDebt = await db.query.customers.findMany({
        where: gt(customers.balance, "0"),
      });

      const todaySalesTotal = todaySales.reduce(
        (sum, s) => sum + Number(s.totalAmount || 0),
        0
      );

      const totalCustomerDebt = totalDebt.reduce(
        (sum, c) => sum + Number(c.balance || 0),
        0
      );
      const stockInKgToday = todayStockIn.reduce((sum, row) => sum + Number(row.baseQuantity || row.quantity || 0), 0);
      const stockOutKgToday = todayStockOut.reduce((sum, row) => sum + Number(row.baseQuantity || row.quantity || 0), 0);
      const inventoryValue = inventoryProducts.reduce((sum, product) => sum + Number(product.currentStock || 0) * Number(product.costPrice || 0), 0);

      return {
        todaySalesTotal,
        todaySalesCount: todaySales.length,
        lowStockCount: lowStock.length,
        totalCustomerDebt,
        stockInKgToday,
        stockOutKgToday,
        inventoryValue,
      };
    }),
  }),

  // ===== ANALYTICS =====
  analytics: router({
    summary: protectedProcedure.query(async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      const [recentSales, recentExpenses, recentStockIn, recentFarmerPayments, recentMaintenance] = await Promise.all([
        db.query.sales.findMany({ where: gte(sales.createdAt, start) }),
        db.query.expenses.findMany({ where: gte(expenses.date, start) }),
        db.query.stockIn.findMany({ where: gte(stockIn.date, start) }),
        db.query.farmerPayments.findMany({ where: gte(farmerPayments.createdAt, start) }),
        db.query.maintenanceCosts.findMany({ where: gte(maintenanceCosts.serviceDate, start) }),
      ]);
      const saleIds = recentSales.map((sale) => sale.id);
      const [recentItems, catalogProducts] = await Promise.all([
        saleIds.length ? db.query.saleItems.findMany({ where: inArray(saleItems.saleId, saleIds) }) : Promise.resolve([]),
        db.query.products.findMany({ where: eq(products.isActive, true), limit: 500 }),
      ]);
      const daily = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const key = date.toISOString().slice(0, 10);
        const salesTotal = recentSales.filter((sale) => sale.createdAt.toISOString().slice(0, 10) === key).reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
        const expensesTotal = recentExpenses.filter((expense) => expense.date.toISOString().slice(0, 10) === key).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        const stockCost = recentStockIn.filter((entry) => entry.date.toISOString().slice(0, 10) === key).reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0);
        const farmerCost = recentFarmerPayments.filter((entry) => entry.createdAt.toISOString().slice(0, 10) === key).reduce((sum, entry) => sum + Number(entry.paidAmount || 0), 0);
        const maintenanceCost = recentMaintenance.filter((entry) => entry.serviceDate.toISOString().slice(0, 10) === key).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
        const operatingCosts = expensesTotal + stockCost + farmerCost + maintenanceCost;
        return { date: key, sales: salesTotal, expenses: expensesTotal, stockCost, farmerCost, maintenanceCost, operatingCosts, profit: salesTotal - operatingCosts };
      });
      const totalSales = daily.reduce((sum, day) => sum + day.sales, 0);
      const totalExpenses = daily.reduce((sum, day) => sum + day.expenses, 0);
      const totalStockCost = daily.reduce((sum, day) => sum + day.stockCost, 0);
      const totalFarmerCost = daily.reduce((sum, day) => sum + day.farmerCost, 0);
      const totalMaintenanceCost = daily.reduce((sum, day) => sum + day.maintenanceCost, 0);
      const totalOperatingCosts = daily.reduce((sum, day) => sum + day.operatingCosts, 0);
      const productById = new Map(catalogProducts.map((product) => [product.id, product]));
      const productTotals = new Map<number, { quantity: number; revenue: number }>();
      for (const item of recentItems) {
        const current = productTotals.get(item.productId) || { quantity: 0, revenue: 0 };
        productTotals.set(item.productId, { quantity: current.quantity + Number(item.quantity || 0), revenue: current.revenue + Number(item.total || 0) });
      }
      const topProducts = Array.from(productTotals.entries()).map(([productId, totals]) => ({ productId, name: productById.get(productId)?.name || "Bidhaa isiyojulikana", unit: productById.get(productId)?.unit || "unit", quantity: totals.quantity, revenue: totals.revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
      const paymentMix = Array.from(recentSales.reduce((mix, sale) => mix.set(sale.paymentMethod || "cash", (mix.get(sale.paymentMethod || "cash") || 0) + Number(sale.totalAmount || 0)), new Map<string, number>())).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount);
      const movement = daily.map((day) => ({ date: day.date, stockInKg: recentStockIn.filter((entry) => entry.date.toISOString().slice(0, 10) === day.date).reduce((sum, entry) => sum + Number(entry.baseQuantity || entry.quantity || 0), 0), stockOutKg: recentSales.filter((sale) => sale.createdAt.toISOString().slice(0, 10) === day.date).length ? recentItems.filter((item) => { const sale = recentSales.find((candidate) => candidate.id === item.saleId); return sale?.createdAt.toISOString().slice(0, 10) === day.date; }).reduce((sum, item) => { const product = productById.get(item.productId); return sum + Number(item.baseQuantity || 0) || sum + Number(item.quantity || 0) * Number(product?.packageSizeKg || 1); }, 0) : 0 }));
      return { daily, totalSales, totalExpenses, totalStockCost, totalFarmerCost, totalMaintenanceCost, totalOperatingCosts, totalProfit: totalSales - totalOperatingCosts, topProducts, paymentMix, movement };
    }),
    forecast: protectedProcedure.query(async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 29);
      const [recentSales, recentExpenses] = await Promise.all([
        db.query.sales.findMany({ where: gte(sales.createdAt, start) }),
        db.query.expenses.findMany({ where: gte(expenses.date, start) }),
      ]);
      const avgDailySales = recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0) / 30;
      const avgDailyExpenses = recentExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) / 30;
      const projectedRevenue30 = avgDailySales * 30;
      const projectedExpenses30 = avgDailyExpenses * 30;
      return { historicalDays: 30, salesTransactions: recentSales.length, projectedRevenue30, projectedExpenses30, projectedProfit30: projectedRevenue30 - projectedExpenses30, avgDailySales, avgDailyExpenses, confidence: recentSales.length >= 10 ? "medium" : recentSales.length > 0 ? "low" : "insufficient", disclaimer: "Forecast ni estimate ya trend ya database iliyopo; si guarantee ya soko." };
    }),
  }),

  // ===== STOCK RECONCILIATION =====
  stockReconciliation: router({
    list: protectedProcedure.query(async () => db.query.stockReconciliations.findMany({ orderBy: desc(stockReconciliations.createdAt), limit: 300 })),
    create: officeProcedure.input(z.object({ productId: z.number(), countedQuantity: z.number().nonnegative(), adjustmentReason: z.enum(["count_variance", "damaged", "expired", "wastage", "transfer" ]), notes: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const product = await db.query.products.findFirst({ where: eq(products.id, input.productId) });
      if (!product) throw new Error("Product haipatikani");
      const systemQuantity = Number(product.currentStock || 0);
      const variance = input.countedQuantity - systemQuantity;
      const [record] = await db.insert(stockReconciliations).values({ productId: input.productId, systemQuantity: decimalString(systemQuantity), countedQuantity: decimalString(input.countedQuantity), variance: decimalString(variance), adjustmentReason: input.adjustmentReason, notes: input.notes, status: "pending", countedBy: ctx.user?.id }).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "stock_reconciliations", recordId: record.id, newValue: record });
      return record;
    }),
    approve: financeProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const record = await db.query.stockReconciliations.findFirst({ where: eq(stockReconciliations.id, input.id) });
      if (!record) throw new Error("Reconciliation record haipatikani");
      if (record.status !== "pending") throw new Error("Reconciliation hii tayari imefanyiwa kazi");
      const product = await db.query.products.findFirst({ where: eq(products.id, record.productId) });
      if (!product) throw new Error("Product haipatikani");
      const [updatedProduct] = await db.update(products).set({ currentStock: record.countedQuantity, updatedAt: new Date() }).where(eq(products.id, record.productId)).returning();
      const [updated] = await db.update(stockReconciliations).set({ status: "approved", approvedBy: ctx.user?.id }).where(eq(stockReconciliations.id, input.id)).returning();
      await db.insert(stockOut).values({ productId: record.productId, quantity: decimalString(Math.abs(Number(record.variance))), reason: "reconciliation", notes: `Reconciliation #${record.id}: ${record.adjustmentReason}` });
      await recordAuditLog({ userId: ctx.user?.id, action: "approve", tableName: "stock_reconciliations", recordId: updated.id, oldValue: record, newValue: { ...updated, productStock: updatedProduct.currentStock } });
      return updated;
    }),
  }),
  // ===== FARMER PAYMENT APPROVALS =====
  farmerApprovals: router({
    list: protectedProcedure.query(async () => db.query.farmerPaymentApprovals.findMany({ orderBy: desc(farmerPaymentApprovals.requestedAt), limit: 300 })),
    request: financeProcedure.input(z.object({ farmerPaymentId: z.number(), requestedAmount: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const ledger = await db.query.farmerPayments.findFirst({ where: eq(farmerPayments.id, input.farmerPaymentId) });
      if (!ledger) throw new Error("Farmer ledger haipatikani");
      const outstanding = Number(ledger.balance || 0);
      if (outstanding <= 0 || input.requestedAmount > outstanding) throw new Error("Requested amount inazidi farmer balance");
      const [request] = await db.insert(farmerPaymentApprovals).values({ farmerPaymentId: input.farmerPaymentId, requestedAmount: decimalString(input.requestedAmount), requestedBy: ctx.user?.id as number, status: "pending" }).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "farmer_payment_approvals", recordId: request.id, newValue: request });
      return request;
    }),
    approve: protectedProcedure.input(z.object({ id: z.number(), approve: z.boolean(), rejectionReason: z.string().optional() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user || !["boss", "admin", "owner"].includes(ctx.user.role)) throw new Error("Boss/Admin approval required");
      const request = await db.query.farmerPaymentApprovals.findFirst({ where: eq(farmerPaymentApprovals.id, input.id) });
      if (!request || request.status !== "pending") throw new Error("Payment request haipo au tayari imefanyiwa kazi");
      if (request.requestedBy === ctx.user.id) throw new Error("Muumba wa request hawezi ku-approve request yake mwenyewe");
      const [updated] = await db.update(farmerPaymentApprovals).set({ status: input.approve ? "approved" : "rejected", approvedBy: ctx.user.id, approvedAt: new Date(), rejectionReason: input.approve ? undefined : input.rejectionReason }).where(eq(farmerPaymentApprovals.id, input.id)).returning();
      await recordAuditLog({ userId: ctx.user.id, action: input.approve ? "approve" : "reject", tableName: "farmer_payment_approvals", recordId: updated.id, newValue: updated });
      return updated;
    }),
    markPaid: financeProcedure.input(z.object({ id: z.number(), paymentReference: z.string().min(2), paymentMethod: z.string().default("cash") })).mutation(async ({ input, ctx }) => {
      const request = await db.query.farmerPaymentApprovals.findFirst({ where: eq(farmerPaymentApprovals.id, input.id) });
      if (!request || request.status !== "approved") throw new Error("Payment lazima iwe approved kwanza");
      const ledger = await db.query.farmerPayments.findFirst({ where: eq(farmerPayments.id, request.farmerPaymentId) });
      if (!ledger) throw new Error("Farmer ledger haipatikani");
      const currentPaid = Number(ledger.paidAmount || 0);
      const currentBalance = Number(ledger.balance || 0);
      const paidAmount = Math.min(Number(request.requestedAmount), currentBalance);
      const [updatedLedger] = await db.update(farmerPayments).set({ paidAmount: decimalString(currentPaid + paidAmount), balance: decimalString(currentBalance - paidAmount), paymentMethod: input.paymentMethod, paymentReference: input.paymentReference, paymentStatus: currentBalance - paidAmount <= 0 ? "paid" : "partial" }).where(eq(farmerPayments.id, ledger.id)).returning();
      const [updated] = await db.update(farmerPaymentApprovals).set({ status: "paid", paidBy: ctx.user?.id, paidAt: new Date(), paymentReference: input.paymentReference }).where(eq(farmerPaymentApprovals.id, input.id)).returning();
      await recordAuditLog({ userId: ctx.user?.id, action: "mark_paid", tableName: "farmer_payment_approvals", recordId: updated.id, oldValue: request, newValue: { ...updated, ledger: updatedLedger } });
      return { approval: updated, ledger: updatedLedger };
    }),
  }),
  // ===== CUSTOMERS =====
  customers: router({
    list: protectedProcedure.query(async () => {
      return await db.query.customers.findMany({
        where: eq(customers.isActive, true),
        orderBy: desc(customers.createdAt),
        limit: 500,
      });
    }),

    create: financeProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        customerType: z.string().default("retail"),
        creditLimit: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const [newCustomer] = await db.insert(customers).values({
          name: input.name,
          phone: input.phone,
          email: input.email,
          customerType: input.customerType,
          creditLimit: decimalString(input.creditLimit),
          balance: "0",
          isActive: true,
        }).returning();

        try {
          if (newCustomer.phone) {
            const { sendWelcomeSms } = await import("@/server/utils/sms");
            await sendWelcomeSms(newCustomer.phone, newCustomer.name);
          }
        } catch (smsError) {
          console.error("[SMS] Failed to send welcome SMS:", smsError);
        }

        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "customers", recordId: newCustomer.id, newValue: { name: newCustomer.name, customerType: newCustomer.customerType, creditLimit: input.creditLimit } });
        return newCustomer;
      }),

    // Customers with an outstanding balance (deni)
    listDebtors: protectedProcedure.query(async () => {
      return await db.query.customers.findMany({
        where: and(gt(customers.balance, "0"), eq(customers.isActive, true)),
        orderBy: desc(customers.balance),
      });
    }),

    // Record a payment against a customer's debt/balance.
    // Reduces the outstanding balance and sends a payment-received SMS.
    recordPayment: financeProcedure
      .input(z.object({
        customerId: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.string().default("cash"),
      }))
      .mutation(async ({ input, ctx }) => {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, input.customerId),
        });

        if (!customer) {
          throw new Error("Customer not found");
        }

        const currentBalance = Number(customer.balance || 0);
        const remainingBalance = Math.max(currentBalance - input.amount, 0);

        const [updated] = await db.update(customers)
          .set({ balance: decimalString(remainingBalance) })
          .where(eq(customers.id, input.customerId))
          .returning();

        let sms = null;
        if (customer.phone) {
          try {
            const { sendPaymentReceivedSms } = await import("@/server/utils/sms");
            sms = await sendPaymentReceivedSms(
              customer.phone,
              customer.name,
              input.amount,
              remainingBalance
            );
          } catch (smsError) {
            console.error("[SMS] Failed to send payment-received SMS:", smsError);
          }
        }

        await recordAuditLog({ userId: ctx.user?.id, action: "update", tableName: "customers", recordId: input.customerId, newValue: { paymentAmount: input.amount, paymentMethod: input.paymentMethod, remainingBalance } });
        return { success: true, customer: updated, sms };
      }),

    // Send debt-reminder SMS to every customer with an outstanding balance
    sendDebtRemindersBulk: financeProcedure.mutation(async () => {
      const debtors = await db.query.customers.findMany({
        where: and(gt(customers.balance, "0"), eq(customers.isActive, true)),
      });

      const { sendDebtReminderSms } = await import("@/server/utils/sms");
      const results = [];

      for (const debtor of debtors) {
        if (!debtor.phone) continue;

        const daysOverdue = Math.max(
          Math.floor(
            (Date.now() - new Date(debtor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ),
          0
        );

        const result = await sendDebtReminderSms(
          debtor.phone,
          debtor.name,
          Number(debtor.balance || 0),
          daysOverdue
        );

        results.push({ customerId: debtor.id, ...result });
      }

      return { success: true, sent: results.length, results };
    }),
  }),

  // ===== NOTIFICATIONS =====
  notifications: router({
    create: officeProcedure
      .input(z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.insert(notifications).values({
          type: input.type,
          title: input.title,
          message: input.message,
          userId: input.userId,
          isRead: false,
        }).returning();
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      const role = ctx.user?.role;
      const canRead = ["boss", "admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"].includes(role ?? "");
      if (!canRead) return [];
      return await db.query.notifications.findMany({
        where: ctx.user?.id
          ? or(isNull(notifications.userId), eq(notifications.userId, ctx.user.id))
          : isNull(notifications.userId),
        orderBy: desc(notifications.createdAt),
        limit: 50,
      });
    }),
  }),

  // ===== CATEGORIES =====
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.query.categories.findMany();
    }),

    create: officeProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.insert(categories).values({
          name: input.name,
          description: input.description,
        }).returning();
      }),
  }),

  // ===== AUDIT LOGS =====
  auditLogs: router({
    list: protectedProcedure.query(async () => {
      return await db.query.auditLogs.findMany({
        orderBy: desc(auditLogs.timestamp),
        limit: 100,
      });
    }),
  }),

  // ===== SMS NOTIFICATIONS =====
  sms: router({
    // Send raw SMS
    send: officeProcedure
      .input(z.object({
        phone: z.string(),
        message: z.string(),
        senderID: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { sendSms } = await import("@/server/utils/sms");
        return await sendSms({
          phone: input.phone,
          message: input.message,
          senderID: input.senderID,
        });
      }),

    // Send bulk SMS
    sendBulk: officeProcedure
      .input(z.object({
        recipients: z.array(z.string()),
        message: z.string(),
        senderID: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { sendBulkSms } = await import("@/server/utils/sms");
        return await sendBulkSms(input.recipients, input.message, input.senderID);
      }),

    // Send debt reminder SMS
    sendDebtReminder: officeProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        dueAmount: z.number(),
        daysOverdue: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { sendDebtReminderSms } = await import("@/server/utils/sms");
        return await sendDebtReminderSms(
          input.customerPhone,
          input.customerName,
          input.dueAmount,
          input.daysOverdue
        );
      }),

    // Send sale confirmation SMS
    sendSaleConfirmation: officeProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        saleAmount: z.number(),
        receiptNumber: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { sendSaleConfirmationSms } = await import("@/server/utils/sms");
        return await sendSaleConfirmationSms(
          input.customerPhone,
          input.customerName,
          input.saleAmount,
          input.receiptNumber
        );
      }),

    // Send payment received SMS
    sendPaymentReceived: officeProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        paymentAmount: z.number(),
        remainingBalance: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { sendPaymentReceivedSms } = await import("@/server/utils/sms");
        return await sendPaymentReceivedSms(
          input.customerPhone,
          input.customerName,
          input.paymentAmount,
          input.remainingBalance
        );
      }),

    // Send stock alert SMS
    sendStockAlert: officeProcedure
      .input(z.object({
        managerPhone: z.string(),
        productName: z.string(),
        currentStock: z.number(),
        minimumLevel: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { sendStockAlertSms } = await import("@/server/utils/sms");
        return await sendStockAlertSms(
          input.managerPhone,
          input.productName,
          input.currentStock,
          input.minimumLevel
        );
      }),

    // Sales receipt SMS template
    sendSalesReceipt: officeProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        invoiceNumber: z.string(),
        items: z.array(z.object({
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
        })),
        totalAmount: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { sendSalesReceiptSms } = await import("@/server/utils/sms");
        return await sendSalesReceiptSms(
          input.customerPhone,
          input.customerName,
          input.invoiceNumber,
          input.items,
          input.totalAmount
        );
      }),

    // Welcome SMS template
    sendWelcome: officeProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { sendWelcomeSms } = await import("@/server/utils/sms");
        return await sendWelcomeSms(input.customerPhone, input.customerName);
      }),

    // Vehicle dispatch SMS template
    sendVehicleDispatch: officeProcedure
      .input(z.object({
        recipientPhone: z.string(),
        invoiceNumber: z.string(),
        destination: z.string(),
        vehicleNumber: z.string(),
        driverName: z.string(),
        driverPhone: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { sendVehicleDispatchSms } = await import("@/server/utils/sms");
        return await sendVehicleDispatchSms(input);
      }),

    // Low-stock admin alert
    sendLowStockAlert: officeProcedure
      .input(z.object({
        managerPhone: z.string(),
        productName: z.string(),
        currentStock: z.number(),
        minimumLevel: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { sendStockAlertSms } = await import("@/server/utils/sms");
        return await sendStockAlertSms(
          input.managerPhone,
          input.productName,
          input.currentStock,
          input.minimumLevel
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
