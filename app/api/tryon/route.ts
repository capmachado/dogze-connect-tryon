import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  if (!match) {
    throw new Error("A imagem do pet não está em formato base64 válido.");
  }

  return Buffer.from(match[1], "base64");
}

export async function POST(req: Request) {
  try {
    const { image, productImage } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem do pet ausente." },
        { status: 400 }
      );
    }

    if (!productImage) {
      return NextResponse.json(
        { error: "Imagem do produto ausente." },
        { status: 400 }
      );
    }

    const petBuffer = base64ToBuffer(image);

  const origin = new URL(req.url).origin;

const productImageUrl = productImage.startsWith("http")
  ? productImage
  : `${origin}${productImage}`;

const productRes = await fetch(productImageUrl, {
  headers: {
    "User-Agent": "DogzeConnectTryOn/1.0",
  },
});

    if (!productRes.ok) {
      return NextResponse.json(
        {
          error: `Não consegui baixar a imagem do produto. Status: ${productRes.status}`,
        },
        { status: 400 }
      );
    }

    const productBuffer = Buffer.from(await productRes.arrayBuffer());

    const petMeta = await sharp(petBuffer).metadata();

    if (!petMeta.width || !petMeta.height) {
      return NextResponse.json(
        { error: "Não consegui ler as dimensões da foto do pet." },
        { status: 400 }
      );
    }

    const petWidth = petMeta.width;
    const petHeight = petMeta.height;

    const harnessWidth = Math.round(petWidth * 0.32);

    const harness = await sharp(productBuffer)
      .resize({ width: harnessWidth })
      .png()
      .toBuffer();

    const harnessMeta = await sharp(harness).metadata();

    if (!harnessMeta.width || !harnessMeta.height) {
      return NextResponse.json(
        { error: "Não consegui preparar a imagem da coleira." },
        { status: 400 }
      );
    }

    const left = Math.round(petWidth * 0.48);
    const top = Math.round(petHeight * 0.38);

    const finalImage = await sharp(petBuffer)
      .rotate()
      .composite([
        {
          input: harness,
          left,
          top,
        },
      ])
      .png()
      .toBuffer();

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${finalImage.toString("base64")}`,
    });
  } catch (error) {
    console.error("ERRO TRYON V2:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar composição V2.",
      },
      { status: 500 }
    );
  }
}