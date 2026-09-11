import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import ResearchProvider from "./research-provider";
import SortingProvider from "./sorting-provider";

const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tdufva.github.io/edda-survey/"),
  title: "EDDA Survey — Internationalisation, seen from within",
  description: "A Data Feminism-informed thematic analysis of the EDDA internationalisation survey.",
  openGraph: {
    title: "EDDA Survey",
    description: "Internationalisation needs infrastructure, not only enthusiasm.",
    type: "website",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "EDDA Survey — Internationalisation, seen from within" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EDDA Survey",
    description: "Internationalisation needs infrastructure, not only enthusiasm.",
    images: ["og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${instrument.variable} ${newsreader.variable}`}><ResearchProvider><SortingProvider>{children}</SortingProvider></ResearchProvider></body></html>;
}
