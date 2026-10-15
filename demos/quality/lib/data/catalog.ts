// PURPOSE: The one list of fictional companies, canonical products, legacy model aliases and failure types.
// ROLE: data (SYNTHETIC). USED BY: contracts (ID types), classifier, selectors, components.
// Company names match the ingest demo by value only; nothing here imports from another demo.

import type { CompanyId, FailureType, ModelId, ProductId } from "../contracts";

/** SYNTHETIC: fictional ACS operating companies (acquired brands that still run their own intake). */
export const COMPANIES = [
  { id: "apex-air", name: "Apex Air" },
  { id: "northfield-hvac", name: "Northfield HVAC" },
  { id: "cascade-comfort", name: "Cascade Comfort" },
] as const;

/** SYNTHETIC: canonical ACS-wide product lines; every company's legacy models resolve to one of these. */
export const PRODUCTS = [
  { id: "split-ac-3t", name: "3-ton split AC condenser" },
  { id: "heat-pump-4t", name: "4-ton heat pump" },
  { id: "rtu-10t", name: "10-ton rooftop unit" },
  { id: "furnace-80k", name: "80k BTU gas furnace" },
] as const;

/** SYNTHETIC: each company's legacy model names; aliases match loosely (case, spaces, dashes). SWAP-POINT: ACS product master / PLM part list. */
export const MODELS = [
  { id: "ax-c36", productId: "split-ac-3t", companyId: "apex-air", label: "AX-C36", aliases: ["AX-C36"] },
  { id: "nf-3000s", productId: "split-ac-3t", companyId: "northfield-hvac", label: "NF-3000S", aliases: ["NF-3000S", "NF3K"] },
  { id: "cc-410s", productId: "split-ac-3t", companyId: "cascade-comfort", label: "CC-410S", aliases: ["CC-410S"] },
  { id: "ax-hp48", productId: "heat-pump-4t", companyId: "apex-air", label: "AX-HP48", aliases: ["AX-HP48"] },
  { id: "nf-48hp", productId: "heat-pump-4t", companyId: "northfield-hvac", label: "NF-48HP", aliases: ["NF-48HP"] },
  { id: "cc-hp4", productId: "heat-pump-4t", companyId: "cascade-comfort", label: "CC-HP4", aliases: ["CC-HP4"] },
  { id: "ax-r10", productId: "rtu-10t", companyId: "apex-air", label: "AX-R10", aliases: ["AX-R10"] },
  { id: "nf-rt120", productId: "rtu-10t", companyId: "northfield-hvac", label: "NF-RT120", aliases: ["NF-RT120"] },
  { id: "cc-rtu10", productId: "rtu-10t", companyId: "cascade-comfort", label: "CC-RTU10", aliases: ["CC-RTU10"] },
  { id: "ax-f80", productId: "furnace-80k", companyId: "apex-air", label: "AX-F80", aliases: ["AX-F80"] },
  { id: "nf-80g", productId: "furnace-80k", companyId: "northfield-hvac", label: "NF-80G", aliases: ["NF-80G"] },
  { id: "cc-g80", productId: "furnace-80k", companyId: "cascade-comfort", label: "CC-G80", aliases: ["CC-G80"] },
] as const;

/** Illustrative forced-choice failure list ACS is moving to; ACS owns the real taxonomy. Order is the display order. */
export const FAILURE_TYPES = [
  { id: "compressor_leak", label: "Compressor leak" },
  { id: "coil_leak", label: "Coil leak" },
  { id: "refrigerant_low", label: "Refrigerant low (no leak located)" },
  { id: "control_board_fault", label: "Control board fault" },
  { id: "fan_motor_failure", label: "Fan motor failure" },
  { id: "door_latch_panel", label: "Door latch / panel" },
  { id: "condensate_drain", label: "Condensate drain" },
  { id: "electrical_trip", label: "Electrical / breaker trip" },
] as const;

/** One model record from MODELS. */
export type ModelRecord = (typeof MODELS)[number];

/** Display name for a company ID. */
export function companyName(id: CompanyId): string {
  return COMPANIES.find((company) => company.id === id)?.name ?? id;
}

/** Display name for a canonical product ID. */
export function productName(id: ProductId): string {
  return PRODUCTS.find((product) => product.id === id)?.name ?? id;
}

/** Display label for a failure type. */
export function failureLabel(id: FailureType): string {
  return FAILURE_TYPES.find((failure) => failure.id === id)?.label ?? id;
}

/** Model record for a model ID. */
export function modelById(id: ModelId): ModelRecord {
  const model = MODELS.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Unknown model ${id}`);
  return model;
}

/** Position of a failure type in FAILURE_TYPES; keeps every list in the same order. */
export function failureOrder(id: FailureType): number {
  return FAILURE_TYPES.findIndex((failure) => failure.id === id);
}
