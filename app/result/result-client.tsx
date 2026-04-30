"use client";

import { useEffect, useState } from "react";

type Product = {
  image: string;
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
    if (savedProduct) setProduct(JSON.parse(savedProduct));
  }, []);

  async function generateAI() {
    if (!photo || !product) return;

    setLoading(true);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photo,
          productImage: product.image, // 🔥 agora dinâmico
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        alert(data?.error || "Erro IA");
        setLoading(false);
        return;
      }

      setGenerated(data.imageUrl);
    } catch {
      alert("Erro inesperado");
    }

    setLoading(false);
  }

  return (
    <main className="p-5 text-white space-y-4">
      {photo && <img src={photo} />}

      <button
        onClick={generateAI}
        className="bg-orange-500 px-4 py-2 rounded"
      >
        {loading ? "Gerando..." : "Gerar com IA"}
      </button>

      {generated && <img src={generated} />}
    </main>
  );
}