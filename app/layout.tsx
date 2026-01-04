import type { Metadata } from "next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ClientBody } from "./ClientBody";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recall | Your Organization's Knowledge, Instantly Accessible",
  description: "Stop searching. Start finding. Transform how your organization accesses knowledge with our RAG-powered AI assistant. Trusted by Law Firms, Healthcare Providers, and Enterprise Organizations.",
  keywords: "AI knowledge assistant, RAG technology, enterprise AI, document search, knowledge management, AI chatbot",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recall",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Recall | Your Organization's Knowledge, Instantly Accessible",
    description: "Stop searching. Start finding. Transform how your organization accesses knowledge with our RAG-powered AI assistant.",
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
  themeColor: '#0d1f2d',
  interactiveWidget: 'resizes-content' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Recall" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <ClientBody>
        <ServiceWorkerRegister />
        {children}
      </ClientBody>
    </html>
  );
}

