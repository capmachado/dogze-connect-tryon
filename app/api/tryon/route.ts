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
You must place the EXACT product from the reference image onto the dog.

STRICT RULES (DO NOT BREAK):
- Do NOT design or invent a new harness
- Do NOT change color, material, shape or structure
- Copy the harness EXACTLY as it appears in the reference image
- All straps, buckles and connectors must match the product image

PLACEMENT:
- This is a NO-PULL HARNESS
- Place the horizontal strap across the dog's CHEST (not neck)
- The harness must form a realistic Y-shape on the chest
- The front leash ring must be centered on the chest

REALISM:
- Keep the dog unchanged
- Match perspective and body curvature
- Apply natural shadows and lighting

IMPORTANT:
If the product cannot be applied correctly, DO NOT modify it.
It must remain identical to the reference image.

Goal: perfect product fidelity + realistic try-on
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