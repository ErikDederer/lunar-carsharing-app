import { redirect } from 'next/navigation';

// Kept for old links: the booking's own page shows its status and payment.
export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/bookings/${id}`);
}
