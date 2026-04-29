"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StepShell } from "@/components/StepShell";
import { DogzeProduct, dogzeProducts, getShopifyProductUrl } from "@/lib/products";

export default function ResultClient() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [product, setProduct] = useState<DogzeProduct>(dogzeProducts[0]);
  const [loading, setLoading] = useState(true);
  const shopifyUrl = useMemo(() => getShopifyProductUrl(product.handle), [product.handle]);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem("dogze_pet_photo");
    const savedProduct = sessionStorage.getItem("dogze_product");
    if (savedPhoto) setPhoto(savedPhoto);
    if (savedProduct) {
      try { setProduct(JSON.parse(savedProduct)); } catch { setProduct(dogzeProducts[0]); }
    }
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <StepShell eyebrow="Resultado" title="Prévia pronta" description="Esta é a base do fluxo. Depois conectamos a IA para aplicar o produto no pet automaticamente.">
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-dogze-panel dogze-glow">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Pet no provador virtual" className="h-[390px] w-full object-cover" />
          ) : (
            <div className="grid h-[390px] place-items-center px-6 text-center text-dogze-muted">Nenhuma foto carregada.</div>
          )}

          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-dogze-orange/40 bg-black/70 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-dogze-orange">Produto escolhido</p>
                <p className="truncate text-base font-bold text-white">{product.name}</p>
                <p className="text-sm font-bold text-dogze-muted">{product.price}</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-black/72 backdrop-blur-sm">
              <div className="text-center">
                <Sparkles className="mx-auto animate-pulse text-dogze-orange" size={42} />
                <p className="mt-4 text-lg font-bold">Gerando prévia...</p>
              </div>
            </div>
          )}
        </div>

        <PrimaryButton href={shopifyUrl}>Comprar agora</PrimaryButton>
        <PrimaryButton href={`/try-on?handle=${product.handle}`} variant="outline">
          <RefreshCw size={18} /><span className="ml-2">Trocar foto</span>
        </PrimaryButton>
      </div>
    </StepShell>
  );
}
