import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacklabspotsshop.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Black Lab Spots — Good things for good dogs",
    template: "%s — Black Lab Spots",
  },
  description:
    "Black lab energy, printed on the good stuff. Tees, hoodies, home goods and one-of-one personalized pieces. Made to order, ships in 4–10 business days.",
  keywords: [
    "black lab",
    "black labrador gifts",
    "personalized dog gifts",
    "dog mom",
    "dog dad",
    "made to order",
    "black lab spots",
  ],
  authors: [{ name: "Black Lab Spots Shop LLC" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Black Lab Spots",
    title: "Black Lab Spots — Good things for good dogs",
    description:
      "Tees, hoodies, home goods and one-of-one personalized pieces for people obsessed with their black lab.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Black Lab Spots — Good things for good dogs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Lab Spots — Good things for good dogs",
    description:
      "Tees, hoodies, home goods and one-of-one personalized pieces for people obsessed with their black lab.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
