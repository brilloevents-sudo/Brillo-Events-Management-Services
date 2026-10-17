import type { Metadata } from "next";
import "./globals.css";
import { StaticApiFallback } from "@/components/static-api-fallback";

export const metadata: Metadata = {
  title: "Brillo Events Santa Operations Hub",
  description: "Premier real-beard Santa Claus booking funnel and master talent operations hub for shopping malls, hotels, and corporate holiday events.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-950 text-slate-100 antialiased min-h-screen">
        <StaticApiFallback />
        {children}
      </body>
    </html>
  );
}
