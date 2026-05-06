import type { Metadata } from 'next';
import ContactScreen from '@/components/contact/ContactScreen';

export const metadata: Metadata = { title: 'Contacto — MiAgenda' };

export default function ContactPage() {
  return <ContactScreen />;
}
