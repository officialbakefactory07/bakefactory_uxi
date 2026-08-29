"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar/Navbar';
import { Footer } from '@/components/Footer/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not show public Navbar and Footer on admin or pos billing pages
  const isSpecialAppPage = pathname.startsWith('/dmins') || pathname.startsWith('/pos');

  return (
    <>
      {!isSpecialAppPage && <Navbar />}
      {children}
      {!isSpecialAppPage && <Footer />}
    </>
  );
}
