"use client";

import { useEffect, useState } from "react";

export default function ResultClient() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem("dogze_pet_photo");

    if (savedPhoto !== null) {
      setPhoto(savedPhoto);
    }
  }, []);

  async function generateAI() {
    if (!photo) return;

    setLoading(true);
    setGenerated(null);
    setDebug(null);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photo,
          productName: "coleira premium dogze",
        }),
      });

      const data = await res.json();

      // 👇 MOSTRA no console
      console.log("RESPOSTA IA:", data);

      // 👇 MOSTRA na tela
      setDebug(data);

      if (!res.ok || data?.error) {
        alert(data?.error || "Erro ao gerar imagem com IA.");
        setLoading(false);
        return;
      }

      const imageUrl =
        data?.imageUrl ||
        (Array.isArray(data?.output) ? data.output[0] : data?.output);

      if (!imageUrl) {
        alert("A IA não retornou imagem ainda.");
        setLoading(false);
        return;
      }

      setGenerated(imageUrl);
    } catch (error) {
      alert("Erro inesperado ao chamar IA.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-dogze-bg p-5 text-white">
      <h1 className="dogze-title text-[42px] leading-tight">
        Provador IA
      </h1>

      <div className="mt-6 space-y-5">
        {/* FOTO ORIGINAL */}
        {photo && (
          <img
            src={photo}
            alt="Foto do pet"
            className="w-full rounded-3xl border border-white/10"
          />
        )}

        {/* BOTÃO */}
        <button
          onClick={generateAI}
          disabled={!photo || loading}
          className="min-h-[56px] w-full rounded-xl bg-dogze-orange px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar com IA"}
        </button>

        {/* RESULTADO */}
        {generated && (
          <div className="space-y-3">
            <p className="text-sm text-dogze-muted">
              Resultado da IA:
            </p>

            <img
              src={generated}
              alt="Resultado IA"
              className="w-full rounded-3xl border border-dogze-orange/40"
            />
          </div>
        )}

        {/* DEBUG (ESSENCIAL AGORA) */}
        {debug && (
          <div className="mt-5 rounded-xl bg-black/40 p-3 text-xs text-green-400">
            <p className="mb-2 font-bold">DEBUG IA:</p>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}