import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  if (!match) {
    throw new Error("Imagem do pet inválida.");
  }

  return Buffer.from(match[1], "base64");
}

async function loadImageFromUrl(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DogzeConnectTryOn/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Não consegui baixar a imagem do produto. Status: ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function removeWhiteBackground(buffer: Buffer) {
  return sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const pixels = Buffer.from(data);

      for (let i = 0; i < pixels.length; i += info.channels) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const isWhite = r > 238 && g > 238 && b > 238;

        if (isWhite) {
          pixels[i + 3] = 0;
        }
      }

      return sharp(pixels, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels,
        },
      })
        .png()
        .toBuffer();
    });
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
    const productBuffer = await loadImageFromUrl(productImage);

    const petMeta = await sharp(petBuffer).rotate().metadata();

    if (!petMeta.width || !petMeta.height) {
      return NextResponse.json(
        { error: "Não consegui ler a foto do pet." },
        { status: 400 }
      );
    }

    const petWidth = petMeta.width;
    const petHeight = petMeta.height;

    const productWithoutBg = await removeWhiteBackground(productBuffer);

    const harnessWidth = Math.round(petWidth * 0.22);

    const harness = await sharp(productWithoutBg)
      .resize({ width: harnessWidth })
      .png()
      .toBuffer();

    const harnessMeta = await sharp(harness).metadata();

    if (!harnessMeta.width || !harnessMeta.height) {
      return NextResponse.json(
        { error: "Não consegui preparar a imagem do produto." },
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
    console.error("ERRO TRYON V2.1:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro composição V2.1",
      },
      { status: 500 }
    );
  }
}