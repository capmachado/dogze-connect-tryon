import { NextResponse } from "next/server";

type ReplicatePrediction = {
  id?: string;
  status?: string;
  output?: string | string[] | null;
  error?: string | null;
};

function getOutputUrl(output: ReplicatePrediction["output"]) {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output[0] ?? null;
  return null;
}

export async function POST(req: Request) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Token Replicate não configurado." },
        { status: 500 }
      );
    }

    const { image, productImage } = await req.json();

    const prompt = `
Use the EXACT product from the reference image.

- Do NOT invent a new collar
- Copy colors, texture and shape from the product image
- Place it naturally on the dog's neck
- Keep lighting and realism consistent
- Do not change the dog

Product reference image is provided.
`;

    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            input_image: image,
            prompt,
            // 👇 IMPORTANTE
            // concatenamos imagens no prompt (hack simples)
            image_prompt: productImage,
          },
        }),
      }
    );

    const prediction = (await response.json()) as ReplicatePrediction;

    if (!response.ok || prediction.error) {
      return NextResponse.json(
        { error: prediction.error || "Erro IA" },
        { status: 500 }
      );
    }

    const imageUrl = getOutputUrl(prediction.output);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "IA não retornou imagem ainda." },
        { status: 202 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro inesperado" },
      { status: 500 }
    );
  }
}