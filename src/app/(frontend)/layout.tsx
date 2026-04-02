import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel";
import "../globals.scss";
import elan from "../../../elan.json";

export const metadata: Metadata = {
  title: "Yilan Gao — UX Designer",
  description: "Portfolio of Yilan Gao, UX Designer crafting thoughtful digital experiences.",
  generator: `${elan.name} ${elan.release.version}`,
};

const fontVariables = [
  GeistSans.variable,
  GeistMono.variable,
  GeistPixelSquare.variable,
  GeistPixelGrid.variable,
  GeistPixelCircle.variable,
  GeistPixelTriangle.variable,
  GeistPixelLine.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
