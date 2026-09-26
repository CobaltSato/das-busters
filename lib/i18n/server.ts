import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, toLocale, type Locale } from "./config";
import { messagesFor, type Messages } from "./index";

export async function getLocale(): Promise<Locale> {
  return toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

export async function getMessages(): Promise<Messages> {
  return messagesFor(await getLocale());
}
