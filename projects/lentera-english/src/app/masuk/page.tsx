import { AuthForm } from '@/components/AuthForm';

export const metadata = { title: 'Masuk' };
export default function Page() {
  return <AuthForm mode="signin" />;
}
