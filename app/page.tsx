'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Car, Shield, CreditCard, Clock, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import StarRating from '@/components/atoms/StarRating';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { carService } from '@/services/car.service';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

export default function HomePage() {
  const t = useTranslations('landing');
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: '2,400+', label: t('stats.cars') },
    { value: '18,000+', label: t('stats.trips') },
    { value: '4.8', label: t('stats.rating') },
    { value: '12', label: t('stats.cities') },
  ];

  const steps = [
    { num: '01', title: t('how.step1Title'), desc: t('how.step1Desc') },
    { num: '02', title: t('how.step2Title'), desc: t('how.step2Desc') },
    { num: '03', title: t('how.step3Title'), desc: t('how.step3Desc') },
  ];

  const features = [
    { icon: <Shield size={20} />, title: t('features.f1Title'), desc: t('features.f1Desc') },
    { icon: <Clock size={20} />, title: t('features.f2Title'), desc: t('features.f2Desc') },
    { icon: <MapPin size={20} />, title: t('features.f3Title'), desc: t('features.f3Desc') },
    { icon: <CreditCard size={20} />, title: t('features.f4Title'), desc: t('features.f4Desc') },
  ];

  const { data: carsData } = useQuery({
    queryKey: ['popular-cars'],
    queryFn: () => carService.getAll({ limit: 3 }),
  });
  const cars = carsData?.cars ?? [];
  const heroCarId = cars[0]?.id;

  // Hero entrance: copy rises in line by line, the accent underline draws
  // itself, then the CTA row and social proof follow.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const underline = heroRef.current?.querySelector<SVGPathElement>('[data-underline]');
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero="item"]', { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.09 });
        if (underline) {
          const length = underline.getTotalLength();
          tl.fromTo(
            underline,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
            0.45,
          );
        }
      });
      return () => mm.revert();
    },
    { scope: heroRef },
  );

  // The showcase card arrives once the first car is loaded, then floats.
  useGSAP(
    () => {
      if (!heroCarId) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const card = heroCardRef.current;
        if (!card) return;
        gsap
          .timeline()
          .from(card.querySelector('[data-hero="card"]'), {
            x: 60,
            rotate: 3,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
          })
          .from(
            card.querySelectorAll('[data-hero="chip"]'),
            { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.12 },
            '-=0.4',
          );
        gsap.to(card.querySelector('[data-hero="card"]'), {
          y: -10,
          duration: 2.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1,
        });
        gsap.to(card.querySelectorAll('[data-hero="chip"]'), {
          y: 6,
          duration: 2.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: 0.4,
          delay: 1.2,
        });
      });
      return () => mm.revert();
    },
    { scope: heroCardRef, dependencies: [heroCarId], revertOnUpdate: true },
  );

  const ownerStats = [
    { value: t('owners.stat1Value'), label: t('owners.stat1Label'), sub: t('owners.stat1Sub') },
    { value: t('owners.stat2Value'), label: t('owners.stat2Label'), sub: t('owners.stat2Sub') },
    { value: t('owners.stat3Value'), label: t('owners.stat3Label'), sub: t('owners.stat3Sub') },
    { value: t('owners.stat4Value'), label: t('owners.stat4Label'), sub: t('owners.stat4Sub') },
  ];

  return (
    <div className="min-h-screen bg-bg-card">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-card/90 backdrop-blur-md border-b border-border-default">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-landing-cta-bg flex items-center justify-center">
              <Car size={16} className="text-text-inverse" />
            </div>
            <span className="text-lg font-bold text-text-base">
              P2P<span className="text-brand"> Carsharing</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how"
              className="text-sm text-text-muted hover:text-text-base transition-colors"
            >
              {t('nav.how')}
            </a>
            <a
              href="#cars"
              className="text-sm text-text-muted hover:text-text-base transition-colors"
            >
              {t('nav.cars')}
            </a>
            <a
              href="#owners"
              className="text-sm text-text-muted hover:text-text-base transition-colors"
            >
              {t('nav.owners')}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm text-text-secondary hover:text-text-base transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/login?tab=register"
              className="hidden md:inline-flex bg-landing-cta-bg text-text-base text-sm font-semibold px-4 py-2 rounded-lg hover:bg-landing-cta-hover transition-colors"
            >
              {t('nav.start')}
            </Link>
          </div>
        </div>

        <div className="md:hidden max-w-6xl mx-auto px-6 pb-3 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full text-center text-sm font-semibold text-text-secondary border border-border-default rounded-lg py-2.5 hover:bg-bg-page transition-colors"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/login?tab=register"
            className="w-full text-center bg-landing-cta-bg text-text-base text-sm font-semibold rounded-lg py-2.5 hover:bg-landing-cta-hover transition-colors"
          >
            {t('nav.start')}
          </Link>
        </div>
      </nav>

      <section ref={heroRef} className="pt-44 md:pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                data-hero="item"
                className="inline-flex items-center gap-2 bg-brand-subtle text-landing-cta-text text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand/15"
              >
                <span className="w-2 h-2 rounded-full bg-landing-cta-bg animate-pulse" />
                <AnimatedShinyText className="mx-0 max-w-none text-landing-cta-text via-orange-300" shimmerWidth={120}>
                  {t('hero.badge')}
                </AnimatedShinyText>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-text-base leading-tight tracking-tight mb-6">
                <span data-hero="item" className="inline-block">{t('hero.titleStart')}</span>{' '}
                <span data-hero="item" className="inline-block text-landing-cta-text relative">
                  {t('hero.titleAccent')}
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6">
                    <path
                      data-underline
                      d="M0 5 Q100 0 200 5"
                      stroke="var(--landing-cta-bg)"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                <span data-hero="item" className="inline-block">{t('hero.titleEnd')}</span>
              </h1>

              <p data-hero="item" className="text-lg text-text-muted leading-relaxed mb-8 max-w-lg">
                {t('hero.subtitle')}
              </p>

              <div data-hero="item" className="flex flex-col sm:flex-row gap-3 mb-10">
                <ShimmerButton
                  onClick={() => router.push('/search')}
                  background="var(--brand)"
                  shimmerColor="#fff7ed"
                  shimmerDuration="2.6s"
                  borderRadius="12px"
                  className="gap-2 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition-transform"
                >
                  {t('hero.findCar')}
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </ShimmerButton>
                <Link
                  href="/login?tab=register"
                  className="flex items-center justify-center gap-2 border border-border-default text-text-secondary font-semibold px-6 py-3.5 rounded-xl hover:bg-bg-page transition-colors"
                >
                  {t('hero.rentOut')}
                </Link>
              </div>

              <div data-hero="item" className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['ОВ', 'АП', 'МР', 'ДС'].map((init) => (
                    <div
                      key={init}
                      className="w-8 h-8 rounded-full bg-brand-subtle border-2 border-bg-card flex items-center justify-center text-xs font-bold text-landing-cta-text"
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-0.5">
                    <StarRating value={5} size="sm" readonly />
                  </div>
                  <p className="text-xs text-text-muted">
                    <strong className="text-text-base">18,000+</strong> {t('hero.happyRenters')}
                  </p>
                </div>
              </div>
            </div>

            <div ref={heroCardRef} className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-subtle via-brand-subtle to-orange-100" />
              <div aria-hidden="true" className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
              <div className="relative p-8">
                {cars[0] && (
                <div data-hero="card" className="bg-bg-card rounded-2xl shadow-2xl shadow-brand/10 border border-border-default p-5 mb-4">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-bg-page">
                    {cars[0].mainPhoto && (
                      <Image
                        src={cars[0].mainPhoto}
                        alt={`${cars[0].brand} ${cars[0].model}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-text-base">{cars[0].brand} {cars[0].model} {cars[0].year}</p>
                      <p className="text-sm text-text-muted">{cars[0].address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-landing-cta-text">€{cars[0].pricePerDay}</p>
                      <p className="text-xs text-text-muted">{t('hero.perDay')}</p>
                    </div>
                  </div>
                  <Link
                    href={`/cars/${cars[0].id}`}
                    className="mt-4 w-full flex items-center justify-center bg-landing-cta-bg text-text-base font-semibold py-3 rounded-xl hover:bg-landing-cta-hover transition-colors"
                  >
                    {t('hero.book')}
                  </Link>
                </div>
                )}

                <div data-hero="chip" className="absolute -top-4 -right-4 bg-bg-card rounded-xl shadow-lg border border-border-default px-4 py-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-landing-cta-bg" />
                  <span className="text-xs font-semibold text-text-base">{t('hero.verified')}</span>
                </div>

                <div data-hero="chip" className="absolute -bottom-4 -left-4 bg-bg-card rounded-xl shadow-lg border border-border-default px-4 py-3">
                  <p className="text-xs text-text-muted">{t('hero.responseTime')}</p>
                  <p className="text-xs font-semibold text-text-base">{t('hero.responseValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg-page border-y border-border-default">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-text-base mb-1 tabular-nums">
                  <CountUp value={value} />
                </p>
                <p className="text-sm text-text-muted">{label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="how" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-landing-cta-text uppercase tracking-widest mb-3">
              {t('how.label')}
            </p>
            <h2 className="text-4xl font-bold text-text-base mb-4">{t('how.title')}</h2>
            <p className="text-text-muted max-w-md mx-auto">{t('how.subtitle')}</p>
          </div>

          <Reveal className="grid md:grid-cols-3 gap-8" stagger={0.15}>
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="group">
                <div className="w-12 h-12 rounded-2xl bg-brand-subtle flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <span className="text-lg font-bold text-landing-cta-text">{num}</span>
                </div>
                <h3 className="text-xl font-bold text-text-base mb-2">{title}</h3>
                <p className="text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="cars" className="py-20 px-6 bg-bg-page">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold text-landing-cta-text uppercase tracking-widest mb-3">
                {t('popular.label')}
              </p>
              <h2 className="text-4xl font-bold text-text-base">{t('popular.title')}</h2>
            </div>
            <Link
              href="/search"
              className="hidden md:flex items-center gap-1 text-sm text-landing-cta-text font-semibold hover:gap-2 transition-all"
            >
              {t('popular.viewAll')} <ChevronRight size={16} />
            </Link>
          </div>

          <Reveal className="grid md:grid-cols-3 gap-6" watch={cars.map((c) => c.id).join()}>
            {cars.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="bg-bg-card rounded-2xl border border-border-default overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-brand transition-all duration-300 group"
              >
                <div className="relative aspect-video overflow-hidden bg-bg-page">
                  {car.mainPhoto && (
                    <Image
                      src={car.mainPhoto}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-bold text-text-base">{car.brand} {car.model}</p>
                    <p className="text-lg font-bold text-landing-cta-text">
                      €{car.pricePerDay}
                      <span className="text-xs font-normal text-text-muted">{t('hero.perDay')}</span>
                    </p>
                  </div>
                  <p className="text-sm text-text-muted mb-3">
                    {car.address} · {car.year} · {car.fuelType}
                  </p>
                </div>
              </Link>
            ))}
          </Reveal>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm text-landing-cta-text font-semibold"
            >
              {t('popular.viewAllMobile')} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-landing-cta-text uppercase tracking-widest mb-3">
              {t('features.label')}
            </p>
            <h2 className="text-4xl font-bold text-text-base">{t('features.title')}</h2>
          </div>

          <Reveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.1}>
            {features.map(({ icon, title, desc }) => (
              <SpotlightCard
                key={title}
                className="p-6 rounded-2xl border border-border-default bg-bg-card hover:border-brand/60"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center text-landing-cta-bg mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-text-base mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </SpotlightCard>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="owners" className="py-20 px-6 bg-landing-dark-bg">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-landing-cta-bg uppercase tracking-widest mb-4">
                {t('owners.label')}
              </p>
              <h2 className="text-4xl font-bold text-landing-dark-text mb-6">
                {t('owners.title')}
              </h2>
              <p className="text-landing-dark-muted leading-relaxed mb-8">{t('owners.subtitle')}</p>
              <Reveal className="flex flex-col gap-3 mb-8" stagger={0.12}>
                {[t('owners.benefit1'), t('owners.benefit2'), t('owners.benefit3')].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-landing-cta-bg shrink-0" />
                    <span className="text-landing-dark-muted text-sm">{item}</span>
                  </div>
                ))}
              </Reveal>
              <Link
                href="/login?tab=register"
                className="inline-flex items-center gap-2 bg-landing-cta-bg text-text-base font-semibold px-6 py-3.5 rounded-xl hover:bg-landing-cta-hover transition-colors"
              >
                {t('owners.addCar')}
                <ChevronRight size={18} />
              </Link>
            </div>

            <Reveal className="grid grid-cols-2 gap-4" stagger={0.1}>
              {ownerStats.map(({ value, label, sub }) => (
                <div
                  key={label}
                  className="bg-landing-dark-card border border-landing-dark-border rounded-2xl p-5 transition-colors duration-300 hover:border-landing-cta-bg/50 hover:bg-white/[0.08]"
                >
                  <p className="text-2xl font-bold text-landing-cta-bg mb-1 tabular-nums">
                    <CountUp value={value} />
                  </p>
                  <p className="text-sm font-semibold text-landing-dark-text mb-1">{label}</p>
                  <p className="text-xs text-landing-dark-muted">{sub}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-landing-cta-bg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-text-base mb-4">{t('cta.title')}</h2>
          <p className="text-text-base mb-8 text-lg">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 bg-bg-card text-landing-cta-text font-bold px-8 py-4 rounded-xl hover:bg-bg-page transition-colors"
            >
              {t('cta.findCar')}
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/login?tab=register"
              className="flex items-center justify-center gap-2 bg-landing-cta-btn-bg text-text-base font-bold px-8 py-4 rounded-xl hover:bg-landing-cta-btn-hover transition-colors border border-landing-cta-btn-border"
            >
              {t('cta.register')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
