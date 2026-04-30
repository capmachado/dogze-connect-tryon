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
  whiteThreshold: number;
  shadow: boolean;
};

const PRODUCT_TEMPLATES: Record<string, TryOnTemplate> = {
  "easy-walk-melancia": {
    widthRatio: 0.18,
    leftRatio: 0.44,
    topRatio: 0.43,
    rotation: 4,
    whiteThreshold: 238,
    shadow: true,
  },
};

const TYPE_TEMPLATES: Record<ProductType, TryOnTemplate> = {
  peitoral: {
    widthRatio: 0.18,
    leftRatio: 0.44,
    topRatio: 0.43,
    rotation: 4,
    whiteThreshold: 238,
    shadow: true,
  },
  coleira: {
    widthRatio: 0.16,
    leftRatio: 0.48,
    topRatio: 0.34,
    rotation: 0,
    whiteThreshold: 238,
    shadow: true,
  },
  guia: {
    widthRatio: 0.26,
    leftRatio: 0.34,
    topRatio: 0.42,
    rotation: -8,
    whiteThreshold: 238,
    shadow: true,
  },
  combo: {
    widthRatio: 0.2,
    leftRatio: 0.42,
    topRatio: 0.42,
    rotation: 2,
    whiteThreshold: 238,
    shadow: true,
  },
};

function base64ToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  if (!match) {
    throw new Error("Imagem do pet inválida.");
  }

  return Buffer.from(match[1], "base64");
}

function getTemplate(productId?: string, productType?: ProductType) {
  if (productId && PRODUCT_TEMPLATES[productId]) {
    return PRODUCT_TEMPLATES[productId];
  }

  if (productType && TYPE_TEMPLATES[productType]) {
    return TYPE_TEMPLATES[productType];
  }

  return TYPE_TEMPLATES.peitoral;
}

async function loadImageFromUrl(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DogzeConnectTryOn/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Não consegui baixar a imagem do produto. Status: ${res.status}`
    );
  }

  return Buffer.from(await res.arrayBuffer());
}

async function removeWhiteBackground(buffer: Buffer, threshold: number) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += info.channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const isNearWhite = r >= threshold && g >= threshold && b >= threshold;

    if (isNearWhite) {
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

async function addSoftShadow(buffer: Buffer) {
  const meta = await sharp(buffer).metadata();

  if (!meta.width || !meta.height) {
    return buffer;
  }

  const shadow = await sharp(buffer)
    .extractChannel("alpha")
    .blur(8)
    .linear(0.35)
    .toColourspace("b-w")
    .joinChannel(
      Buffer.alloc(meta.width * meta.height * 3, 0),
      {
        raw: {
          width: meta.width,
          height: meta.height,
          channels: 3,
        },
      }
    )
    .png()
    .toBuffer()
    .catch(() => null);

  if (!shadow) return buffer;

  const canvasWidth = meta.width + 24;
  const canvasHeight = meta.height + 24;

  return sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: shadow,
        left: 14,
        top: 14,
      },
      {
        input: buffer,
        left: 8,
        top: 8,
      },
    ])
    .png()
    .toBuffer();
}

export async function POST(req: Request) {
  try {
    const { image, productImage, productId, productType } = await req.json();

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

    const template = getTemplate(productId, productType);

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

    const productTransparent = await removeWhiteBackground(
      productBuffer,
      template.whiteThreshold
    );

    const targetWidth = Math.round(petWidth * template.widthRatio);

    let harness = await sharp(productTransparent)
      .resize({ width: targetWidth })
      .rotate(template.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    if (template.shadow) {
      harness = await addSoftShadow(harness);
    }

    const left = Math.round(petWidth * template.leftRatio);
    const top = Math.round(petHeight * template.topRatio);

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
    console.error("ERRO TRYON V2.3:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro composição V2.3",
      },
      { status: 500 }
    );
  }
}