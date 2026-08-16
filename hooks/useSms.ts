import { trpc } from "@/lib/trpc";
import { useState } from "react";

export interface UseSmsResult {
  isSending: boolean;
  error: string | null;
  success: boolean;
  messageID?: string;
  sendSms: (phone: string, message: string, senderID?: string) => Promise<void>;
  sendDebtReminder: (
    customerPhone: string,
    customerName: string,
    dueAmount: number,
    daysOverdue: number
  ) => Promise<void>;
  sendSaleConfirmation: (
    customerPhone: string,
    customerName: string,
    saleAmount: number,
    receiptNumber: string
  ) => Promise<void>;
  sendPaymentReceived: (
    customerPhone: string,
    customerName: string,
    paymentAmount: number,
    remainingBalance: number
  ) => Promise<void>;
  sendStockAlert: (
    managerPhone: string,
    productName: string,
    currentStock: number,
    minimumLevel: number
  ) => Promise<void>;
}

/**
 * Custom hook for sending SMS notifications
 * Handles all SMS operations with loading and error states
 */
export function useSms(): UseSmsResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [messageID, setMessageID] = useState<string | undefined>();

  const sendSmsMutation = trpc.sms.send.useMutation();
  const sendDebtReminderMutation = trpc.sms.sendDebtReminder.useMutation();
  const sendSaleConfirmationMutation = trpc.sms.sendSaleConfirmation.useMutation();
  const sendPaymentReceivedMutation = trpc.sms.sendPaymentReceived.useMutation();
  const sendStockAlertMutation = trpc.sms.sendStockAlert.useMutation();

  const sendSms = async (
    phone: string,
    message: string,
    senderID?: string
  ) => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const result = await sendSmsMutation.mutateAsync({
        phone,
        message,
        senderID,
      });

      if (result.success) {
        setSuccess(true);
        setMessageID(result.messageID);
      } else {
        setError(result.error || "Failed to send SMS");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const sendDebtReminder = async (
    customerPhone: string,
    customerName: string,
    dueAmount: number,
    daysOverdue: number
  ) => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const result = await sendDebtReminderMutation.mutateAsync({
        customerPhone,
        customerName,
        dueAmount,
        daysOverdue,
      });

      if (result.success) {
        setSuccess(true);
        setMessageID(result.messageID);
      } else {
        setError(result.error || "Failed to send debt reminder");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const sendSaleConfirmation = async (
    customerPhone: string,
    customerName: string,
    saleAmount: number,
    receiptNumber: string
  ) => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const result = await sendSaleConfirmationMutation.mutateAsync({
        customerPhone,
        customerName,
        saleAmount,
        receiptNumber,
      });

      if (result.success) {
        setSuccess(true);
        setMessageID(result.messageID);
      } else {
        setError(result.error || "Failed to send sale confirmation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const sendPaymentReceived = async (
    customerPhone: string,
    customerName: string,
    paymentAmount: number,
    remainingBalance: number
  ) => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const result = await sendPaymentReceivedMutation.mutateAsync({
        customerPhone,
        customerName,
        paymentAmount,
        remainingBalance,
      });

      if (result.success) {
        setSuccess(true);
        setMessageID(result.messageID);
      } else {
        setError(result.error || "Failed to send payment notification");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const sendStockAlert = async (
    managerPhone: string,
    productName: string,
    currentStock: number,
    minimumLevel: number
  ) => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const result = await sendStockAlertMutation.mutateAsync({
        managerPhone,
        productName,
        currentStock,
        minimumLevel,
      });

      if (result.success) {
        setSuccess(true);
        setMessageID(result.messageID);
      } else {
        setError(result.error || "Failed to send stock alert");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    error,
    success,
    messageID,
    sendSms,
    sendDebtReminder,
    sendSaleConfirmation,
    sendPaymentReceived,
    sendStockAlert,
  };
}
