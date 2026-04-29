"use client";

import { useEffect, useState } from "react";

export default function ResultClient() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem("dogze_pet_photo");
    if (savedPhoto) setPhoto(savedPhoto);
  }, []);

  async function generateAI() {
    if (!photo) return;

    setLoading(true);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photo,

          // 👇 PRODUTO REAL (trocar depois dinamicamente)
          productImage:
            "https://cdn.shopify.com/s/files/1/0000/0000/products/exemplo.png",
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
    <main className="p-5 text-white">
      {photo && <img src={photo} />}

      <button onClick={generateAI}>
        {loading ? "Gerando..." : "Gerar com IA"}
      </button>

      {generated && <img src={generated} />}
    </main>
  );
}