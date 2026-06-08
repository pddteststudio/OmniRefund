import type { Receipt } from "@/types";

const LAST_RECEIPT_KEY = "omni_refund_last_receipt";
const RECEIPTS_KEY = "omni_refund_receipts";

function safeParseReceipt(raw: string | null): Receipt | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Receipt;
  } catch {
    return null;
  }
}

function safeParseReceipts(raw: string | null): Receipt[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Receipt[]) : [];
  } catch {
    return [];
  }
}

export function saveReceipt(receipt: Receipt) {
  if (typeof window === "undefined") return;

  const current = getReceipts();
  const withoutDuplicate = current.filter((item) => item.refundId !== receipt.refundId);
  const next = [receipt, ...withoutDuplicate].slice(0, 30);

  window.localStorage.setItem(LAST_RECEIPT_KEY, JSON.stringify(receipt));
  window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(next));
}

export function getReceipt(): Receipt | null {
  if (typeof window === "undefined") return null;

  const lastReceipt = safeParseReceipt(window.localStorage.getItem(LAST_RECEIPT_KEY));
  if (lastReceipt) return lastReceipt;

  const receipts = getReceipts();
  return receipts[0] || null;
}

export function getReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];
  return safeParseReceipts(window.localStorage.getItem(RECEIPTS_KEY));
}

export function clearReceipt() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_RECEIPT_KEY);
}

export function clearReceipts() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_RECEIPT_KEY);
  window.localStorage.removeItem(RECEIPTS_KEY);
}
