import { DogzeLogo } from "@/components/DogzeLogo";

export function StepShell({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow?: string; title: string; description?: string; }) {
  return (
    <main className="min-h-screen bg-dogze-bg text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-5 safe-bottom">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <DogzeLogo />
          <span className="rounded-full border border-dogze-orange/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-dogze-orange">Totem</span>
        </header>
        <div className="pt-8">
          {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-dogze-orange">{eyebrow}</p>}
          <h1 className="dogze-title text-[42px] leading-[1.02] text-white">{title}</h1>
          {description && <p className="mt-5 text-lg leading-8 text-dogze-muted">{description}</p>}
        </div>
        <div className="flex flex-1 flex-col pt-8">{children}</div>
      </section>
    </main>
  );
}
