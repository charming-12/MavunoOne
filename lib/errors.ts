/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Global Error Handler Utility
 * Provides consistent error responses and logging
 */

import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: unknown,
    message: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends Error {
  constructor(
    public operation: string,
    public table: string,
    message: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(
    public resource: string,
    public id: unknown
  ) {
    super(`${resource} with id ${id} not found`);
    this.name = "ResourceNotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Convert errors to TRPC errors
 */
export function handleError(error: unknown, context: string = "Operation"): TRPCError {
  // Log the error
  console.error(`[${context}] Error:`, error);

  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof ZodError) {
    const issues = (error as any).issues || (error as any).errors || [];
    const message = (issues as any[])
      .map((issue: any) => `${(issue.path || []).join(".")}: ${issue.message}`)
      .join(", ");
    return new TRPCError({
      code: "BAD_REQUEST",
      message: `Validation Error: ${message}`,
    });
  }

  if (error instanceof ValidationError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
    });
  }

  if (error instanceof ResourceNotFoundError) {
    return new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message: error.message,
    });
  }

  if (error instanceof DatabaseError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Database error: ${error.message}`,
    });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}

/**
 * Safe async wrapper for TRPC procedures
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorContext: string = "Operation"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handleError(error, errorContext);
  }
}

/**
 * Validate amount fields (prices, stock quantities, etc.)
 */
export function validateAmount(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; allowNegative?: boolean } = {}
): number {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    throw new ValidationError(fieldName, value, `${fieldName} must be a valid number`);
  }

  if (!options.allowNegative && amount < 0) {
    throw new ValidationError(fieldName, amount, `${fieldName} cannot be negative`);
  }

  if (options.min !== undefined && amount < options.min) {
    throw new ValidationError(
      fieldName,
      amount,
      `${fieldName} must be at least ${options.min}`
    );
  }

  if (options.max !== undefined && amount > options.max) {
    throw new ValidationError(
      fieldName,
      amount,
      `${fieldName} must not exceed ${options.max}`
    );
  }

  return amount;
}

/**
 * Validate phone numbers (Tanzania format)
 */
export function validatePhone(phone: string | undefined, fieldName: string = "Phone"): string | undefined {
  if (!phone) return undefined;

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 10) {
    throw new ValidationError(fieldName, phone, `${fieldName} must be at least 10 digits`);
  }

  if (cleaned.length > 15) {
    throw new ValidationError(fieldName, phone, `${fieldName} must not exceed 15 digits`);
  }

  return phone;
}

/**
 * Validate email addresses
 */
export function validateEmail(email: string | undefined, fieldName: string = "Email"): string | undefined {
  if (!email) return undefined;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(fieldName, email, `${fieldName} is not a valid email address`);
  }

  return email;
}

/**
 * Validate text fields
 */
export function validateText(
  value: string | undefined,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): string | undefined {
  if (!value) {
    if (options.required) {
      throw new ValidationError(fieldName, value, `${fieldName} is required`);
    }
    return undefined;
  }

  const trimmed = value.trim();

  if (options.min !== undefined && trimmed.length < options.min) {
    throw new ValidationError(
      fieldName,
      value,
      `${fieldName} must be at least ${options.min} characters`
    );
  }

  if (options.max !== undefined && trimmed.length > options.max) {
    throw new ValidationError(
      fieldName,
      value,
      `${fieldName} must not exceed ${options.max} characters`
    );
  }

  return trimmed;
}

/**
 * Format error response for API
 */
export function formatErrorResponse(error: unknown, includeStack = false) {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof TRPCError) {
    return {
      code: error.code,
      message: error.message,
      ...(includeStack && !isProduction && { stack: error.cause }),
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction ? "An error occurred" : error.message,
      ...(includeStack && !isProduction && { stack: error.stack }),
    };
  }

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  };
}
