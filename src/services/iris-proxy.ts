const IRIS_PROXY_URL = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_IRIS_PROXY_URL ? import.meta.env.VITE_IRIS_PROXY_URL : "http://localhost:3000/api/v1";
const ACTUAL_USDG_ASSET_ID = "rgb:5UQmHEzz-yutdi3a-9KTHgD5-S6Lut5A-0M9DaPQ-X~PHblA";

export interface IrisAssetBalance {
  assetId: string;
  ticker: string;
  settled: number;
  future: number;
}

export async function fetchIrisWalletBalances(walletId: string): Promise<IrisAssetBalance[]> {
  try {
    const response = await fetch(`${IRIS_PROXY_URL}/wallets/${walletId}/balances`);
    if (!response.ok) throw new Error("Failed to contact Iris Proxy Node.");
    return await response.json();
  } catch (error) {
    console.warn("[IRIS PROXY] Offline. Falling back to secure simulated protocol storage.");
    // Fallback to initial local state if node is syncing
    return [{ assetId: ACTUAL_USDG_ASSET_ID, ticker: "USDG", settled: 0, future: 0, _offline: true } as any];
  }
}

export async function sendRgbAsset(invoice: string, amount: number): Promise<string> {
  const response = await fetch(`${IRIS_PROXY_URL}/transfers/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice, amount, assetId: ACTUAL_USDG_ASSET_ID }),
  });
  const data = await response.json();
  return data.txid;
}
