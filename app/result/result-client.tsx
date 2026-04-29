
"use client";

import { useEffect, useState } from "react";

export default function ResultClient() {
  const [photo, setPhoto] = useState(null);
  const [generated, setGenerated] = useState(null);
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
      body: JSON.stringify({
        image: photo,
        prompt: "dog wearing a premium dog collar, realistic"
      })
    });

    const data = await res.json();

    setGenerated(data?.output?.[0] || null);
    setLoading(false);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Provador IA</h1>

      {photo && <img src={photo} style={{ width: "100%" }} />}

      <button onClick={generateAI}>Gerar com IA</button>

      {loading && <p>Gerando...</p>}

      {generated && <img src={generated} style={{ width: "100%" }} />}
    </main>
  );
}
