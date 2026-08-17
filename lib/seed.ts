import { db } from "./db";
import * as schema from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

const requiredSeedSecret = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} must be configured before seeding`);
  return value;
};

const SEED_SUPER_ADMIN_EMAIL = process.env.MAVUNO_SUPER_ADMIN_EMAIL ?? "admin@mavunoone.co.tz";
const SEED_SUPER_ADMIN_PASSWORD = requiredSeedSecret(process.env.MAVUNO_SUPER_ADMIN_PASSWORD, "MAVUNO_SUPER_ADMIN_PASSWORD");
const SEED_BOSS_EMAIL = process.env.MAVUNO_BOSS_EMAIL ?? "boss@mavunoone.co.tz";
const SEED_BOSS_PASSWORD = requiredSeedSecret(process.env.MAVUNO_BOSS_PASSWORD, "MAVUNO_BOSS_PASSWORD");

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await db.delete(schema.users).execute();
    await db.delete(schema.categories).execute();
    await db.delete(schema.products).execute();
    await db.delete(schema.customers).execute();
    await db.delete(schema.vehicles).execute();
    await db.delete(schema.sales).execute();
    await db.delete(schema.saleItems).execute();
    await db.delete(schema.stockIn).execute();
    await db.delete(schema.stockOut).execute();
    await db.delete(schema.deliveries).execute();
    await db.delete(schema.machineJobs).execute();
    await db.delete(schema.expenses).execute();
    await db.delete(schema.dailyClosures).execute();
    await db.delete(schema.notifications).execute();

    // ===== USERS =====
    const superAdminHash = await hashPassword(SEED_SUPER_ADMIN_PASSWORD);
    const bossHash = await hashPassword(SEED_BOSS_PASSWORD);

    const users = await db
      .insert(schema.users)
      .values([
        {
          name: "Super Admin",
          email: SEED_SUPER_ADMIN_EMAIL,
          phone: "+255700000000",
          passwordHash: superAdminHash,
          role: "admin",
        },
        {
          name: "Mzee Kisiri",
          email: SEED_BOSS_EMAIL,
          phone: "+255700000001",
          passwordHash: bossHash,
          role: "boss",
        },
        {
          name: "John Manager",
          email: "manager@mavunoone.co.tz",
          phone: "+255700000002",
          role: "manager",
        },
        {
          name: "Jane Cashier",
          email: "cashier@mavunoone.co.tz",
          phone: "+255700000003",
          role: "cashier",
        },
        {
          name: "Peter Storekeeper",
          email: "store@mavunoone.co.tz",
          phone: "+255700000004",
          role: "storekeeper",
        },
        {
          name: "Grace Operator",
          email: "operator@mavunoone.co.tz",
          phone: "+255700000005",
          role: "machine_operator",
        },
        {
          name: "Ahmed Customer",
          email: "customer1@example.com",
          phone: "+255700000010",
          role: "customer",
        },
        {
          name: "Mariam Customer",
          email: "customer2@example.com",
          phone: "+255700000011",
          role: "customer",
        },
      ])
      .returning();

    console.log(`✓ Created ${users.length} users`);

    // ===== CATEGORIES =====
    const categories = await db
      .insert(schema.categories)
      .values([
        { name: "Mahindi", description: "Bidhaa za mahindi na bidhaa zinazotokana na mahindi" },
        { name: "Alizeti", description: "Bidhaa za alizeti na pembejeo za kilimo" },
        { name: "Uduvi", description: "Bidhaa za uduvi, chakula na bidhaa za mifugo" },
        { name: "Chokaa", description: "Chokaa, viambajengo na nyongeza za kilimo" },
        { name: "Animal Feeds", description: "Chakula cha wanyama, lishe na bidhaa za mifugo" },
        { name: "Sukari & Chumvi", description: "Bidhaa za matumizi ya nyumbani na biashara" },
        { name: "Mafuta Alizeti", description: "Mafuta ya alizeti na bidhaa zinazotokana" },
      ])
      .returning();

    console.log(`✓ Created ${categories.length} categories`);

    // ===== PRODUCTS =====
    const products = await db
      .insert(schema.products)
      .values([
        {
          name: "Mahindi ya kawaida",
          categoryId: categories[0].id,
          unit: "kg",
          costPrice: "800",
          sellPrice: "1200",
          wholesalePrice: "1000",
          lowStockThreshold: "50",
          currentStock: "500",
          isActive: true,
        },
        {
          name: "Unga wa Mahindi",
          categoryId: categories[0].id,
          unit: "kg",
          costPrice: "1200",
          sellPrice: "1800",
          wholesalePrice: "1500",
          lowStockThreshold: "30",
          currentStock: "200",
          isActive: true,
        },
        {
          name: "Alizeti Green",
          categoryId: categories[1].id,
          unit: "kg",
          costPrice: "3000",
          sellPrice: "4500",
          wholesalePrice: "4000",
          lowStockThreshold: "20",
          currentStock: "150",
          isActive: true,
        },
        {
          name: "Mafuta Alizeti",
          categoryId: categories[5].id,
          unit: "liter",
          costPrice: "8000",
          sellPrice: "12000",
          wholesalePrice: "10000",
          lowStockThreshold: "10",
          currentStock: "80",
          isActive: true,
        },
        {
          name: "Uduvi Safi",
          categoryId: categories[2].id,
          unit: "kg",
          costPrice: "4000",
          sellPrice: "6000",
          wholesalePrice: "5500",
          lowStockThreshold: "15",
          currentStock: "90",
          isActive: true,
        },
        {
          name: "Chokaa ya Kuzuia Pest",
          categoryId: categories[3].id,
          unit: "kg",
          costPrice: "500",
          sellPrice: "800",
          wholesalePrice: "700",
          lowStockThreshold: "40",
          currentStock: "300",
          isActive: true,
        },
        {
          name: "Chakula cha Wanyama",
          categoryId: categories[4].id,
          unit: "kg",
          costPrice: "600",
          sellPrice: "1000",
          wholesalePrice: "900",
          lowStockThreshold: "50",
          currentStock: "200",
          isActive: true,
        },
      ])
      .returning();

    console.log(`✓ Created ${products.length} products`);

    // ===== CUSTOMERS =====
    const customers = await db
      .insert(schema.customers)
      .values([
        {
          name: "John's Retail Store",
          phone: "+255700100001",
          email: "john@retail.com",
          customerType: "retail",
          balance: "0",
          creditLimit: "500000",
          isActive: true,
        },
        {
          name: "Dar Wholesale Traders",
          phone: "+255700100002",
          email: "wholesale@dar.com",
          customerType: "wholesale",
          balance: "200000",
          creditLimit: "2000000",
          isActive: true,
        },
        {
          name: "Restaurant Nyama Yummy",
          phone: "+255700100003",
          email: "restaurant@nyama.com",
          customerType: "restaurant",
          balance: "0",
          creditLimit: "1000000",
          isActive: true,
        },
        {
          name: "Mariam's Shop",
          phone: "+255700100004",
          email: "mariam@shop.com",
          customerType: "retail",
          balance: "150000",
          creditLimit: "300000",
          isActive: true,
        },
        {
          name: "Cooperative Ifuatiliaji",
          phone: "+255700100005",
          email: "coop@ifuatiliaji.com",
          customerType: "cooperative",
          balance: "500000",
          creditLimit: "3000000",
          isActive: true,
        },
      ])
      .returning();

    console.log(`✓ Created ${customers.length} customers`);

    // ===== VEHICLES =====
    const vehicles = await db
      .insert(schema.vehicles)
      .values([
        {
          plateNumber: "KG456AB",
          model: "Isuzu Truck",
          color: "White",
          gpsDeviceId: "GPS-001",
          status: "active",
          lastPositionLat: "-6.8",
          lastPositionLng: "39.3",
          lastUpdate: new Date(),
        },
        {
          plateNumber: "TZ789CD",
          model: "Toyota Van",
          color: "Blue",
          gpsDeviceId: "GPS-002",
          status: "active",
          lastPositionLat: "-6.8",
          lastPositionLng: "37.7",
          lastUpdate: new Date(),
        },
        {
          plateNumber: "RO123EF",
          model: "Volvo Truck",
          color: "Red",
          gpsDeviceId: "GPS-003",
          status: "active",
          lastPositionLat: "-8.8",
          lastPositionLng: "35.7",
          lastUpdate: new Date(),
        },
        {
          plateNumber: "RJ456GH",
          model: "Suzuki Van",
          color: "Yellow",
          gpsDeviceId: "GPS-004",
          status: "maintenance",
          lastPositionLat: null,
          lastPositionLng: null,
          lastUpdate: new Date(),
        },
      ])
      .returning();

    console.log(`✓ Created ${vehicles.length} vehicles`);

    // ===== SALES =====
    const sales = await db
      .insert(schema.sales)
      .values([
        {
          invoiceNumber: `INV-${Date.now()}-001`,
          customerId: customers[0].id,
          customerType: "retail",
          totalAmount: "450000",
          paymentMethod: "cash",
          paymentStatus: "paid",
          paidAmount: "450000",
          balance: "0",
          cashierId: users[2].id,
          status: "completed",
          createdAt: new Date(),
        },
        {
          invoiceNumber: `INV-${Date.now()}-002`,
          customerId: customers[1].id,
          customerType: "wholesale",
          totalAmount: "1200000",
          paymentMethod: "credit",
          paymentStatus: "partial",
          paidAmount: "600000",
          balance: "600000",
          cashierId: users[2].id,
          status: "completed",
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          invoiceNumber: `INV-${Date.now()}-003`,
          customerId: customers[2].id,
          customerType: "restaurant",
          totalAmount: "800000",
          paymentMethod: "cash",
          paymentStatus: "paid",
          paidAmount: "800000",
          balance: "0",
          cashierId: users[2].id,
          status: "completed",
          createdAt: new Date(Date.now() - 7200000),
        },
      ])
      .returning();

    console.log(`✓ Created ${sales.length} sales`);

    // ===== SALE ITEMS =====
    const saleItems = await db
      .insert(schema.saleItems)
      .values([
        {
          saleId: sales[0].id,
          productId: products[0].id,
          quantity: "100",
          unitPrice: "1200",
          discount: "0",
          total: "120000",
        },
        {
          saleId: sales[0].id,
          productId: products[2].id,
          quantity: "25",
          unitPrice: "4500",
          discount: "50000",
          total: "62500",
        },
        {
          saleId: sales[0].id,
          productId: products[4].id,
          quantity: "20",
          unitPrice: "6000",
          discount: "0",
          total: "120000",
        },
        {
          saleId: sales[1].id,
          productId: products[0].id,
          quantity: "500",
          unitPrice: "1000",
          discount: "0",
          total: "500000",
        },
        {
          saleId: sales[1].id,
          productId: products[1].id,
          quantity: "200",
          unitPrice: "1500",
          discount: "100000",
          total: "200000",
        },
        {
          saleId: sales[2].id,
          productId: products[2].id,
          quantity: "80",
          unitPrice: "4500",
          discount: "100000",
          total: "260000",
        },
        {
          saleId: sales[2].id,
          productId: products[3].id,
          quantity: "20",
          unitPrice: "12000",
          discount: "0",
          total: "240000",
        },
        {
          saleId: sales[2].id,
          productId: products[5].id,
          quantity: "100",
          unitPrice: "800",
          discount: "0",
          total: "80000",
        },
      ])
      .returning();

    console.log(`✓ Created ${saleItems.length} sale items`);

    // ===== STOCK IN =====
    const stockIns = await db
      .insert(schema.stockIn)
      .values([
        {
          productId: products[0].id,
          quantity: "500",
          supplierName: "Mzee Supplier",
          supplierPhone: "+255700200001",
          costPerUnit: "800",
          totalCost: "400000",
          date: new Date(Date.now() - 86400000),
          notes: "Fresh batch from Kilimanjaro",
        },
        {
          productId: products[1].id,
          quantity: "200",
          supplierName: "Milling Company",
          supplierPhone: "+255700200002",
          costPerUnit: "1200",
          totalCost: "240000",
          date: new Date(Date.now() - 172800000),
          notes: "Good quality flour",
        },
        {
          productId: products[4].id,
          quantity: "90",
          supplierName: "Fishing Cooperative",
          supplierPhone: "+255700200003",
          costPerUnit: "4000",
          totalCost: "360000",
          date: new Date(Date.now() - 259200000),
          notes: "Fresh catch from coast",
        },
      ])
      .returning();

    console.log(`✓ Created ${stockIns.length} stock-in records`);

    // ===== DELIVERIES =====
    const deliveries = await db
      .insert(schema.deliveries)
      .values([
        {
          vehicleId: vehicles[0].id,
          driverName: "Peter Mwangi",
          driverPhone: "+255700300001",
          destination: "Dar es Salaam - Kariakoo Market",
          totalWeight: "1500",
          departureTime: new Date(Date.now() - 3600000),
          arrivalTime: null,
          status: "in_transit",
          notes: "Delivering 500kg Mahindi to Kariakoo",
        },
        {
          vehicleId: vehicles[1].id,
          driverName: "Hassan Ali",
          driverPhone: "+255700300002",
          destination: "Morogoro - Regional Hub",
          totalWeight: "800",
          departureTime: new Date(Date.now() - 7200000),
          arrivalTime: new Date(Date.now() - 3600000),
          status: "completed",
          notes: "Delivered wholesale to regional hub",
        },
        {
          vehicleId: vehicles[2].id,
          driverName: "Grace Kamau",
          driverPhone: "+255700300003",
          destination: "Iringa - Restaurant Nyama Yummy",
          totalWeight: "500",
          departureTime: new Date(Date.now() - 14400000),
          arrivalTime: new Date(Date.now() - 10800000),
          status: "completed",
          notes: "Delivered restaurant supplies",
        },
      ])
      .returning();

    console.log(`✓ Created ${deliveries.length} deliveries`);

    // ===== MACHINE JOBS =====
    const machineJobs = await db
      .insert(schema.machineJobs)
      .values([
        {
          customerId: customers[0].id,
          jobType: "Corn Milling",
          inputProduct: "Mahindi",
          inputKg: "500",
          outputProduct1: "Unga wa Mahindi",
          outputKg1: "450",
          serviceFee: "50000",
          paymentMethod: "cash",
          paymentStatus: "paid",
          operatorId: users[4].id,
          efficiency: "90",
          status: "completed",
          notes: "Quality milling, no spillage",
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          customerId: customers[2].id,
          jobType: "Oil Pressing",
          inputProduct: "Alizeti",
          inputKg: "100",
          outputProduct1: "Mafuta Alizeti",
          outputKg1: "30",
          outputProduct2: "Pomace",
          outputKg2: "70",
          serviceFee: "80000",
          paymentMethod: "cash",
          paymentStatus: "paid",
          operatorId: users[4].id,
          efficiency: "95",
          status: "completed",
          notes: "Premium oil extracted successfully",
          createdAt: new Date(Date.now() - 172800000),
        },
      ])
      .returning();

    console.log(`✓ Created ${machineJobs.length} machine jobs`);

    // ===== EXPENSES =====
    const expenses = await db
      .insert(schema.expenses)
      .values([
        {
          category: "Fuel",
          amount: "200000",
          description: "Fuel for vehicles",
          date: new Date(Date.now() - 86400000),
        },
        {
          category: "Maintenance",
          amount: "150000",
          description: "Vehicle maintenance and repairs",
          date: new Date(Date.now() - 172800000),
        },
        {
          category: "Staff",
          amount: "1000000",
          description: "Monthly salaries",
          date: new Date(Date.now() - 259200000),
        },
        {
          category: "Utilities",
          amount: "80000",
          description: "Electricity and water",
          date: new Date(Date.now() - 345600000),
        },
      ])
      .returning();

    console.log(`✓ Created ${expenses.length} expenses`);

    // ===== NOTIFICATIONS =====
    const notifications = await db
      .insert(schema.notifications)
      .values([
        {
          type: "stock_alert",
          title: "Stock na Chini - Mahindi",
          message: "Mahindi stock ni ndani ya 50kg threshold. Tafadhali jaza stock.",
          isRead: false,
          userId: users[0].id,
          createdAt: new Date(),
        },
        {
          type: "delivery_update",
          title: "Delivery Complete - KG456AB",
          message: "Vehicle KG456AB amefika Dar es Salaam kwa usalama.",
          isRead: false,
          userId: users[0].id,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          type: "sale_alert",
          title: "Sale Recorded",
          message: "Uza 450,000 TZS umerekodiwa kwa customer John's Retail.",
          isRead: true,
          userId: users[2].id,
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          type: "payment_alert",
          title: "Customer Credit Alert",
          message: "Dar Wholesale Traders ana credit ya 600,000 TZS.",
          isRead: true,
          userId: users[1].id,
          createdAt: new Date(Date.now() - 86400000),
        },
      ])
      .returning();

    console.log(`✓ Created ${notifications.length} notifications`);

    console.log("✅ Database seeded successfully!");
    return {
      users: users.length,
      categories: categories.length,
      products: products.length,
      customers: customers.length,
      vehicles: vehicles.length,
      sales: sales.length,
      deliveries: deliveries.length,
      machineJobs: machineJobs.length,
      expenses: expenses.length,
      notifications: notifications.length,
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
