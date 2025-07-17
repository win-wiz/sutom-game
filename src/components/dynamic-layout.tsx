'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import Header from './header';
import { Footer } from './footer';
import ScrollToTop from './scroll-to-top';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export function DynamicLayout({ children }: DynamicLayoutProps) {
  const { gameMode } = useGame();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 服务端渲染时显示默认布局
  if (!isClient) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }
  
  // 客户端根据gameMode动态调整布局
  if (gameMode === 'playing') {
    return (
      <div className="relative h-screen overflow-hidden flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }
  
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}