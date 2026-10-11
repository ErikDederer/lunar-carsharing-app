import { notFound } from 'next/navigation';

// Internal component showcase — only reachable in local development.
export default function UaKitLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
