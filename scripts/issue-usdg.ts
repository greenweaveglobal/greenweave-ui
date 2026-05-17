// GreenWeave USDG - RGB20 Genesis Parameters (Testnet)
export const USDG_GENESIS_PARAMS = {
  network: "testnet",
  ticker: "USDG",
  name: "GreenWeave Dollar",
  precision: 2, // 2 decimal places for standard representation
  amounts: [2100000000], // 21,000,000.00 USDG (accounting for precision math)
  description: "Decentralized Ecological Biomass-backed Asset",
  // The UTXO from the architect's testnet wallet that will hold the initial supply
  blindedUtxo: "PLACEHOLDER_FOR_ARCHITECTS_BLINDED_UTXO",
};

console.log("[RGB PROTOCOL] USDG Genesis Configuration Ready.");
console.log("Awaiting Testnet UTXO binding...");
