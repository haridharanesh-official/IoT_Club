import type { Metadata } from "next";
import "./globals.css";
import { IoTAppProvider } from "@/lib/store";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Internet of Things Club — Sri Shakthi Institute of Engineering and Technology",
  description:
    "A student-driven technical community focused on transforming ideas into intelligent, connected systems through IoT, Embedded Systems, Sensors, Microcontrollers, Wireless Communication, Robotics, Automation, Cloud Computing and Edge Computing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#f4f6f8] text-slate-800 flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900"
      >
        <IoTAppProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </IoTAppProvider>
      </body>
    </html>
  );
}
