import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataProvider } from "@/context/DataContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "DDPMS | Plantation Monitoring System | Dantewada District",
  description: "Dantewada District Plantation Monitoring System (DDPMS) - Official tracking portal of the Forest Department, Chhattisgarh. Monitor nurseries, inventory, and plant distributions in real-time.",
  keywords: "Plantation Monitoring, Dantewada, Forest Department, Chhattisgarh, Nursery Stock Management, DDPMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full bg-background flex flex-col antialiased">
        <LanguageProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
