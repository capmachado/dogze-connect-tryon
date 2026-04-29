import { Camera, ShoppingBag, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StepShell } from "@/components/StepShell";

export default function HomePage() {
  return (
    <StepShell eyebrow="Provador Virtual" title="Veja no seu pet antes de comprar" description="Fluxo rápido para testar o DOGZE Connect no totem ou no celular.">
      <div className="mt-auto space-y-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-dogze-panel p-4 text-center"><Camera className="mx-auto text-dogze-orange" /><p className="mt-3 text-xs font-bold uppercase text-white">Foto</p></div>
          <div className="rounded-2xl border border-white/10 bg-dogze-panel p-4 text-center"><ShoppingBag className="mx-auto text-dogze-orange" /><p className="mt-3 text-xs font-bold uppercase text-white">Produto</p></div>
          <div className="rounded-2xl border border-white/10 bg-dogze-panel p-4 text-center"><Sparkles className="mx-auto text-dogze-orange" /><p className="mt-3 text-xs font-bold uppercase text-white">Prévia</p></div>
        </div>
        <PrimaryButton href="/try-on?handle=coleira-peitoral-anti-puxao-easy-walk-para-cao-cachorro-melancia">Começar demonstração</PrimaryButton>
        <p className="text-center text-xs leading-5 text-dogze-muted">Na versão final, esta tela será aberta pelo botão na página do produto.</p>
      </div>
    </StepShell>
  );
}
