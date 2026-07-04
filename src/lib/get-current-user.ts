import { getRequest } from "@tanstack/react-start/server";
import { decrypt } from "./session";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const request = getRequest();
  if (!request) return null;

  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const sessionCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("session="))
    ?.split("=")[1];

  if (!sessionCookie) return null;

  try {
    const payload = await decrypt(sessionCookie);
    if (!payload || !payload.userId) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    return user || null;
  } catch (error) {
    return null;
  }
}
