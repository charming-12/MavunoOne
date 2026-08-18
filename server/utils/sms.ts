/**
 * NextSMS Integration Service
 * Handles safe, concise SMS notifications for MavunoOne.
 */

const NEXTSMS_USERNAME = process.env.NEXTSMS_USERNAME || "josiahmarco93.e9b";
const NEXTSMS_PASSWORD = process.env.NEXTSMS_PASSWORD;
const NEXTSMS_TOKEN = process.env.NEXTSMS_TOKEN || process.env.NEXTSMS_API_TOKEN;
const NEXTSMS_API_URL = process.env.NEXTSMS_API_URL || "https://api.nextsms.com/sms/send";
const DEFAULT_SENDER_ID = process.env.NEXTSMS_SENDER_ID || "MAVUNO";

export interface SendSmsParams {
  phone: string;
  message: string;
  senderID?: string;
}

export interface SmsResponse {
  success: boolean;
  messageID?: string;
  status?: string;
  error?: string;
  details?: unknown;
}

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
};

const shortenMessage = (message: string) => message.replace(/\s+/g, " ").trim().slice(0, 160);

export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;

  const digitsOnly = phone.replace(/\D/g, "");

  if (phone.startsWith("+")) {
    return digitsOnly.length === 12 && digitsOnly.startsWith("255");
  }

  if (phone.startsWith("0")) {
    return phone.length === 10 && /^0[67][0-9]{8}$/.test(phone);
  }

  if (phone.startsWith("255")) {
    return digitsOnly.length === 12 && digitsOnly.startsWith("255");
  }

  return false;
}

export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith("0")) {
    cleaned = `255${cleaned.slice(1)}`;
  }

  return cleaned;
}

