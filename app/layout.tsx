import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "DOGZE Connect | Provador Virtual", description: "Provador virtual DOGZE Connect para totem em pet shop." };
export const viewport: Viewport = { themeColor: "#1a1a1a", width: "device-width", initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
