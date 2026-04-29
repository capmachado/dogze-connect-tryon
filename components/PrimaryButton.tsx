import Link from "next/link";
import type { ReactNode } from "react";

type Props = { children: ReactNode; href?: string; onClick?: () => void; variant?: "solid" | "outline" | "ghost"; disabled?: boolean; type?: "button" | "submit"; className?: string; };
const variants = {
  solid: "bg-dogze-orange text-white shadow-glow active:scale-[0.99]",
  outline: "border border-dogze-orange bg-transparent text-dogze-orange active:scale-[0.99]",
  ghost: "bg-dogze-soft text-white active:scale-[0.99]"
};

export function PrimaryButton({ children, href, onClick, variant = "solid", disabled, type = "button", className = "" }: Props) {
  const classes = `flex min-h-[56px] w-full items-center justify-center rounded-xl px-5 py-4 text-center text-base font-bold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`;
  if (href) return <Link className={classes} href={href}>{children}</Link>;
  return <button className={classes} onClick={onClick} disabled={disabled} type={type}>{children}</button>;
}
