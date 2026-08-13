import '../styles/globals.css';
import type { Metadata } from 'next';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'RJ Focus',
  description: 'Search. Watch. Leave.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
