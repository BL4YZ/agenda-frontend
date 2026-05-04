import type { Metadata } from 'next';
import AboutScreen from '@/components/about/AboutScreen';

export const metadata: Metadata = { title: 'Sobre Nosotros — MiAgenda' };

export default function AboutPage() {
  return <AboutScreen />;
}