export async function sendSms(params: SendSmsParams): Promise<SmsResponse> {
  try {
    if (!params.phone) {
      return { success: false, error: "Phone number is required" };
    }

    if (!params.message || params.message.trim().length === 0) {
      return { success: false, error: "Message content is required" };
    }

    if (!validatePhoneNumber(params.phone)) {
      return {
        success: false,
        error: `Invalid phone number format: ${params.phone}. Use a Tanzanian format such as 0789... or +255...`,
      };
    }

    const normalizedPhone = normalizePhoneNumber(params.phone);
    const senderID = params.senderID || DEFAULT_SENDER_ID;
    const messageText = shortenMessage(params.message);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (NEXTSMS_TOKEN) {
      headers.Authorization = `Bearer ${NEXTSMS_TOKEN}`;
    } else if (NEXTSMS_PASSWORD) {
      const basic = Buffer.from(`${NEXTSMS_USERNAME}:${NEXTSMS_PASSWORD}`).toString("base64");
      headers.Authorization = `Basic ${basic}`;
    }

    const payload = {
      username: NEXTSMS_USERNAME,
      password: NEXTSMS_PASSWORD,
      token: NEXTSMS_TOKEN,
      sender_id: senderID,
      senderID,
      recipient: normalizedPhone,
      phone: normalizedPhone,
      to: normalizedPhone,
      message: messageText,
      text: messageText,
    };

    const response = await fetch(NEXTSMS_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: String(response.status),
        error: `NextSMS API returned ${response.status}`,
        details: result,
      };
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(result) as Record<string, unknown>;
    } catch {
      parsed = { raw: result };
    }

    const parsedDetails = parsed as Record<string, unknown>;
    const success =
      parsedDetails.success === true ||
      parsedDetails.status === "success" ||
      typeof parsedDetails.messageID !== "undefined" ||
      typeof parsedDetails.id !== "undefined";

    if (success) {
      return {
        success: true,
        messageID: String(parsedDetails.messageID ?? parsedDetails.id ?? "nextsms-ok"),
        status: String(parsedDetails.status ?? "sent"),
        details: parsedDetails,
      };
    }

    return {
      success: false,
      error: String(parsedDetails.error ?? parsedDetails.message ?? "Unknown error from NextSMS API"),
      status: typeof parsedDetails.status === "string" ? parsedDetails.status : undefined,
      details: parsedDetails,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[SMS] Unexpected error: ${message}`);
    return { success: false, error: `Failed to send SMS: ${message}` };
  }
}

export async function sendBulkSms(recipients: string[], message: string, senderID?: string): Promise<SmsResponse[]> {
  return Promise.all(recipients.map((phone) => sendSms({ phone, message, senderID })));
}

export function buildSalesReceiptSms({
  customerName,
  invoiceNumber,
  items,
  totalAmount,
}: {
  customerName: string;
  invoiceNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}): string {
  const summary = items.slice(0, 2).map((item) => `${item.name} ${item.quantity}x${formatCurrency(item.price)}`).join(", ");
  const tail = items.length > 2 ? "..." : "";

  return shortenMessage(
    `Habari ${customerName}, MavunoOne imethibitisha manunuzi yako. Risiti ${invoiceNumber}: ${summary}${tail}. Jumla TZS ${formatCurrency(totalAmount)}. Asante kwa kutuamini.`
  );
}

export async function sendSalesReceiptSms(
  customerPhone: string,
  customerName: string,
  invoiceNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number
): Promise<SmsResponse> {
  const message = buildSalesReceiptSms({ customerName, invoiceNumber, items, totalAmount });
  return sendSms({ phone: customerPhone, message, senderID: "MAVUNO-SALE" });
}

export async function sendSaleConfirmationSms(
  customerPhone: string,
  customerName: string,
  saleAmount: number,
  receiptNumber: string
): Promise<SmsResponse> {
  const message = buildSalesReceiptSms({
    customerName,
    invoiceNumber: receiptNumber,
    items: [{ name: "Sale", quantity: 1, price: saleAmount }],
    totalAmount: saleAmount,
  });

  return sendSms({
    phone: customerPhone,
    message,
    senderID: "MAVUNO-SALE",
  });
}

export function buildDebtReminderSms({ customerName, remainingBalance }: { customerName: string; remainingBalance: number }): string {
  return shortenMessage(
    `Kumbusho kwa ${customerName}: Deni lako la MavunoOne lililobaki ni TZS ${formatCurrency(remainingBalance)}. Tafadhali lipa ili huduma zako ziendelee vizuri. Asante.`
  );
}

export async function sendDebtReminderSms(
  customerPhone: string,
  customerName: string,
  dueAmount: number,
  daysOverdue: number
): Promise<SmsResponse> {
  const message = buildDebtReminderSms({
    customerName,
    remainingBalance: dueAmount,
  });

  return sendSms({
    phone: customerPhone,
    message: `${message} Siku ${daysOverdue} zilizochelewa.`,
    senderID: "MAVUNO-DEBT",
  });
}

export function buildWelcomeSms(customerName: string): string {
  return shortenMessage(
    `Karibu ${customerName} kwenye MavunoOne. Akaunti yako imefunguliwa kwa mafanikio. Tuko tayari kukuhudumia kwa uaminifu na haraka.`
  );
}

export async function sendWelcomeSms(customerPhone: string, customerName: string): Promise<SmsResponse> {
  return sendSms({
    phone: customerPhone,
    message: buildWelcomeSms(customerName),
    senderID: "MAVUNO-WEL",
  });
}

export function buildVehicleDispatchSms({
  invoiceNumber,
  destination,
  vehicleNumber,
  driverName,
  driverPhone,
}: {
  invoiceNumber: string;
  destination: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
}): string {
  return shortenMessage(
    `MavunoOne: Order ${invoiceNumber} imetumwa kwenda ${destination}. Gari ${vehicleNumber}, dereva ${driverName} (${driverPhone}). Tutakujulisha hatua inayofuata.`
  );
}

export async function sendVehicleDispatchSms({
  recipientPhone,
  invoiceNumber,
  destination,
  vehicleNumber,
  driverName,
  driverPhone,
}: {
  recipientPhone: string;
  invoiceNumber: string;
  destination: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
}): Promise<SmsResponse> {
  const message = buildVehicleDispatchSms({
    invoiceNumber,
    destination,
    vehicleNumber,
    driverName,
    driverPhone,
  });

  return sendSms({
    phone: recipientPhone,
    message,
    senderID: "MAVUNO-DELIV",
  });
}

export function buildLowStockAlertSms({ productName, currentStock }: { productName: string; currentStock: number }): string {
  return shortenMessage(
    `Tahadhari ya stock: ${productName} imefika ${currentStock} kg, chini ya kiwango cha usalama. Tafadhali panga replenishment mapema.`
  );
}

export async function sendStockAlertSms(
  managerPhone: string,
  productName: string,
  currentStock: number,
  minimumLevel: number
): Promise<SmsResponse> {
  const message = buildLowStockAlertSms({ productName, currentStock });
  return sendSms({
    phone: managerPhone,
    message: `${message} Min ${minimumLevel}.`,
    senderID: "MAVUNO-STOCK",
  });
}

export async function sendPaymentReceivedSms(
  customerPhone: string,
  customerName: string,
  paymentAmount: number,
  remainingBalance: number
): Promise<SmsResponse> {
  const message = shortenMessage(
    `Habari ${customerName}, tumepokea malipo yako ya TZS ${formatCurrency(paymentAmount)} kwa MavunoOne. Salio lililobaki ni TZS ${formatCurrency(remainingBalance)}. Asante.`
  );

  return sendSms({
    phone: customerPhone,
    message,
    senderID: "MAVUNO-PAY",
  });
}

export function buildMachineServiceSms({ customerName, jobType, inputKg, outputSummary, fee }: { customerName: string; jobType: string; inputKg: number; outputSummary: string; fee: number }) {
  return shortenMessage(`Habari ${customerName}, huduma ya ${jobType} imekamilika. Input ${inputKg} kg; output ${outputSummary}. Ada TZS ${formatCurrency(fee)}. MavunoOne inakushukuru.`);
}

export async function sendMachineServiceSms(phone: string, customerName: string, jobType: string, inputKg: number, outputSummary: string, fee: number): Promise<SmsResponse> {
  return sendSms({ phone, message: buildMachineServiceSms({ customerName, jobType, inputKg, outputSummary, fee }), senderID: "MAVUNO-MILL" });
}

export function buildFarmerPaymentSms({ farmerName, productName, amount, balance }: { farmerName: string; productName: string; amount: number; balance: number }) {
  return shortenMessage(`Mpendwa ${farmerName}, MavunoOne imesajili malipo ya TZS ${formatCurrency(amount)} kwa ${productName}. Salio lako lililobaki ni TZS ${formatCurrency(balance)}. Asante kwa ushirikiano.`);
}

export async function sendFarmerPaymentSms(phone: string, farmerName: string, productName: string, amount: number, balance: number): Promise<SmsResponse> {
  return sendSms({ phone, message: buildFarmerPaymentSms({ farmerName, productName, amount, balance }), senderID: "MAVUNO-FARM" });
}
