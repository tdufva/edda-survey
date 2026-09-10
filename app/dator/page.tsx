import type { Metadata } from 'next';
import ResearchWorkspace from '../research-workspace';
export const metadata: Metadata = {
  title: 'Dator Analysis — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'Dator Analysis — EDDA Survey', images: [] },
  twitter: { title: 'Dator Analysis — EDDA Survey', images: [] },
};
export default function Page() {
  return <ResearchWorkspace view="dator" />;
}
