import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/layout/top-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Motifgrow",
  description: "A life scheduler that never lets you fail",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f5f5f7]">
        <TooltipProvider>
          <TopNav />
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
