import Image from "next/image";
import { DogzeProduct } from "@/lib/products";

export function ProductSummary({ product }: { product: DogzeProduct }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-dogze-panel p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-dogze-orange">Produto selecionado</p>
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black/30">
          <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-6 text-white">{product.name}</h3>
          <p className="mt-2 text-sm leading-5 text-dogze-muted">{product.description}</p>
          <p className="mt-2 text-base font-bold text-white">{product.price}</p>
        </div>
      </div>
    </div>
  );
}
