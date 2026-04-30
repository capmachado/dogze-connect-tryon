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
};

const TYPE_TEMPLATES: Record<ProductType, TryOnTemplate> = {
  peitoral: {
    widthRatio: 0.18,
    leftRatio: 0.44,
    topRatio: 0.43,
    rotation: 4,
  },
  coleira: {
    widthRatio: 0.16,
    leftRatio: 0.48,
    topRatio: 0.34,
    rotation: 0,
  },
  guia: {
    widthRatio: 0.26,
    leftRatio: 0.34,
    topRatio: 0.42,
    rotation: -8,
  },
  combo: {
    widthRatio: 0.2,
    leftRatio: 0.42,
    topRatio: 0.42,
    rotation: 2,
  },
};

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) throw new Error("Imagem inválida");
  return Buffer.from(match[1], "base64");
}

function getTemplate(productType?: ProductType) {
  if (productType && TYPE_TEMPLATES[productType]) {
    return TYPE_TEMPLATES[productType];
  }
  return TYPE_TEMPLATES.peitoral;
}

async function loadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao baixar produto: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// 🔥 REMOVE FUNDO SEM CRIAR PRETO
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
      pixels[i + 3] = 0; // transparente
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

    const cleanedProduct = await removeBackground(productBuffer);

    const resized = await sharp(cleanedProduct)
      .resize({ width: Math.round(petMeta.width * template.widthRatio) })
      .rotate(template.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const left = Math.round(petMeta.width * template.leftRatio);
    const top = Math.round(petMeta.height * template.topRatio);

    const final = await sharp(petBuffer)
      .composite([
        {
          input: resized,
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
      { error: "Erro composição V2.3.2" },
      { status: 500 }
    );
  }
}