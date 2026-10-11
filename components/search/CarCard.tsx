import { Car as CarIcon } from 'lucide-react';
import Link from 'next/link';
import type { Car } from '@/types/car';

interface CarCardProps {
  car: Car;
  noReviewsLabel: string;
  perDayLabel: string;
}

export function CarCard({ car, perDayLabel }: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group bg-bg-card border border-border-default rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_12px_32px_-8px_rgba(234,124,17,0.28)] motion-reduce:hover:translate-y-0"
    >
      <div className="w-full aspect-video bg-brand-subtle rounded-lg flex items-center justify-center text-brand overflow-hidden">
        {car.mainPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.mainPhoto}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <CarIcon size={32} />
        )}
      </div>
      <p className="text-sm font-medium text-text-base truncate transition-colors group-hover:text-brand">
        {car.brand} {car.model}
      </p>
      <p className="text-xs text-text-muted truncate">
        {car.year} · {car.address}
      </p>
      <p className="text-sm font-semibold text-brand">€{car.pricePerDay}{perDayLabel}</p>
    </Link>
  );
}
