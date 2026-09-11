import type { Metadata } from 'next';
import SortingBoard from './sorting-board';
export const metadata: Metadata = {
  title: 'Dator sorting board — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'Dator sorting board — EDDA Survey', images: [] },
  twitter: { title: 'Dator sorting board — EDDA Survey', images: [] },
};
export default function Page() {
  return <SortingBoard />;
}
