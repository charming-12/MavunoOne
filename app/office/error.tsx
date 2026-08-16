"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { logErrorToServer } from "@/lib/error-logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OfficeError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error details for debugging
    console.error("🚨 Office Section Error:", {
      section: "office",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // Send to server for logging and email notification
    logErrorToServer(
      error.message,
      error.stack,
      "/office"
    );
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hitilafu kwenye Ofisi</h1>
        <p className="text-gray-600 mb-4">
          Karibu, hitilafu imetokea katika sehemu ya ofisi. Tafadhali jaribu tena au rudi nyuma.
        </p>

        {/* Error Details (Dev Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 p-3 rounded mb-6 text-left text-xs text-gray-700 overflow-auto max-h-32">
            <p className="font-semibold text-red-600 mb-2">Debug Info:</p>
            <p className="break-words">{error.message}</p>
            {error.digest && <p className="text-gray-500 mt-2">ID: {error.digest}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Jaribu Tena
          </button>
          <Link
            href="/office"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Nyuma
          </Link>
        </div>
      </div>
    </div>
  );
}
