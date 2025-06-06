import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Josefin_Sans } from "next/font/google";
import { Poppins } from "next/font/google"; // <-- added Poppins import
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import {Providers} from "./providers";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // pick weights you need
  variable: "--font-poppins",
});

const josefin_sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // pick weights you need
  variable: "--font-josefin-sans",
});

const bricolage_grotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // pick weights you need
  variable: "--font-bricolage_grotesque",
});

export const metadata: Metadata = {
  title: "AI Recruiter",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${josefin_sans.variable} ${bricolage_grotesque.variable}`}>
      <body>
      <Providers>
          <AuthProvider>
            <div className="flex min-h-screen h-screen flex-col">
              <Navbar/>
              {children}
            </div>
          </AuthProvider>
      </Providers>
      </body>
    </html>
  );
}