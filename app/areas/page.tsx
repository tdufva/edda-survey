import type { Metadata } from 'next';
import ResearchWorkspace from '../research-workspace';
export const metadata: Metadata = {
  title: 'AREAS landscape — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'AREAS landscape — EDDA Survey', images: [] },
  twitter: { title: 'AREAS landscape — EDDA Survey', images: [] },
};
export default function Page() {
  return <ResearchWorkspace view="areas" />;
}
