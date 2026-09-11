import type { Metadata } from 'next';
import SortingBoard from '../sorting/sorting-board';
export const metadata: Metadata = {
  title: 'AREAS sorting board — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'AREAS sorting board — EDDA Survey', images: [] },
  twitter: { title: 'AREAS sorting board — EDDA Survey', images: [] },
};
export default function Page() {
  return <SortingBoard framework="areas" key="areas" />;
}
