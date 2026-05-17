export const USDG_ASSET_SCHEMA = {
  ticker: "USDG",
  name: "GreenWeave Dollar",
  assetId: typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_RGB_ASSET_ID ? import.meta.env.VITE_RGB_ASSET_ID : "rgb:mock_genesis_id_pending_deployment",
  maxSupply: 21000000,
  interface: "RGB20"
};
