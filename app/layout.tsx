import type { Metadata } from "next";
import "./globals.css";
import { IoTAppProvider } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const siteUrl = "https://iotclub.dpdns.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Internet of Things Club",
  title: {
    default: "Internet of Things Club | Sri Shakthi Institute of Engineering and Technology",
    template: "%s | IoT Club SIET",
  },
  description:
    "The Internet of Things Club at Sri Shakthi Institute of Engineering and Technology is a student technical community for IoT, embedded systems, robotics, automation, wireless communication, cloud and edge computing.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Internet of Things Club — SIET",
    title: "Internet of Things Club | Sri Shakthi Institute of Engineering and Technology",
    description:
      "Learn, build and collaborate on IoT, embedded systems, robotics, automation and connected systems at Sri Shakthi Institute of Engineering and Technology.",
  },
  twitter: {
    card: "summary",
    title: "Internet of Things Club | SIET",
    description:
      "Student IoT, embedded systems, robotics and automation community at Sri Shakthi Institute of Engineering and Technology.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </IoTAppProvider>
      </body>
    </html>
  );
}
