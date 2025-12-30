import { headers } from "next/headers";

export async function getCurrentTime(): Promise<Date> {
  if (process.env.TEST_MODE === "1") {
    const headersList = await headers();
    const testNowMs = headersList.get("x-test-now-ms");
    if (testNowMs) {
      return new Date(parseInt(testNowMs, 10));
    }
  }
  return new Date();
}
