import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Semantic Search Engine',
  description: 'AI Research Assistant - University Project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-neutral-50">
          <Sidebar />
          <main className="flex-1 px-8 py-10 lg:px-12 lg:py-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
