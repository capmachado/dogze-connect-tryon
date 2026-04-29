
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "a9758cbf0a9d0e63c0a1c9b7c7e3d0b3f6d3e2c4c5e6f7g8",
        input: {
          image: image,
          prompt: prompt
        }
      })
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar imagem" }, { status: 500 });
  }
}
