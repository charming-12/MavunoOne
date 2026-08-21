import { pgTable, serial, varchar, decimal, boolean, timestamp, text, integer, pgEnum } from "drizzle-orm/pg-core";

// ===== 1. ROLES (Aina za Watumiaji) =====
export const roleEnum = pgEnum("role", [
  "boss", "owner", "manager", "cashier", "storekeeper",
  "machine_operator", "customer", "admin"
]);

// ===== 2. USERS (Watumiaji wa Mfumo) =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  phone: varchar("phone", { length: 32 }),
  jobTitle: varchar("jobTitle", { length: 128 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: roleEnum("role").default("customer").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 3. CATEGORIES (Makundi ya Bidhaa/Mazao) =====
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 4. PRODUCTS (Bidhaa, Bei, na Stock) =====
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  barcode: varchar("barcode", { length: 64 }).unique(),
  imageUrl: text("imageUrl"),
  productType: varchar("productType", { length: 32 }).default("finished_goods").notNull(),
  categoryId: integer("categoryId"),
  unit: varchar("unit", { length: 32 }).default("kg").notNull(),
  packageSizeKg: decimal("packageSizeKg", { precision: 12, scale: 3 }).default("1").notNull(),
  costPrice: decimal("costPrice", { precision: 12, scale: 2 }).default("0").notNull(),
  sellPrice: decimal("sellPrice", { precision: 12, scale: 2 }).default("0").notNull(),
  wholesalePrice: decimal("wholesalePrice", { precision: 12, scale: 2 }).default("0"),
  machineServicePrice: decimal("machineServicePrice", { precision: 12, scale: 2 }).default("0"),
  lowStockThreshold: decimal("lowStockThreshold", { precision: 10, scale: 2 }).default("10").notNull(),
  currentStock: decimal("currentStock", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ===== 5. CUSTOMERS (Wateja na Madeni) =====
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  customerType: varchar("customerType", { length: 32 }).default("retail").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  creditLimit: decimal("creditLimit", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 6. SALES (Mauzo na Malipo) =====
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull().unique(),
  customerId: integer("customerId"),
  customerType: varchar("customerType", { length: 32 }).default("walk_in").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0").notNull(),
  taxAmount: decimal("taxAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("cash").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("paid").notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  cashierId: integer("cashierId"),
  status: varchar("status", { length: 32 }).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 7. SALE ITEMS =====
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("saleId").notNull(),
  productId: integer("productId").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  baseQuantity: decimal("baseQuantity", { precision: 12, scale: 3 }).default("0").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
});

// ===== 8. STOCK IN =====
export const stockIn = pgTable("stock_in", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  entryUnit: varchar("entryUnit", { length: 32 }).default("kg").notNull(),
  baseQuantity: decimal("baseQuantity", { precision: 12, scale: 3 }).default("0").notNull(),
  packageCount: decimal("packageCount", { precision: 12, scale: 2 }),
  packageWeightKg: decimal("packageWeightKg", { precision: 12, scale: 3 }),
  packageWeightsKg: text("packageWeightsKg"),
  supplierName: varchar("supplierName", { length: 256 }),
  supplierPhone: varchar("supplierPhone", { length: 32 }),
  sourceType: varchar("sourceType", { length: 32 }).default("supplier"),
  purchaseReference: varchar("purchaseReference", { length: 128 }),
  batchNumber: varchar("batchNumber", { length: 128 }),
  vehicleReference: varchar("vehicleReference", { length: 128 }),
  warehouseLocation: varchar("warehouseLocation", { length: 128 }),
  receivedBy: varchar("receivedBy", { length: 256 }),
  qualityStatus: varchar("qualityStatus", { length: 32 }).default("accepted"),
  costPerUnit: decimal("costPerUnit", { precision: 12, scale: 2 }).default("0"),
  totalCost: decimal("totalCost", { precision: 12, scale: 2 }).default("0"),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
});

// ===== 9. STOCK OUT =====
export const stockOut = pgTable("stock_out", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  baseQuantity: decimal("baseQuantity", { precision: 12, scale: 3 }).default("0").notNull(),
  packageCount: decimal("packageCount", { precision: 12, scale: 2 }),
  packageWeightKg: decimal("packageWeightKg", { precision: 12, scale: 3 }),
  packageWeightsKg: text("packageWeightsKg"),
  reason: varchar("reason", { length: 32 }).default("sale").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
});

// ===== 10. MACHINE JOBS =====
export const machineJobs = pgTable("machine_jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId"),
  jobType: varchar("jobType", { length: 64 }).notNull(),
  operationType: varchar("operationType", { length: 32 }).default("internal_production").notNull(),
  inputProduct: varchar("inputProduct", { length: 256 }).notNull(),
  inputKg: decimal("inputKg", { precision: 12, scale: 2 }).notNull(),
  inputUnit: varchar("inputUnit", { length: 32 }).default("kg").notNull(),
  inputQuantity: decimal("inputQuantity", { precision: 12, scale: 2 }).default("0").notNull(),
  inputUnitSize: decimal("inputUnitSize", { precision: 12, scale: 3 }).default("1").notNull(),
  outputProduct1: varchar("outputProduct1", { length: 256 }),
  outputKg1: decimal("outputKg1", { precision: 12, scale: 2 }).default("0"),
  outputProduct2: varchar("outputProduct2", { length: 256 }),
  outputKg2: decimal("outputKg2", { precision: 12, scale: 2 }).default("0"),
  serviceFee: decimal("serviceFee", { precision: 12, scale: 2 }).default("0"),
  serviceUnit: varchar("serviceUnit", { length: 32 }).default("kg"),
  serviceQuantity: decimal("serviceQuantity", { precision: 12, scale: 2 }).default("0"),
  serviceRate: decimal("serviceRate", { precision: 12, scale: 2 }).default("0"),
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("cash"),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("paid"),
  operatorId: integer("operatorId"),
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 32 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 11. VEHICLES =====
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plateNumber: varchar("plateNumber", { length: 32 }).notNull(),
  model: varchar("model", { length: 128 }),
  color: varchar("color", { length: 64 }),
  gpsDeviceId: varchar("gpsDeviceId", { length: 64 }),
  status: varchar("status", { length: 32 }).default("idle"),
  lastPositionLat: decimal("lastPositionLat", { precision: 10, scale: 6 }),
  lastPositionLng: decimal("lastPositionLng", { precision: 10, scale: 6 }),
  lastUpdate: timestamp("lastUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 12. DELIVERIES =====
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicleId"),
  driverName: varchar("driverName", { length: 128 }),
  driverPhone: varchar("driverPhone", { length: 32 }),
  destination: text("destination"),
  totalWeight: decimal("totalWeight", { precision: 12, scale: 2 }).default("0"),
  departureTime: timestamp("departureTime"),
  arrivalTime: timestamp("arrivalTime"),
  status: varchar("status", { length: 32 }).default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 13. EXPENSES =====
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 32 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
});

