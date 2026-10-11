import { redirect } from 'next/navigation';

// Notifications are sent by e-mail; an in-app inbox is not built yet.
export default function NotificationsPage() {
  redirect('/bookings');
}
