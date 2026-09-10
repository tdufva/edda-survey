import type { Metadata } from 'next';
import ResearchWorkspace from '../research-workspace';
export const metadata: Metadata = {
  title: 'Researcher Validation — EDDA Survey',
  robots: { index: false, follow: false },
  openGraph: { title: 'Researcher Validation — EDDA Survey', images: [] },
  twitter: { title: 'Researcher Validation — EDDA Survey', images: [] },
};
export default function Page() {
  return <ResearchWorkspace view="validation" />;
}