// ===== 14. DAILY CLOSURES =====
export const dailyClosures = pgTable("daily_closures", {
  id: serial("id").primaryKey(),
  openingBalance: decimal("openingBalance", { precision: 12, scale: 2 }).default("0"),
  closingBalance: decimal("closingBalance", { precision: 12, scale: 2 }).default("0"),
  expectedBalance: decimal("expectedBalance", { precision: 12, scale: 2 }),
  variance: decimal("variance", { precision: 12, scale: 2 }).default("0"),
  date: timestamp("date").defaultNow().notNull(),
  cashierId: integer("cashierId"),
  notes: text("notes"),
});

// ===== 15. NOTIFICATIONS =====
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 32 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 16. DATA BACKUPS (For reset/restore safety) =====
export const dataBackups = pgTable("data_backups", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 128 }).default("sample_data_backup").notNull(),
  snapshot: text("snapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: integer("createdBy"),
});

// ===== 17. AUDIT LOGS =====
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 32 }).notNull(),
  tableName: varchar("tableName", { length: 128 }).notNull(),
  recordId: integer("recordId"),
  oldValueJson: text("oldValueJson"),
  newValueJson: text("newValueJson"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ===== 18. PUBLIC CONTENT (Approved marketing and Shop content) =====
export const publicContent = pgTable("public_content", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  contentType: varchar("contentType", { length: 32 }).default("announcement").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: varchar("subtitle", { length: 512 }),
  body: text("body"),
  imageUrl: text("imageUrl"),
  ctaLabel: varchar("ctaLabel", { length: 128 }),
  ctaHref: varchar("ctaHref", { length: 512 }),
  status: varchar("status", { length: 32 }).default("draft").notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdBy: integer("createdBy"),
  reviewedBy: integer("reviewedBy"),
  publishedBy: integer("publishedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  publishedAt: timestamp("publishedAt"),
});

// ===== 18. CONFIGURATIONS (Dynamic Settings & Credentials) =====
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  updatedBy: integer("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ===== 19. PASSWORD RESET TOKENS =====
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  otpCodeHash: varchar("otpCodeHash", { length: 128 }),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 20. ERROR LOGS (For Error Notification & Debugging) =====
export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  errorMessage: text("errorMessage").notNull(),
  stackTrace: text("stackTrace"),
  route: varchar("route", { length: 256 }),
  userId: integer("userId"),
  severity: varchar("severity", { length: 32 }).default("error"),
  isResolved: boolean("isResolved").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 21. FARMERS (Wakulima) =====
export const farmers = pgTable("farmers", {
  id: serial("id").primaryKey(),
  farmerNumber: varchar("farmerNumber", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  location: varchar("location", { length: 128 }),
  farmSize: decimal("farmSize", { precision: 10, scale: 2 }),
  farmSizeUnit: varchar("farmSizeUnit", { length: 16 }).default("acres").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 22. FARMER PAYMENTS / PURCHASE LEDGER =====
export const farmerPayments = pgTable("farmer_payments", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmerId").notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  quantityKg: decimal("quantityKg", { precision: 12, scale: 2 }).notNull(),
  pricePerKg: decimal("pricePerKg", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("cash").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("unpaid").notNull(),
  paymentReference: varchar("paymentReference", { length: 128 }),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 23. MACHINE MAINTENANCE =====
export const maintenanceCosts = pgTable("maintenance_costs", {
  id: serial("id").primaryKey(),
  machineName: varchar("machineName", { length: 128 }).notNull(),
  maintenanceType: varchar("maintenanceType", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  serviceDate: timestamp("serviceDate").defaultNow().notNull(),
  nextDueDate: timestamp("nextDueDate"),
  vendorName: varchar("vendorName", { length: 256 }),
  notes: text("notes"),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 24. STOCK RECONCILIATIONS =====
export const stockReconciliations = pgTable("stock_reconciliations", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  systemQuantity: decimal("systemQuantity", { precision: 12, scale: 2 }).notNull(),
  countedQuantity: decimal("countedQuantity", { precision: 12, scale: 2 }).notNull(),
  variance: decimal("variance", { precision: 12, scale: 2 }).notNull(),
  adjustmentReason: varchar("adjustmentReason", { length: 64 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 32 }).default("approved").notNull(),
  countedBy: integer("countedBy"),
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== 25. FARMER PAYMENT APPROVALS =====
export const farmerPaymentApprovals = pgTable("farmer_payment_approvals", {
  id: serial("id").primaryKey(),
  farmerPaymentId: integer("farmerPaymentId").notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  requestedBy: integer("requestedBy").notNull(),
  approvedBy: integer("approvedBy"),
  paidBy: integer("paidBy"),
  paymentReference: varchar("paymentReference", { length: 128 }),
  rejectionReason: text("rejectionReason"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
});
