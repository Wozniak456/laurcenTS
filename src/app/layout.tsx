import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Providers from "@/app/providers";
import { Toaster } from "sonner";
// import { GlobalContextProvider } from "@/app/context/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fish farm v.0.95",
  description: "Laursen Aquaculture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container mx-auto px-4 max-w-7xl">
          <Providers>
            <Header />
            {children}
            <Toaster richColors position="top-center" />
          </Providers>
        </div>
      </body>
    </html>
  );
}
