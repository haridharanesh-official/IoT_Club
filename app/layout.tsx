import type { Metadata } from "next";
import "./globals.css";
import { IoTAppProvider } from "@/lib/store";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "IoT Club — Learning, Innovation & Lab Management Platform",
  description: "A digital operating system for the IoT Club: Discover, Learn, Build Projects, Use Lab Hardware, Compete in Hackathons, and Become a Mentor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg text-slate-100 flex flex-col antialiased selection:bg-iot-emerald selection:text-slate-950">
        <IoTAppProvider>
          <RoleSwitcher />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </IoTAppProvider>
      </body>
    </html>
  );
}
