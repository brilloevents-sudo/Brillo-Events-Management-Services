import type { Metadata } from "next";
import "./globals.css";
import { StaticApiFallback } from "@/components/static-api-fallback";
import { AuthProvider } from "@/components/auth-context";

export const metadata: Metadata = {
  title: "Real Beard Santa for Hire Philippines | Brillo Events",
  description:
    "Book authentic real-beard Santa Claus performers for mall Christmas launches, hotels, corporate events, private parties, and holiday activations. Brillo Events delivers memorable Christmas experiences across the Philippines.",
  keywords: [
    "Real beard Santa for hire Philippines",
    "Santa Claus for hire Manila",
    "Santa Claus for mall events",
    "Real Santa for Christmas event",
    "Santa performer Philippines",
    "Santa Claus for corporate events",
    "Santa and elves for hire",
    "Christmas mall activation Philippines",
    "Santa Claus for hotel events",
    "Christmas entertainment agency Philippines",
  ],
  openGraph: {
    title: "Real Beard Santa for Hire Philippines | Brillo Events",
    description:
      "More than Santa. We create the moments that make Christmas unforgettable. Authentic Santa experiences for malls, hotels, corporate events & private celebrations.",
    url: "https://brilloevent.com",
    siteName: "Brillo Events",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <StaticApiFallback />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
