import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { isPrivilegedRole } from "@/lib/session";

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user || !isPrivilegedRole(user.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { deviceId, type } = body as { deviceId: string; type: string };

    let message = "";
    let success = true;

    switch (type) {
      case "printer":
        message = `Printa ESC/POS (${deviceId}) haijathibitishwa na hardware bridge. Unganisha kifaa halisi kisha jaribu tena.`;
        success = false;
        break;

      case "scale":
        message = `Scale (${deviceId}) haijathibitishwa na hardware bridge. Unganisha kifaa halisi kisha jaribu tena.`;
        success = false;
        break;

      case "rfid":
        message = `RFID (${deviceId}) haijathibitishwa na hardware bridge. Unganisha kifaa halisi kisha jaribu tena.`;
        success = false;
        break;

      default:
        message = `? Aina ya maalim haijajulikana: ${type}`;
        success = false;
    }

    return NextResponse.json({
      success,
      message,
      deviceId,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Hardware test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Kosa la mtihani: ${String(error)}`,
      },
      { status: 500 }
    );
  }
}
