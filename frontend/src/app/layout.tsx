import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloClientProvider } from "@/lib/apollo-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedCare Web - Plateforme de Téléconsultation",
  description: "Interface web pour médecins et administrateurs MedCare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ApolloClientProvider>{children}</ApolloClientProvider>
      </body>
    </html>
  );
}

