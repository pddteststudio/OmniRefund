export function toBaseUnits(amount: string, decimals: number) {
  const normalized = amount.replace(",", ".").trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error("Enter a valid positive amount.");

  const [whole, fraction = ""] = normalized.split(".");
  const padded = fraction.padEnd(decimals, "0").slice(0, decimals);
  const value = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");

  if (value <= 0n) throw new Error("Amount must be greater than zero.");
  return value.toString();
}

export function fromBaseUnits(units: string | number | bigint | undefined, decimals: number, maxFractionDigits = 6) {
  if (units === undefined || units === null) return "0";
  const value = BigInt(String(units));
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  const fractionText = fraction.toString().padStart(decimals, "0").slice(0, maxFractionDigits).replace(/0+$/, "");
  return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
}

export function formatAddress(value: string, left = 6, right = 6) {
  if (!value) return "Not set";
  if (value.length <= left + right + 3) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
}

export async function sha256Text(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
