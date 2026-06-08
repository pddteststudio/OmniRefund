export function shortAddress(address?: string) {
  if (!address) return "Not connected";
  if (address.length <= 18) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function toUnits(amount: string, decimals: number) {
  const [wholeRaw, fractionRaw = ""] = amount.split(".");
  const whole = wholeRaw.replace(/\D/g, "") || "0";
  const fraction = fractionRaw.replace(/\D/g, "").padEnd(decimals, "0").slice(0, decimals);
  return `${whole}${fraction}`.replace(/^0+(?=\d)/, "");
}

export function fromUnits(units: string, decimals: number, maxFractionDigits = 6) {
  const clean = units.replace(/\D/g, "") || "0";
  const padded = clean.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  const value = fraction ? `${whole}.${fraction}` : whole;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return value;
  return numberValue.toLocaleString("en", {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false
  });
}
