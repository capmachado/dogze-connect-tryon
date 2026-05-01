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
  // 🟢 COSTAS (primeiro - fundo)
  {
    file: "back-top.png",
    widthRatio: 0.14,
    leftRatio: 0.60,
    topRatio: 0.32,
    rotation: 25,
  },

  // 🔵 LATERAL
  {
    file: "side-left.png",
    widthRatio: 0.18,
    leftRatio: 0.52,
    topRatio: 0.48,
    rotation: -10,
  },

  // 🔴 PEITO
  {
    file: "front-chest.png",
    widthRatio: 0.20,
    leftRatio: 0.42,
    topRatio: 0.50,
    rotation: 5,
  },

  // ⚫ ARGOLA
  {
    file: "front-ring.png",
    widthRatio: 0.05,
    leftRatio: 0.45,
    topRatio: 0.58,
    rotation: 0,
  },
];

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) throw new Error("Imagem inválida");
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

    const petBuffer = base64ToBuffer(image);

    const petMeta = await sharp(petBuffer).rotate().metadata();

    if (!petMeta.width || !petMeta.height) {
      throw new Error("Erro dimensões pet");
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
    console.error("ERRO TRYON V3.1:", error);

    return NextResponse.json(
      { error: "Erro composição V3.1" },
      { status: 500 }
    );
  }
}