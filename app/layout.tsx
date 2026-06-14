import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, B612_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Joleen Hsu — Staff Product Designer",
  description:
    "Joleen Hsu is a Staff Product Designer building consumer products in health & wellness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${b612Mono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
