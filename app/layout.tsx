import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Capsul Studio",
  description: "Outil interne d'analyse d'investissement locatif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-capsul-ivory">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
