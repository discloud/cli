import { decodeJwt } from "jose";

export function tokenIsDiscloudJwt(token: string): boolean {
  try {
    const payload = decodeJwt(token);
    return payload && "id" in payload && "key" in payload || false;
  } catch { return false; }
}
