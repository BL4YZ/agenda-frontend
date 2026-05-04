import { redirect } from 'next/navigation';

// /signup → canonical route is /register
export default function SignupPage() {
  redirect('/register');
}
