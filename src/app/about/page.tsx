import type { Metadata } from 'next';
import AboutScreen from '@/components/about/AboutScreen';

export const metadata: Metadata = { title: 'Sobre Nosotros — Novu' };

export default function AboutPage() {
  return <AboutScreen />;
}
