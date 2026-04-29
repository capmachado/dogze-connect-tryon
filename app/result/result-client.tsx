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

    const res = await fetch("/api/tryon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: photo,
        prompt: "dog wearing a premium dog collar, realistic",
      }),
    });

    const data = await res.json();

    setGenerated(data?.output?.[0] || null);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-dogze-bg p-5 text-white">
      <h1 className="dogze-title text-[42px] leading-tight">
        Provador IA
      </h1>

      <div className="mt-6 space-y-5">
        {photo && (
          <img
            src={photo}
            alt="Foto do pet"
            className="w-full rounded-3xl border border-white/10"
          />
        )}

        <button
          onClick={generateAI}
          disabled={!photo || loading}
          className="min-h-[56px] w-full rounded-xl bg-dogze-orange px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar com IA"}
        </button>

        {generated && (
          <img
            src={generated}
            alt="Resultado gerado por IA"
            className="w-full rounded-3xl border border-dogze-orange/40"
          />
        )}
      </div>
    </main>
  );
}