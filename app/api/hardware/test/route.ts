import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, type } = body as { deviceId: string; type: string };

    // Simulate hardware test based on type
    let message = "";
    let success = true;

    switch (type) {
      case "printer":
        // Simulate ESC/POS printer test
        message = `✓ Printa ESC/POS (${deviceId}) inatumia mafanikio. Kutoka kwa mtihani: "Hello MavunoOne"`;
        break;

      case "scale":
        // Simulate weighing scale test
        const weight = (Math.random() * 5 + 0.1).toFixed(2);
        message = `✓ Kiwanja (${deviceId}) inatumia mafanikio. Uzani wa mtihani: ${weight} kg`;
        break;

      case "rfid":
        // Simulate RFID test
        message = `✓ Mtambua RFID (${deviceId}) inatumia mafanikio. Kadi imekubaliana.`;
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
