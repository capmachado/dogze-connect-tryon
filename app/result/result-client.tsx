"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  type: "coleira" | "peitoral" | "guia" | "combo";
  handle: string;
  price: string;
  image: string;
  description: string;
  sizes: string[];
};

export default function ResultClient() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem("dogze_pet_photo");
    const savedProduct = sessionStorage.getItem("dogze_product");

    if (savedPhoto) setPhoto(savedPhoto);

    if (savedProduct) {
      try {
        setProduct(JSON.parse(savedProduct));
      } catch {
        setProduct(null);
      }
    }
  }, []);

  async function generateTryOn() {
    if (!photo || !product) return;

    setLoading(true);
    setGenerated(null);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photo,
          productImage: product.image,
          productId: product.id,
          productType: product.type,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        alert(data?.error || "Erro ao gerar provador");
        setLoading(false);
        return;
      }

      setGenerated(data.imageUrl);
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao gerar provador");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-dogze-bg p-5 text-white">
      <div className="mx-auto max-w-md space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-dogze-orange">
            DOGZE Connect
          </p>
          <h1 className="mt-2 text-2xl font-black">Resultado do provador</h1>
          <p className="mt-2 text-sm leading-6 text-dogze-muted">
            Para melhor resultado, use foto lateral ou 3/4 lateral, com o peito
            do pet visível.
          </p>
        </div>

        {product && (
          <div className="rounded-2xl border border-white/10 bg-dogze-panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-dogze-muted">
              Produto selecionado
            </p>
            <p className="mt-2 font-bold">{product.name}</p>
          </div>
        )}

        {photo && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <img
              src={photo}
              alt="Foto original do pet"
              className="w-full object-cover"
            />
          </div>
        )}

        <button
          onClick={generateTryOn}
          disabled={!photo || !product || loading}
          className="w-full rounded-2xl bg-dogze-orange px-5 py-4 text-sm font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Gerando provador..." : "Gerar provador V2.3"}
        </button>

        {generated && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-dogze-muted">
              Prévia gerada:
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <img
                src={generated}
                alt="Resultado do provador virtual"
                className="w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}