import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HarnessPart = {
  file: string;
  widthRatio: number;
  leftRatio: number;
  topRatio: number;
  rotation: number;
  opacity?: number;
};

const EASY_WALK_PARTS: HarnessPart[] = [
  {
    file: "back-top.png",
    widthRatio: 0.13,
    leftRatio: 0.57,
    topRatio: 0.35,
    rotation: 22,
    opacity: 0.96,
  },
  {
    file: "side-left.png",
    widthRatio: 0.16,
    leftRatio: 0.52,
    topRatio: 0.47,
    rotation: -6,
    opacity: 0.98,
  },
  {
    file: "front-chest.png",
    widthRatio: 0.18,
    leftRatio: 0.45,
    topRatio: 0.45,
    rotation: 4,
    opacity: 1,
  },
  {
    file: "front-ring.png",
    widthRatio: 0.045,
    leftRatio: 0.47,
    topRatio: 0.52,
    rotation: 0,
    opacity: 1,
  },
];

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  if (!match) {
    throw new Error("Imagem do pet inválida.");
  }

  return Buffer.from(match[1], "base64");
}

async function loadPart(fileName: string) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "products",
    "easy-walk-melancia",
    "parts",
    fileName
  );

  return fs.readFile(filePath);
}

async function preparePart(
  buffer: Buffer,
  targetWidth: number,
  rotation: number,
  opacity = 1
) {
  let img = sharp(buffer)
    .resize({ width: targetWidth })
    .rotate(rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png();

  if (opacity < 1) {
    const prepared = await img.toBuffer();
    const { data, info } = await sharp(prepared)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = Buffer.from(data);

    for (let i = 0; i < pixels.length; i += info.channels) {
      pixels[i + 3] = Math.round(pixels[i + 3] * opacity);
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
  }

  return img.toBuffer();
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem do pet ausente." },
        { status: 400 }
      );
    }

    const petBuffer = base64ToBuffer(image);

    const petMeta = await sharp(petBuffer).rotate().metadata();

    if (!petMeta.width || !petMeta.height) {
      return NextResponse.json(
        { error: "Não consegui ler a foto do pet." },
        { status: 400 }
      );
    }

    const petWidth = petMeta.width;
    const petHeight = petMeta.height;

    const composites = [];

    for (const part of EASY_WALK_PARTS) {
      const partBuffer = await loadPart(part.file);

      const prepared = await preparePart(
        partBuffer,
        Math.round(petWidth * part.widthRatio),
        part.rotation,
        part.opacity ?? 1
      );

      composites.push({
        input: prepared,
        left: Math.round(petWidth * part.leftRatio),
        top: Math.round(petHeight * part.topRatio),
      });
    }

    const finalImage = await sharp(petBuffer)
      .rotate()
      .composite(composites)
      .png()
      .toBuffer();

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${finalImage.toString("base64")}`,
    });
  } catch (error) {
    console.error("ERRO TRYON V3 PARTS:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar provador V3 por partes.",
      },
      { status: 500 }
    );
  }
}