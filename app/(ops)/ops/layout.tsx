import type { Metadata } from 'next';

export default function OpsSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
