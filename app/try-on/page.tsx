import { Suspense } from "react";
import TryOnClient from "./try-on-client";

function TryOnLoading() {
  return (
    <main className="min-h-screen bg-dogze-bg text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-dogze-orange">
            DOGZE Connect
          </p>
          <p className="mt-4 text-lg text-dogze-muted">
            Carregando provador virtual...
          </p>
        </div>
      </section>
    </main>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<TryOnLoading />}>
      <TryOnClient />
    </Suspense>
  );
}