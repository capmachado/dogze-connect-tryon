import { NextResponse } from "next/server";

type ReplicatePrediction = {
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
Apply the EXACT harness from the product image onto the dog.

CRITICAL RULES:
- Do NOT create a new harness
- Use ONLY the product reference image
- Keep exact colors, straps, shape and structure

PLACEMENT RULES:
- This is a NO-PULL HARNESS (not a neck collar)
- Position the front strap horizontally across the dog's CHEST
- The harness must form a "Y" shape on the chest
- The leash attachment point must be on the FRONT chest area
- Do NOT place it on the neck

REALISM:
- Follow the dog's body anatomy
- Adjust perspective to match the dog
- Apply natural lighting and shadows
- Keep the dog unchanged

Goal: realistic product try-on preview
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
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado" },
      { status: 500 }
    );
  }
}