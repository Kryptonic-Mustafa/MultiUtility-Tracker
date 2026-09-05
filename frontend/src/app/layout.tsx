import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "MultiUtility Tracker | Enterprise School Management System",
  description: "Real-time Biometric Face Recognition Attendance & Multi-Module Institutional Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-[98%] xl:max-w-[1800px] mx-auto px-4 lg:px-8 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
