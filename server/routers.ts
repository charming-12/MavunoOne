import { router, publicProcedure, protectedProcedure } from "./trpc";
import { z } from "zod";
import { db } from "@/lib/db";
import { 
  products, sales, saleItems, stockIn, stockOut, machineJobs,
  vehicles, deliveries, expenses, dailyClosures, notifications,
  customers, categories, users, auditLogs
} from "@/drizzle/schema";
import { desc, eq, and, gt, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { recordAuditLog } from "@/lib/audit";

const decimalString = (value?: number | string | null, fallback = "0") => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return fallback;
  }
  return String(value);
};

export const appRouter = router({
  // ===== PRODUCTS =====
  products: router({
    list: publicProcedure.query(async () => {
      return await db.query.products.findMany({
        where: eq(products.isActive, true),
        orderBy: desc(products.name),
        limit: 500,
      });
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        categoryId: z.number().optional(),
        unit: z.string().default("kg"),
        costPrice: z.number(),
        sellPrice: z.number(),
        wholesalePrice: z.number().optional(),
        lowStockThreshold: z.number().default(10),
        currentStock: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.insert(products).values({
          ...input,
          costPrice: decimalString(input.costPrice),
          sellPrice: decimalString(input.sellPrice),
          wholesalePrice: input.wholesalePrice !== undefined ? decimalString(input.wholesalePrice) : undefined,
          lowStockThreshold: decimalString(input.lowStockThreshold),
          currentStock: decimalString(input.currentStock),
        }).returning();
      }),
    
    updateStock: protectedProcedure
      .input(z.object({ id: z.number(), amount: z.number() }))
      .mutation(async ({ input }) => {
        const [updated] = await db.update(products)
          .set({ currentStock: sql`currentStock + ${input.amount}` })
          .where(eq(products.id, input.id))
          .returning();

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

    lowStock: protectedProcedure.query(async () => {
      return await db.query.products.findMany({
        where: and(
          lte(products.currentStock, products.lowStockThreshold),
          eq(products.isActive, true)
        ),
      });
    }),
  }),

  // ===== SALES =====
  sales: router({
    list: protectedProcedure.query(async () => {
      return await db.query.sales.findMany({
        orderBy: desc(sales.createdAt),
        limit: 100,
      });
    }),

    create: protectedProcedure
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
        const invoiceNumber = `INV-${Date.now()}`;
        
        const [newSale] = await db.insert(sales).values({
          invoiceNumber,
          customerId: input.customerId,
          customerType: input.customerType,
          totalAmount: decimalString(input.totalAmount),
          paymentMethod: input.paymentMethod,
          paidAmount: decimalString(input.paidAmount ?? input.totalAmount),
          balance: decimalString(input.balance),
          cashierId: ctx.user?.id,
        }).returning();

        for (const item of input.items) {
          await db.insert(saleItems).values({
            saleId: newSale.id,
            productId: item.productId,
            quantity: decimalString(item.quantity),
            unitPrice: decimalString(item.unitPrice),
            discount: decimalString(item.discount),
            total: decimalString(item.total),
          });

          await db.update(products)
            .set({ currentStock: sql`currentStock - ${item.quantity}` })
            .where(eq(products.id, item.productId));
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

        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "sales", recordId: newSale.id, newValue: { invoiceNumber, totalAmount: input.totalAmount, paymentMethod: input.paymentMethod, itemCount: input.items.length } });
        return { success: true, saleId: newSale.id, invoiceNumber };
      }),
  }),

  // ===== STOCK =====
  stock: router({
    stockIn: router({
      list: protectedProcedure.query(async () => {
        return await db.query.stockIn.findMany({ orderBy: desc(stockIn.date), limit: 200 });
      }),

      create: protectedProcedure
        .input(z.object({
          productId: z.number(),
          quantity: z.number(),
          supplierName: z.string().optional(),
          costPerUnit: z.number().default(0),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const totalCost = input.quantity * input.costPerUnit;
          
          const [savedStockIn] = await db.insert(stockIn).values({
            productId: input.productId,
            quantity: decimalString(input.quantity),
            supplierName: input.supplierName,
            costPerUnit: decimalString(input.costPerUnit),
            totalCost: decimalString(totalCost),
            notes: input.notes,
          }).returning();

          await db.update(products)
            .set({ currentStock: sql`currentStock + ${input.quantity}` })
            .where(eq(products.id, input.productId));
          await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "stock_in", recordId: savedStockIn.id, newValue: { productId: input.productId, quantity: input.quantity, totalCost } });

          return { success: true, id: savedStockIn.id };
        }),
    }),

    stockOut: router({
      list: protectedProcedure.query(async () => {
        return await db.query.stockOut.findMany({ orderBy: desc(stockOut.date), limit: 200 });
      }),

      create: protectedProcedure
        .input(z.object({
          productId: z.number(),
          quantity: z.number(),
          reason: z.string().default("sale"),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const [savedStockOut] = await db.insert(stockOut).values({
            productId: input.productId,
            quantity: decimalString(input.quantity),
            reason: input.reason,
            notes: input.notes,
          }).returning();

          await db.update(products)
            .set({ currentStock: sql`currentStock - ${input.quantity}` })
            .where(eq(products.id, input.productId));
          await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "stock_out", recordId: savedStockOut.id, newValue: { productId: input.productId, quantity: input.quantity, reason: input.reason } });

          return { success: true, id: savedStockOut.id };
        }),
    }),
  }),

  // ===== MACHINE JOBS =====
  machineJobs: router({
    create: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        jobType: z.string(),
        inputProduct: z.string(),
        inputKg: z.number(),
        outputProduct1: z.string().optional(),
        outputKg1: z.number().default(0),
        outputProduct2: z.string().optional(),
        outputKg2: z.number().default(0),
        serviceFee: z.number().default(0),
        paymentMethod: z.string().default("cash"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const totalOutput = (input.outputKg1 || 0) + (input.outputKg2 || 0);
        const efficiency = (totalOutput / input.inputKg) * 100;

        return await db.insert(machineJobs).values({
          customerId: input.customerId,
          jobType: input.jobType,
          inputProduct: input.inputProduct,
          inputKg: decimalString(input.inputKg),
          outputProduct1: input.outputProduct1,
          outputKg1: decimalString(input.outputKg1),
          outputProduct2: input.outputProduct2,
          outputKg2: decimalString(input.outputKg2),
          serviceFee: decimalString(input.serviceFee),
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          operatorId: ctx.user?.id,
          efficiency: decimalString(efficiency),
          status: "completed",
        }).returning();
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

    updatePosition: protectedProcedure
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
    create: protectedProcedure
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
    create: protectedProcedure
      .input(z.object({
        category: z.string(),
        amount: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const [savedExpense] = await db.insert(expenses).values({
          category: input.category,
          amount: decimalString(input.amount),
          description: input.description,
          date: new Date(),
        }).returning();
        await recordAuditLog({ userId: ctx.user?.id, action: "create", tableName: "expenses", recordId: savedExpense.id, newValue: { category: input.category, amount: input.amount, description: input.description } });
        return savedExpense;
      }),

    list: protectedProcedure
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

  // ===== DAILY CLOSURES =====
  dailyClosures: router({
    create: protectedProcedure
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
      const todaySales = await db.query.sales.findMany({
        where: gte(sales.createdAt, new Date(new Date().setHours(0, 0, 0, 0))),
      });

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

      return {
        todaySalesTotal,
        todaySalesCount: todaySales.length,
        lowStockCount: lowStock.length,
        totalCustomerDebt,
      };
    }),
  }),

  // ===== ANALYTICS =====
  analytics: router({
    summary: protectedProcedure.query(async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      const [recentSales, recentExpenses] = await Promise.all([
        db.query.sales.findMany({ where: gte(sales.createdAt, start) }),
        db.query.expenses.findMany({ where: gte(expenses.date, start) }),
      ]);
      const daily = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const key = date.toISOString().slice(0, 10);
        const salesTotal = recentSales.filter((sale) => sale.createdAt.toISOString().slice(0, 10) === key).reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
        const expensesTotal = recentExpenses.filter((expense) => expense.date.toISOString().slice(0, 10) === key).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        return { date: key, sales: salesTotal, expenses: expensesTotal, profit: salesTotal - expensesTotal };
      });
      const totalSales = daily.reduce((sum, day) => sum + day.sales, 0);
      const totalExpenses = daily.reduce((sum, day) => sum + day.expenses, 0);
      return { daily, totalSales, totalExpenses, totalProfit: totalSales - totalExpenses };
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

    create: protectedProcedure
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
    recordPayment: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.string().default("cash"),
      }))
      .mutation(async ({ input }) => {
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

        return { success: true, customer: updated, sms };
      }),

    // Send debt-reminder SMS to every customer with an outstanding balance
    sendDebtRemindersBulk: protectedProcedure.mutation(async () => {
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
    create: protectedProcedure
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

    list: protectedProcedure.query(async () => {
      return await db.query.notifications.findMany({
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

    create: protectedProcedure
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
    send: protectedProcedure
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
    sendBulk: protectedProcedure
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
    sendDebtReminder: protectedProcedure
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
    sendSaleConfirmation: protectedProcedure
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
    sendPaymentReceived: protectedProcedure
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
    sendStockAlert: protectedProcedure
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
    sendSalesReceipt: protectedProcedure
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
    sendWelcome: protectedProcedure
      .input(z.object({
        customerPhone: z.string(),
        customerName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { sendWelcomeSms } = await import("@/server/utils/sms");
        return await sendWelcomeSms(input.customerPhone, input.customerName);
      }),

    // Vehicle dispatch SMS template
    sendVehicleDispatch: protectedProcedure
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
    sendLowStockAlert: protectedProcedure
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
