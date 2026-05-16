export interface QuantumEcoPayload {
  eventId: string; // SHA-256 Hash of the entire object (The immutable fingerprint)
  pubkey: string; // The Node's Hex Pubkey
  timestamp: number; // Unix epoch in milliseconds
  
  // The AI-Ready Tensor Data
  telemetry: {
    species_hash: string; // Keccak256 of identified species
    confidence_score: number; // e.g., 0.985
    biomass_volume_est: number; // Estimated carbon mass
    visual_spectral_hash: string; // Hash of the raw image/multispectral data
  };
  
  // The OpSec ZK-Location (NO RAW GPS)
  spatial_zkp: {
    region_geohash_blurred: string; // e.g., "w3g" (Coarse resolution)
    validity_proof: string; // Mock ZK-SNARK string proving it's in a valid eco-zone
  };
  
  // State Machine
  status: "PENDING_CONSENSUS" | "ALIVE_LOCKED" | "DEAD_BURNED";
}
