import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sheriff Security Company Pvt. Ltd | The Name of Conservation",
  description:
    "Professional security services across Pakistan. Body Guards, Security Systems, Walk Through Gates, Metal Detectors, and more. Trusted by leading brands since 2004.",
  keywords: [
    "security company",
    "sheriff security",
    "guards",
    "pakistan security",
    "body guards",
    "security services",
  ],
  authors: [{ name: "Sheriff Security Company Pvt. Ltd" }],
  openGraph: {
    title: "Sheriff Security Company Pvt. Ltd",
    description: "The Name of Conservation - Professional Security Services",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
