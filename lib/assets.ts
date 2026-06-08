import type { TonAsset } from "@/types";

export const KNOWN_TON_ASSETS: TonAsset[] = [
  {
    symbol: "TON",
    displayName: "Toncoin",
    contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    decimals: 9,
    source: "known_default"
  },
  {
    symbol: "USDT",
    displayName: "Tether USD",
    contractAddress: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    decimals: 6,
    source: "known_default"
  },
  {
    symbol: "STON",
    displayName: "STON",
    contractAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
    decimals: 9,
    source: "known_default"
  }
];

export function normalizeAsset(raw: any): TonAsset | null {
  const symbol = raw?.meta?.symbol || raw?.meta?.displayName || raw?.symbol || raw?.displayName;
  const contractAddress = raw?.contractAddress || raw?.address || raw?.jettonAddress;
  const decimals = Number(raw?.meta?.decimals ?? raw?.decimals ?? 9);

  if (!symbol || !contractAddress || !Number.isFinite(decimals)) return null;

  return {
    symbol: String(symbol),
    displayName: String(raw?.meta?.displayName || raw?.meta?.name || symbol),
    contractAddress: String(contractAddress),
    decimals,
    imageUrl: raw?.meta?.imageUrl || raw?.meta?.image || undefined,
    source: "ston_api"
  };
}

export function mergeAssets(apiAssets: TonAsset[]) {
  const byAddress = new Map<string, TonAsset>();

  for (const asset of [...KNOWN_TON_ASSETS, ...apiAssets]) {
    byAddress.set(asset.contractAddress, asset);
  }

  const assets = [...byAddress.values()].sort((a, b) => {
    const preferred = ["TON", "USDT", "STON"];
    const ai = preferred.indexOf(a.symbol);
    const bi = preferred.indexOf(b.symbol);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.symbol.localeCompare(b.symbol);
  });

  return assets;
}

export function findAsset(assets: TonAsset[], address: string) {
  return assets.find((asset) => asset.contractAddress === address) || null;
}
