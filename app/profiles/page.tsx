import type { Metadata } from 'next';
import ResearchWorkspace from '../research-workspace';
export const metadata: Metadata = {
  title: 'Interpretive Profiles — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'Interpretive Profiles — EDDA Survey', images: [] },
  twitter: { title: 'Interpretive Profiles — EDDA Survey', images: [] },
};
export default function Page() {
  return <ResearchWorkspace view="profiles" />;
}
