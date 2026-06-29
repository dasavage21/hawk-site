import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers"; // Wait, TanStack Start, not Next.js.
// In TanStack Start, we can use server functions and getCookie/setCookie from 'vinxi/http' or similar.
// But TanStack Start also has its own cookie handling if using server functions.

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_change_me_in_production"
);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, secret, {
    algorithms: ["HS256"],
  });
  return payload;
}
