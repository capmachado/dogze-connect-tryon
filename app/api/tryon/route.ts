import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductType = "coleira" | "peitoral" | "guia" | "combo";

type TryOnTemplate = {
  widthRatio: number;
  leftRatio: number;
  topRatio: number;
  rotation: number;
  skewX: number;
};

const TYPE_TEMPLATES: Record<ProductType, TryOnTemplate> = {
  peitoral: {
    widthRatio: 0.30,
    leftRatio: 0.52,
    topRatio: 0.50,
    rotation: 18,     // 🔥 inclina mais
    skewX: 0.25,      // 🔥 simula corpo
  },
  coleira: {
    widthRatio: 0.18,
    leftRatio: 0.50,
    topRatio: 0.30,
    rotation: 0,
    skewX: 0,
  },
  guia: {
    widthRatio: 0.30,
    leftRatio: 0.40,
    topRatio: 0.50,
    rotation: -8,
    skewX: 0,
  },
  combo: {
    widthRatio: 0.25,
    leftRatio: 0.45,
    topRatio: 0.45,
    rotation: 10,
    skewX: 0.1,
  },
};

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) throw new Error("Imagem inválida");
  return Buffer.from(match[1], "base64");
}

function getTemplate(productType?: ProductType) {
  return TYPE_TEMPLATES[productType || "peitoral"];
}

async function loadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao baixar produto");
  return Buffer.from(await res.arrayBuffer());
}

async function removeBackground(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += info.channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const brightness = (r + g + b) / 3;

    if (brightness > 235) {
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
    .trim()
    .png()
    .toBuffer();
}

export async function POST(req: Request) {
  try {
    const { image, productImage, productType } = await req.json();

    const petBuffer = base64ToBuffer(image);
    const productBuffer = await loadImage(productImage);

    const petMeta = await sharp(petBuffer).metadata();
    if (!petMeta.width || !petMeta.height) {
      throw new Error("Erro dimensões pet");
    }

    const template = getTemplate(productType);

    const cleaned = await removeBackground(productBuffer);

    let harness = await sharp(cleaned)
      .resize({ width: Math.round(petMeta.width * template.widthRatio) })
      .rotate(template.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // 🔥 SIMULA CURVATURA (leve achatamento lateral)
    const meta = await sharp(harness).metadata();

    if (meta.width && meta.height) {
      harness = await sharp(harness)
        .resize({
          width: Math.round(meta.width * (1 - template.skewX)),
          height: meta.height,
        })
        .png()
        .toBuffer();
    }

    const left = Math.round(petMeta.width * template.leftRatio);
    const top = Math.round(petMeta.height * template.topRatio);

    const final = await sharp(petBuffer)
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
      imageUrl: `data:image/png;base64,${final.toString("base64")}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro composição V2.4" },
      { status: 500 }
    );
  }
}