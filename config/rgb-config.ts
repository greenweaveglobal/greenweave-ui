export const USDG_ASSET_SCHEMA = {
  ticker: "USDG",
  name: "GreenWeave Dollar",
  assetId: typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_RGB_ASSET_ID ? import.meta.env.VITE_RGB_ASSET_ID : "rgb:5UQmHEzz-yutdi3a-9KTHgD5-S6Lut5A-0M9DaPQ-X~PHblA",
  maxSupply: 21000000,
  interface: "RGB20"
};
