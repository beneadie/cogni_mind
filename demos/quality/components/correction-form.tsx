"use client";

// PURPOSE: Lets a person set or override product, model and failure type before a ticket counts.
// ROLE: component. USED BY: ticket-review.tsx.
// HUMAN-GATE: the person's choice replaces the classifier's; product and failure are required so the ticket can count.

import { useState } from "react";
import type { FailureType, ModelId, ProductId, TicketTags } from "../lib/contracts";
import { FAILURE_TYPES, MODELS, PRODUCTS, companyName } from "../lib/data/catalog";
import type { Correction } from "../lib/state/reducer";
import { BUTTON, FIELD, SectionLabel } from "./ui";

/** Correction form, prefilled from the current tags (or the first competing failure type). */
export function CorrectionForm({
  tags,
  possibleFailureTypes,
  onSave,
  onCancel,
}: {
  tags: Pick<TicketTags, "productId" | "modelId" | "failureType">;
  possibleFailureTypes: readonly FailureType[];
  onSave: (correction: Correction) => void;
  onCancel: () => void;
}) {
  const [productId, setProductId] = useState<ProductId | "">(tags.productId ?? "");
  const [modelId, setModelId] = useState<ModelId | "">(tags.modelId ?? "");
  const [failureType, setFailureType] = useState<FailureType | "">(tags.failureType ?? possibleFailureTypes[0] ?? "");
  const models = MODELS.filter((model) => model.productId === productId);

  return (
    <form
      className="space-y-3 rounded-xl border border-line-strong bg-canvas px-3 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (productId && failureType) onSave({ productId, modelId: modelId || null, failureType });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1">
          <SectionLabel>Product</SectionLabel>
          <select
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value as ProductId | "");
              setModelId("");
            }}
            className={FIELD}
          >
            <option value="">Choose…</option>
            {PRODUCTS.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <SectionLabel>Model</SectionLabel>
          <select value={modelId} onChange={(event) => setModelId(event.target.value as ModelId | "")} disabled={!productId} className={FIELD}>
            <option value="">Unknown</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label} ({companyName(model.companyId)})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <SectionLabel>Failure type</SectionLabel>
          <select value={failureType} onChange={(event) => setFailureType(event.target.value as FailureType | "")} className={FIELD}>
            <option value="">Choose…</option>
            {FAILURE_TYPES.map((failure) => (
              <option key={failure.id} value={failure.id}>
                {failure.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>
          Cancel
        </button>
        <button type="submit" disabled={!productId || !failureType} className={BUTTON.primary}>
          Save tags
        </button>
      </div>
    </form>
  );
}
