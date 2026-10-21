"use client";

// PURPOSE: Lets a person set or override product, model, failure type (and, for a new complaint, company) before a ticket counts.
// ROLE: component. USED BY: ticket-review.tsx, complaint-intake.tsx.
// HUMAN-GATE: the person's choice replaces the classifier's; product and failure are required so the ticket can count.

import { useState } from "react";
import type { CompanyId, FailureType, ModelId, ProductId, TicketTags } from "../lib/contracts";
import { COMPANIES, FAILURE_TYPES, MODELS, PRODUCTS, companyName } from "../lib/data/catalog";
import type { Correction } from "../lib/state/reducer";
import { BUTTON, FIELD, SectionLabel } from "./ui";

/** Correction form, prefilled from the current tags (or the first competing failure type).
 *  Pass `company` (the current value or null) to also ask for the company; it is then required. */
export function CorrectionForm({
  tags,
  possibleFailureTypes,
  company,
  saveLabel = "Save tags",
  onSave,
  onCancel,
}: {
  tags: Pick<TicketTags, "productId" | "modelId" | "failureType">;
  possibleFailureTypes: readonly FailureType[];
  company?: CompanyId | null;
  saveLabel?: string;
  onSave: (correction: Correction) => void;
  onCancel: () => void;
}) {
  const askCompany = company !== undefined;
  const [companyId, setCompanyId] = useState<CompanyId | "">(company ?? "");
  const [productId, setProductId] = useState<ProductId | "">(tags.productId ?? "");
  const [modelId, setModelId] = useState<ModelId | "">(tags.modelId ?? "");
  const [failureType, setFailureType] = useState<FailureType | "">(tags.failureType ?? possibleFailureTypes[0] ?? "");
  const models = MODELS.filter((model) => model.productId === productId);

  return (
    <form
      className="space-y-3 rounded-xl border border-line-strong bg-canvas px-3 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!productId || !failureType || (askCompany && !companyId)) return;
        onSave({ productId, modelId: modelId || null, failureType, ...(companyId ? { companyId } : {}) });
      }}
    >
      <div className={`grid gap-3 ${askCompany ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {askCompany ? (
          <label className="space-y-1">
            <SectionLabel>Company</SectionLabel>
            <select value={companyId} onChange={(event) => setCompanyId(event.target.value as CompanyId | "")} className={FIELD}>
              <option value="">Choose…</option>
              {COMPANIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
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
        <button type="submit" disabled={!productId || !failureType || (askCompany && !companyId)} className={BUTTON.primary}>
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
