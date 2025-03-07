import { decode } from "jsonwebtoken";

export function tokenIsDiscloudJwt(token: string): boolean {
  try {
    const payload = decode(token, { json: true });
    return payload && "id" in payload && "key" in payload || false;
  } catch { }
  return false;
}
