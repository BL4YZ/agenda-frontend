export type ShopTheme = 'violet' | 'rose' | 'green' | 'cyan' | 'amber' | 'bw';
export type ShopFont  = 'editorial' | 'playfair' | 'bebas' | 'oswald' | 'elegant' | 'dm-serif' | 'raleway' | 'modern' | 'montserrat' | 'nunito' | 'lora' | 'poppins' | null;
export type ShopPlan  = 'gratis' | 'pro' | 'negocio';

export interface Service {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  brand?: string;
  price: number;
  image_url?: string;
  badge?: string;
  description?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role?: string;
  bio?: string;
  years_experience?: number;
  instagram_handle?: string;
  avatar_url?: string;
}

export interface Review {
  id: number;
  author_name: string;
  author_initial?: string;
  stars: number;
  text: string;
  date_label?: string;
}

export interface BusinessHour {
  day_of_week: number;
  day_label: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
  is_today: boolean;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface Branch {
  id: number;
  name: string;
  address?: string | null;
}

export interface GalleryImage {
  id: number;
  image_url: string;
  caption?: string;
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  eyebrow?: string;
  lede?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram_url?: string;
  tiktok_url?: string;
  rating?: number | null;
  review_count?: number;
  logo_url?: string | null;
  cover_url?: string | null;
  about_image_url?: string | null;
  about_quote?: string;
  theme: ShopTheme;
  font?: ShopFont;
  plan: ShopPlan;
  brand_color?: string | null;
  lat?: number | null;
  lng?: number | null;
  founded_year?: number | null;
  payment_mode: 'disabled' | 'deposit' | 'full';
  deposit_percentage?: number;
  mp_connected: boolean;
  services: Service[];
  products: Product[];
  team: TeamMember[];
  reviews: Review[];
  hours: BusinessHour[];
  faqs: Faq[];
  gallery: GalleryImage[];
  branches: Branch[];
}

export interface ModalBookingState {
  serviceId: number | null;
  serviceName: string;
  servicePrice: number;
  employeeId: number | null;
  employeeName: string;
  date: string;
  slot: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}
