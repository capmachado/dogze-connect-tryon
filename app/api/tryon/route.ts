import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  if (!match) {
    throw new Error("A imagem do pet não está em formato base64 válido.");
  }

  return Buffer.from(match[1], "base64");
}

async function loadProductImage(productImage: string) {
  if (productImage.startsWith("/")) {
    const cleanPath = productImage.replace(/^\/+/, "");
    const filePath = path.join(process.cwd(), "public", cleanPath);
    return await fs.readFile(filePath);
  }

  const productRes = await fetch(productImage, {
    headers: {
      "User-Agent": "DogzeConnectTryOn/1.0",
    },
  });

  if (!productRes.ok) {
    throw new Error(
      `Não consegui baixar a imagem do produto. Status: ${productRes.status}`
    );
  }

  return Buffer.from(await productRes.arrayBuffer());
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
    const productBuffer = await loadProductImage(productImage);

    const petMeta = await sharp(petBuffer).rotate().metadata();

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