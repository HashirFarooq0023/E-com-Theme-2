import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { SettingsProvider } from "@/providers/SettingsProvider";

// 1. Luxury Serif Font
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// 2. Clean Sans Font
const inter = Inter({
  variable: "--font",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {


    title: settings.brand_name || "THE LUXURY",
    description: settings.brand_description || "Exclusive Limited Edition Timepieces and Accessories.",
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        style={{ backgroundColor: "#0e0e0e", color: "#e2e8f0" }}
      >
        <SettingsProvider settings={settings}>
          {children}
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}