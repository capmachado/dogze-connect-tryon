"use client";
import { Camera, Upload } from "lucide-react";
import { useRef } from "react";

export function CameraUpload({ photo, onPhoto }: { photo: string | null; onPhoto: (photo: string) => void; }) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onPhoto(reader.result); };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-dogze-panel">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Foto do pet" className="h-[360px] w-full object-cover" />
        ) : (
          <div className="grid h-[360px] place-items-center px-6 text-center">
            <div>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dogze-orange/50 bg-dogze-orange/10 text-dogze-orange"><Camera size={34} /></div>
              <p className="mt-5 text-lg font-bold">Foto do pet</p>
              <p className="mt-2 text-sm leading-6 text-dogze-muted">Tire uma foto frontal ou envie uma imagem da galeria.</p>
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} accept="image/*" capture="environment" className="hidden" type="file" onChange={(event) => handleFile(event.target.files?.[0])} />
      <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-dogze-orange px-5 py-4 text-base font-bold text-white shadow-glow active:scale-[0.99]">
        {photo ? <Upload size={20} /> : <Camera size={20} />}
        {photo ? "Trocar foto" : "Fotografar ou enviar foto"}
      </button>
    </div>
  );
}
