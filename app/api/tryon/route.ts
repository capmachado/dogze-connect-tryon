import { NextResponse } from "next/server";

type ReplicatePrediction = {
  id?: string;
  status?: string;
  output?: string | string[] | null;
  error?: string | null;
  urls?: {
    get?: string;
  };
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
        { error: "REPLICATE_API_TOKEN não configurado na Vercel." },
        { status: 500 }
      );
    }

    const { image, productName } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem do pet não recebida." },
        { status: 400 }
      );
    }

    const prompt = `
      Edit this pet photo naturally.
      Keep the same dog, same pose, same background and same lighting.
      Add a premium DOGZE pet accessory to the dog.
      Product: ${productName || "dog collar or harness"}.
      The accessory must look realistic, correctly positioned on the dog's neck or chest.
      Do not change the dog's face. Do not add text. Do not add extra animals.
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
            aspect_ratio: "match_input_image",
            output_format: "png",
            safety_tolerance: 2,
          },
        }),
      }
    );

    const prediction = (await response.json()) as ReplicatePrediction;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            prediction?.error ||
            "Erro ao chamar a Replicate. Verifique token, crédito e modelo.",
          raw: prediction,
        },
        { status: response.status }
      );
    }

    if (prediction.error) {
      return NextResponse.json(
        { error: prediction.error, raw: prediction },
        { status: 500 }
      );
    }

    const outputUrl = getOutputUrl(prediction.output);

    if (!outputUrl) {
      return NextResponse.json(
        {
          error:
            "A IA ainda não terminou a imagem. Tente novamente em alguns segundos.",
          status: prediction.status,
          predictionId: prediction.id,
          raw: prediction,
        },
        { status: 202 }
      );
    }

    return NextResponse.json({
      imageUrl: outputUrl,
      status: prediction.status,
      predictionId: prediction.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao gerar imagem.",
      },
      { status: 500 }
    );
  }
}