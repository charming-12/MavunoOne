// Client-side error logging utility
export async function logErrorToServer(
  errorMessage: string,
  stackTrace?: string,
  route?: string
) {
  try {
    const response = await fetch("/api/errors/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorMessage,
        stackTrace,
        route,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Failed to log error to server");
    }
  } catch (error) {
    console.error("Error logging failed:", error);
  }
}
