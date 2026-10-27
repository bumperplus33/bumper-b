import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import localFont from "next/font/local";

import Preloader from "@/components/ui/Preloader";
import NavBar from "@/components/ui/NavBar";
import FilmGrain from "@/components/ui/FilmGrain";
import PageTransitionProvider from "@/providers/PageTransitionProvider";
import GlobalCanvas from "@/components/webgl/GlobalCanvas";

// The only place fonts are loaded. globals.css maps these variables to the
// font-neue and font-sans utilities.
const neueMontreal = localFont({
  src: "../../public/fonts/PPNeueMontreal-Bold.otf",
  weight: "700",
  variable: "--font-neue-montreal",
  display: "swap",
});

const nbInternational = localFont({
  src: "../../public/fonts/NBInternational-Regular.woff2",
  weight: "400",
  variable: "--font-nb",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SOJU Studio",
  description:
    "Digital creative studio blurring the line between technology and art.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The font variables go on <html> because the theme reads them at :root
    <html
      lang="en"
      className={`dark ${neueMontreal.variable} ${nbInternational.variable}`}
    >
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-accent selection:text-zinc-950">
        <Preloader />

        {/* The singleton canvas: page scenes teleport into it through tunnel.In */}
        <GlobalCanvas />

        {/* Shared chrome lives here so it survives route changes. Page
              transitions wrap it all, so every link can use them. */}
        <PageTransitionProvider>
          <NavBar />
          <FilmGrain />

          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
