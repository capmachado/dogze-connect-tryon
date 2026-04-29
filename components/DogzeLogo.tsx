import Image from "next/image";
export function DogzeLogo() {
  return (
    <Image
      src="/dogze-connect-logo.png"
      alt="DOGZE Connect"
      width={180}
      height={58}
      priority
      className="h-auto w-auto max-w-[180px]"
    />
  );
}
