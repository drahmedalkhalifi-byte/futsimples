import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://futsimples.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FutSimples | Sistema de Gestão para Escolinhas de Futebol",
    template: "%s | FutSimples",
  },
  description:
    "Sistema completo para gestão de escolinhas de futebol. Controle alunos, mensalidades, inadimplência, presença e financeiro. 14 dias grátis, depois R$59,90/mês. Sem planilha, sem papel, 100% pelo celular.",
  keywords: [
    "sistema para escolinha de futebol",
    "gestão escolinha de futebol",
    "software escolinha futebol",
    "sistema gestão escola futebol",
    "controle de alunos escolinha de futebol",
    "sistema pagamentos escolinha futebol",
    "app escola de futebol",
    "controle mensalidade escolinha futebol",
    "sistema presença escolinha futebol",
    "gestão financeira escolinha futebol",
    "como organizar escolinha de futebol",
    "inadimplência escolinha futebol",
    "controle financeiro escolinha",
    "sistema cobranças escolinha",
    "agenda treinos escolinha futebol",
    "relatório financeiro escolinha",
    "portal responsável escolinha",
    "ficha médica aluno escolinha",
    "cobrança whatsapp escolinha futebol",
    "pix escolinha futebol",
    "futsimples",
    "sistema escolinha futebol brasil",
    "gestão esporte futebol infantil",
    "escolinha futebol controle alunos",
    "aplicativo escolinha de futebol",
  ],
  authors: [{ name: "FutSimples" }],
  creator: "FutSimples",
  publisher: "FutSimples",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "FutSimples",
    title: "FutSimples | Sistema de Gestão para Escolinhas de Futebol",
    description:
      "Chega de planilha e papel. Controle alunos, mensalidades, presença e inadimplência da sua escolinha de futebol. 14 dias grátis, depois R$59,90/mês.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FutSimples - Sistema de Gestão para Escolinhas de Futebol" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutSimples | Sistema de Gestão para Escolinhas de Futebol",
    description: "Controle alunos, mensalidades e presença da sua escolinha. 14 dias grátis, depois R$59,90/mês.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
