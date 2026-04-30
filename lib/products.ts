export type DogzeProduct = {
  id: string;
  name: string;
  type: "coleira" | "peitoral" | "guia" | "combo";
  handle: string;
  price: string;
  image: string;
  description: string;
  sizes: string[];
};

export const SHOPIFY_DOMAIN = "https://dogze-pet.myshopify.com";

export const dogzeProducts: DogzeProduct[] = [
  {
    id: "easy-walk-melancia",
    name: "Coleira Peitoral Anti-Puxão Easy Walk - Melancia",
    type: "peitoral",
    handle: "coleira-peitoral-anti-puxao-easy-walk-para-cao-cachorro-melancia",
    price: "R$ 89,90",
    image:
      "https://dogze-pet.myshopify.com/cdn/shop/files/zeedog_antipuxao.png.png?v=1776364347",
    description: "Mais controle, conforto e segurança para o passeio.",
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: "guia-premium-melancia",
    name: "Guia Premium Dogze - Melancia",
    type: "guia",
    handle: "guia-premium-dogze-para-cao-cachorro-melancia",
    price: "R$ 59,90",
    image:
      "https://dogze-pet.myshopify.com/cdn/shop/files/zeedog_antipuxao.png?v=1776364347",
    description: "Guia premium para combinar com o visual do pet.",
    sizes: ["Único"],
  },
];

export function getShopifyProductUrl(handle: string) {
  return `${SHOPIFY_DOMAIN}/products/${handle}`;
}

export function getProductByHandle(handle?: string | null) {
  if (!handle) return dogzeProducts[0];
  return (
    dogzeProducts.find((product) => product.handle === handle) ??
    dogzeProducts[0]
  );
}

export function createProductFromSearchParams(
  params: URLSearchParams
): DogzeProduct {
  const handle = params.get("handle");
  const base = getProductByHandle(handle);

  return {
    ...base,
    name: params.get("name") || base.name,
    handle: handle || base.handle,
    price: params.get("price") || base.price,
    image: params.get("image") || base.image,
    description: params.get("description") || base.description,
  };
}