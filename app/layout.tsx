import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CompanyProvider } from "@/contexts/company-context"

const inter = Inter({ subsets: ["latin"] })

const url = "https://devspi.com.br"

export const metadata: Metadata = {
  title: 'Devs PI - Plataforma de Networking para Desenvolvedores do Piauí',
  description: 'Conecte-se com desenvolvedores do Piauí. Descubra oportunidades, compartilhe projetos e fortaleça o ecossistema local de tecnologia.',
  keywords: [
    'Desenvolvedores Piauí',
    'Devs PI',
    'comunidade dev',
    'tecnologia Piauí',
    'networking tech',
    'ecossistema TI nordeste'
  ],
  authors: [{ name: 'Devs PI' }],
  robots: 'index, follow',
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
  metadataBase: new URL(url)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CompanyProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
