import type { Metadata } from "next";
import {
  Instrument_Serif,
  Instrument_Sans,
  B612_Mono,
  Zalando_Sans_SemiExpanded,
} from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const b612Mono = B612_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Used only for the JOLEEN.DESIGN wordmark logo across every page.
// Zalando Sans SemiExpanded is a slightly wider variant of Zalando
// Sans — gives the wordmark a distinctive stretched-uppercase
// character that reads as a mark rather than as body text.
const zalandoSans = Zalando_Sans_SemiExpanded({
  variable: "--font-zalando",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Joleen Hsu — Staff Product Designer",
  description:
    "Joleen Hsu is a Staff Product Designer building consumer products in health & wellness.",
  // metadataBase is what Next.js uses to resolve relative URLs in the
  // openGraph + twitter blocks (so `/opengraph-image` becomes an
  // absolute https://joleen.design/opengraph-image when crawled).
  metadataBase: new URL("https://joleen.design"),
  openGraph: {
    title: "Joleen Hsu — Staff Product Designer",
    description:
      "Joleen Hsu is a Staff Product Designer building consumer products in health & wellness.",
    url: "https://joleen.design",
    siteName: "Joleen Hsu",
    type: "website",
    // The image URL itself is auto-injected by Next.js from
    // app/opengraph-image.tsx — no explicit `images` field needed here.
  },
  twitter: {
    // summary_large_image is the layout that renders the OG image as
    // the big preview card (not the small thumbnail).
    card: "summary_large_image",
    title: "Joleen Hsu — Staff Product Designer",
    description:
      "Joleen Hsu is a Staff Product Designer building consumer products in health & wellness.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${b612Mono.variable} ${zalandoSans.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
