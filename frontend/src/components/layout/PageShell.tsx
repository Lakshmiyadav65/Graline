"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CustomerNavbar } from "../navigation/CustomerNavbar";
import { FarmerNavbar } from "../navigation/FarmerNavbar";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { LanguageModal } from "./LanguageModal";

interface PageShellProps {
  children: ReactNode;
  /** Hide the footer (useful on dashboards / enroll). */
  noFooter?: boolean;
  /** Hide the topbar + announcement bar (useful on full-bleed enroll-style pages). */
  noTopBar?: boolean;
}

export function PageShell({ children, noFooter, noTopBar }: PageShellProps) {
  const pathname = usePathname() ?? "/";
  const isFarmerRoute = pathname.startsWith("/farmer-app") || pathname.startsWith("/sell");

  return (
    <>
      <LanguageModal />
      {!noTopBar && !isFarmerRoute && <AnnouncementBar />}
      <div className="max-w-app mx-auto px-7">
        {!noTopBar && (
          isFarmerRoute ? <FarmerNavbar /> : <CustomerNavbar />
        )}
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        {!noFooter && <Footer />}
      </div>
    </>
  );
}
