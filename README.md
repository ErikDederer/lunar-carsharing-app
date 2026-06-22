# P2P Carsharing

A peer-to-peer car rental platform where owners list their vehicles and renters can find and book them online.

**Live:** [lunar-carsharing-app.vercel.app](https://lunar-carsharing-app.vercel.app)  
**API:** [lunar-carsharing-api-ed2j.onrender.com](https://lunar-carsharing-api-ed2j.onrender.com)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand, TanStack Query |
| Maps | Leaflet, react-leaflet |
| i18n | next-intl (EN / DE / RU) |
| Deployment | Vercel |

---

## Features

- JWT authentication with refresh tokens
- Car listings with photos and map geolocation
- Search with filters: dates, fuel type, transmission, price, radius on map
- Detect current location when searching or adding a car
- Booking flow with date selection
- Incoming booking management for owners
- User profile with avatar upload
- Car availability management via slot calendar
- Three languages: English, German, Russian

---

## Getting Started

```bash
git clone https://github.com/ErikDederer/lunar-carsharing-app.git
cd lunar-carsharing-app
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://lunar-carsharing-api-ed2j.onrender.com/api/v1
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/                  # Pages (Next.js App Router)
components/
  atoms/              # Base UI components (Input, Button, Map...)
  cars/               # Car-related components
  layout/             # Header, Footer, navigation
hooks/                # useSearchPage, useCarForm, etc.
services/             # API clients (auth, car, booking...)
store/                # Zustand stores (auth, settings)
messages/             # Translations (en, de, ru)
```

---

## Related

- [Backend (NestJS)](https://github.com/ErikDederer/lunar-carsharing-api) — REST API, Prisma, PostgreSQL, JWT auth
