import type { Metadata, Viewport } from "next";
import { Heebo, Frank_Ruhl_Libre, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import TopProgressBar from "@/components/TopProgressBar";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500"],
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank",
  weight: ["400", "500", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shey · מעקב ייצור תכשיטים",
  description: "מעקב אחר תהליך ייצור התכשיט שלך",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frank.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-ivory font-sans font-light text-ink antialiased">
        <Script id="no-zoom" strategy="beforeInteractive">{`
          document.addEventListener('gesturestart',function(e){e.preventDefault();},{passive:false});
          document.addEventListener('gesturechange',function(e){e.preventDefault();},{passive:false});
          document.addEventListener('touchmove',function(e){if(e.touches.length>1)e.preventDefault();},{passive:false});
        `}</Script>
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
