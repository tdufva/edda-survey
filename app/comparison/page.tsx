import type { Metadata } from 'next';
import ResearchWorkspace from '../research-workspace';
export const metadata: Metadata = {
  title: 'Dator × AREAS Matrix — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'Dator × AREAS Matrix — EDDA Survey', images: [] },
  twitter: { title: 'Dator × AREAS Matrix — EDDA Survey', images: [] },
};
export default function Page() {
  return <ResearchWorkspace view="comparison" />;
}
