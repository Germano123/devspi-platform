import "./globals.css";
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CompanyProvider } from "@/contexts/company-context";
import { ProfileProvider } from "@/contexts/profile.context";

const inter = Inter({ subsets: ["latin"] });

const url = "https://devspi.com.br";

export const metadata: Metadata = {
  title: "Devs PI - Plataforma de Networking para Desenvolvedores do Piauí",
  description:
    "Conecte-se com desenvolvedores do Piauí. Descubra oportunidades, compartilhe projetos e fortaleça o ecossistema local de tecnologia.",
  keywords: [
    "Desenvolvedores Piauí",
    "Devs PI",
    "comunidade dev",
    "tecnologia Piauí",
    "networking tech",
    "ecossistema TI nordeste",
  ],
  authors: [{ name: "Devs PI" }],
  robots: "index, follow",
  // openGraph: {
  //   title: 'Devs PI - Conectando Desenvolvedores do Piauí',
  //   description: 'A comunidade que impulsiona o networking e oportunidades entre devs piauienses.',
  //   url,
  //   siteName: 'Devs PI',
  //   images: [
  //     {
  //       url: `${url}/imagem-compartilhamento.png`,
  //       width: 1200,
  //       height: 630,
  //       alt: 'Banner Devs PI'
  //     }
  //   ],
  //   locale: 'pt_BR',
  //   type: 'website'
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Devs PI - Plataforma de Networking para Desenvolvedores do Piauí',
  //   description: 'Conecte-se com devs do Piauí e fortaleça sua rede.',
  //   images: [`${url}/imagem-compartilhamento.png`]
  // },
  metadataBase: new URL(url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="favicon_io/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="favicon_io/favicon-32x32.png" sizes="32x32" />

        <link rel="apple-touch-icon" href="favicon_io/apple-touch-icon.png" />

        <link rel="manifest" href="favicon_io/site.webmanifest"></link>
      </head>

      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ProfileProvider>
              <CompanyProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </CompanyProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
