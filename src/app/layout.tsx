import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | Texas Fine Arts TExES Exam Prep`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_TAGLINE} Diagnostic testing and personalized study plans for TExES Art, Music, Theatre, and Dance certification.`,
  keywords: [
    'TX Arts Pathway',
    'Texas TExES Fine Arts',
    'TExES Theatre',
    'TExES Art',
    'TExES Music',
    'TExES Dance',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-navy-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
