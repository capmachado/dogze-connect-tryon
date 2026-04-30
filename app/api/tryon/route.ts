import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { image, productImage } = await req.json();

    if (!image || !productImage) {
      return NextResponse.json(
        { error: "Imagem do pet ou produto ausente" },
        { status: 400 }
      );
    }

    // 🔹 Converter base64 do pet
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const petBuffer = Buffer.from(base64Data, "base64");

    // 🔹 Baixar imagem do produto
    const productRes = await fetch(productImage);
    const productArrayBuffer = await productRes.arrayBuffer();
    const productBuffer = Buffer.from(productArrayBuffer);

    // 🔹 Ler dimensões do pet
    const petMeta = await sharp(petBuffer).metadata();

    if (!petMeta.width || !petMeta.height) {
      throw new Error("Não foi possível ler dimensões do pet");
    }

    const petWidth = petMeta.width;
    const petHeight = petMeta.height;

    // 🔥 POSICIONAMENTO INICIAL (ajustável)
    const harnessWidth = Math.round(petWidth * 0.35);

    const harness = await sharp(productBuffer)
      .resize({ width: harnessWidth })
      .png()
      .toBuffer();

    // 🔥 POSIÇÃO (centro do peito aproximado)
    const left = Math.round(petWidth * 0.45);
    const top = Math.round(petHeight * 0.45);

    // 🔥 COMPOSIÇÃO FINAL
    const finalImage = await sharp(petBuffer)
      .composite([
        {
          input: harness,
          top,
          left,
        },
      ])
      .png()
      .toBuffer();

    const base64 = finalImage.toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro ao gerar composição V2" },
      { status: 500 }
    );
  }
}