import { NextResponse } from "next/server";
import { isRuntimeReady } from "@/lib/runtime-config";

export async function GET() {
  try {
    const status = await isRuntimeReady();
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error("Runtime readiness check failed:", error);
    return NextResponse.json(
      { ready: false, missing: [], message: "Unable to verify runtime readiness" },
      { status: 500 }
    );
  }
}
