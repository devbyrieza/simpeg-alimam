"use client";

import { usePathname } from "next/navigation";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatSystem from "@/components/ui/widgets/ChatSystem";
import TawkToScript from "@/components/ui/widgets/TawkToScript";
import ScrollToTop from "@/components/ui/widgets/ScrollToTop";
import PageTransition from "@/components/ui/PageTransition";
import UrgencyBar from "@/components/ui/UrgencyBar";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import LiveActivityToast from "@/components/ui/LiveActivityToast";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useScrollRestoration();

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
