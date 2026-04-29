"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CameraUpload } from "@/components/CameraUpload";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProductSummary } from "@/components/ProductSummary";
import { StepShell } from "@/components/StepShell";
import { createProductFromSearchParams } from "@/lib/products";

export default function TryOnClient() {
  const searchParams = useSearchParams();
  const [photo, setPhoto] = useState<string | null>(null);
  const selectedProduct = useMemo(() => createProductFromSearchParams(searchParams), [searchParams]);

  function goToResult() {
    if (!photo) return;
    sessionStorage.setItem("dogze_pet_photo", photo);
    sessionStorage.setItem("dogze_product", JSON.stringify(selectedProduct));
    window.location.href = "/result";
  }

  return (
    <StepShell eyebrow="Provador Virtual" title="Fotografe seu pet" description="O produto já vem selecionado a partir da página da loja.">
      <div className="space-y-7">
        <ProductSummary product={selectedProduct} />
        <CameraUpload photo={photo} onPhoto={setPhoto} />
        <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-dogze-bg via-dogze-bg to-transparent px-5 pb-5 pt-8">
          <PrimaryButton onClick={goToResult} disabled={!photo}>Gerar prévia</PrimaryButton>
        </div>
      </div>
    </StepShell>
  );
}
