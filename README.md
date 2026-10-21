# P2P Carsharing

A peer-to-peer car rental platform where owners list their vehicles and renters can find and book them online.

**Live:** [lunar-carsharing-app.vercel.app](https://lunar-carsharing-app.vercel.app)  
**API:** [p2p-carsharing-api.onrender.com](https://p2p-carsharing-api.onrender.com)

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
NEXT_PUBLIC_API_URL=https://p2p-carsharing-api.onrender.com/api/v1
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

- Backend: NestJS, Prisma, PostgreSQL, JWT auth (maintained in a separate private repository).

## Demo availability

The `Portfolio demo health` Actions workflow checks this API and the companion
Online Booking demo every 10 minutes. Both checks execute a read-only database
query. A failed database check fails the workflow even if the HTTP status is 200.
No credentials, booking records or other customer data are logged.

Run it manually from the Actions tab to check or wake the demos before sharing them.
This is best-effort monitoring, not an uptime guarantee: GitHub scheduled jobs can
be delayed or dropped, and public-repository schedules are disabled after 60 days
without repository activity. Free hosting quotas still apply. For guaranteed
avoidance of idle suspension, use an always-on hosting plan.
