import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) throw new Error("Imagem inválida");
  return Buffer.from(match[1], "base64");
}

export async function POST(req: Request) {
  try {
    const { image, productImage } = await req.json();

    const petBuffer = base64ToBuffer(image);

    const productRes = await fetch(productImage);
    const productBuffer = Buffer.from(await productRes.arrayBuffer());

    // 🔥 REMOVE FUNDO BRANCO
    const harness = await sharp(productBuffer)
      .removeAlpha() // garante canal
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toColourspace("rgb")
      .threshold(250) // tenta separar branco
      .negate()
      .png()
      .toBuffer();

    const petMeta = await sharp(petBuffer).metadata();

    if (!petMeta.width || !petMeta.height) {
      throw new Error("Erro dimensões");
    }

    const petWidth = petMeta.width;
    const petHeight = petMeta.height;

    // 🔥 ESCALA MELHOR
    const harnessWidth = Math.round(petWidth * 0.25);

    const resizedHarness = await sharp(productBuffer)
      .resize({ width: harnessWidth })
      .png()
      .toBuffer();

    // 🔥 POSIÇÃO PEITO
    const left = Math.round(petWidth * 0.55);
    const top = Math.round(petHeight * 0.55);

    const finalImage = await sharp(petBuffer)
      .composite([
        {
          input: resizedHarness,
          left,
          top,
        },
      ])
      .png()
      .toBuffer();

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${finalImage.toString("base64")}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro composição V2.1" },
      { status: 500 }
    );
  }
}